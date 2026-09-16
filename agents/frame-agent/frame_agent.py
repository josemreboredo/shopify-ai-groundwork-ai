"""
LWC Frame Agent
===============
Reads a plain-language client brief (string or file), asks up to 5 clarifying
questions via stdout/stdin, then produces a filled-in store-spec.yaml in the
client project directory.

On completion it performs exit-trigger evaluation and either:
  - Writes the spec and prints a GO summary, or
  - Prints a STOP message with the exit reason and does NOT write the spec.

Usage:
    python agents/frame-agent/frame_agent.py --brief "path/to/brief.txt"
    python agents/frame-agent/frame_agent.py --brief "Inline brief text here"
    python agents/frame-agent/frame_agent.py --interactive   # guided Q&A from scratch
    python agents/frame-agent/frame_agent.py --questionnaire docs/discovery/acme-questionnaire.md

Dependencies:
    pip install anthropic pyyaml rich
    ANTHROPIC_API_KEY must be set in environment (not committed — read from .env)
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import json
from datetime import date
from pathlib import Path
from typing import Any

import yaml
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

# ---------------------------------------------------------------------------
# Optional: load .env if python-dotenv is available
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

console = Console()

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
SCHEMA_PATH = Path(__file__).parent.parent.parent / "lwc-library" / "store-spec.schema.yaml"
OUTPUT_DIR = Path(__file__).parent.parent.parent / "clients"

SYSTEM_PROMPT = """You are the Frame Agent for the LWC (Lightweight Commerce) biota at Merkle DACH.
Your job is to interview a consultant about a prospective Shopify store project and extract
structured information to populate a store-spec.yaml.

Rules:
1. Be concise and direct. The consultant is technical enough to understand Shopify terms.
2. Ask at most 5 clarifying questions total. Prioritise the highest-ambiguity fields.
3. Never ask about things you can infer confidently from the brief.
4. When you have enough information, output ONLY a valid JSON object matching the store-spec
   structure. No prose before or after the JSON block.
5. Apply the LWC tier logic:
   - Starter: 1 market, ≤3 languages, no custom integrations, ≤15 components
   - Medium: 2–3 markets, Shopify Markets + multicurrency, Adyen optional, ≤18 components
   - Large: 4–5 markets, bespoke component library, up to 3 custom integrations

Exit trigger logic (set exits.triggered = true and populate exits.reasons):
  - markets.count > 5 → "EXIT: More than 5 markets at launch — exits to Scale programme"
  - total languages > 6 → "EXIT: More than 6 languages — exits to Scale programme"
  - catalogue.variant_options_max > 3 → "EXIT: More than 3 variant options — architecture review required"
  - integrations.count > 3 → "EXIT: More than 3 custom integrations — exits to bespoke quote"
  - catalogue.has_b2b and b2b requires RFQ → "EXIT: B2B RFQ workflow — exits to composable platform"
  - payments.checkout_type == 'custom_checkout' → "EXIT: Custom checkout — exits to composable"
  - client.shopify_plan != 'plus' and tier == 'large' → "EXIT: Large tier requires Shopify Plus"

Output the JSON only — no markdown fences, no explanation."""

QUESTIONNAIRE_SYSTEM_PROMPT = """You are the Frame Agent for the shopify-ai-builder delivery system.
Your input is a completed Shopify discovery questionnaire (§ 0–11 format). Extract ALL
structured information from it and produce a filled-in store-spec JSON.

Questionnaire section → spec field mapping:
  § 0  (business problems & blockers) → brief.primary_problem, brief.goals_12m, brief.budget
  § 1  (business & brand)             → client.name, client.slug, client.shopify_plan, client.industry
  § 2  (catalogue & products)         → catalogue.sku_count, catalogue.variant_options_max,
                                        catalogue.has_bundles, catalogue.has_b2b
  § 3  (markets & internationalisation) → markets.count, markets.list, markets.languages
  § 4  (payments & checkout)          → payments.providers, payments.checkout_type
  § 5  (shipping & fulfilment)        → shipping.providers, shipping.has_3pl
  § 6  (customer & account)           → customers.has_b2b, customers.has_loyalty,
                                        customers.has_portal
  § 7  (marketing & analytics)        → marketing.email_platform, marketing.has_ga4,
                                        marketing.tracking_stack
  § 8  (integrations & tech stack)    → integrations.count, integrations.list
  § 9  (design & UX)                  → design.theme, design.has_figma, design.has_motion
  § 10 (operations & timeline)        → delivery.launch_date, delivery.team_size
  § 11 (exit-trigger screening)       → exits.triggered, exits.reasons

Exit trigger rules (from § 11 — evaluate STRICTLY):
  11.1 Shopify Plus feature on non-Plus plan        → STOP: "Plus plan required"
  11.2 B2B with RFQ / negotiated pricing            → STOP: "B2B RFQ — Plus required"
  11.3 markets.count > 5                            → STOP: ">5 markets — Scale programme"
  11.4 languages > 6                                → STOP: ">6 languages — Scale programme"
  11.5 variant_options_max > 3                      → STOP: "Variant depth — architecture review"
  11.6 Custom checkout (non-extensibility)          → STOP: "Custom checkout — composable platform"
  11.7 integrations.count > 3                       → STOP: ">3 integrations — bespoke quote"
  11.8 Regulated industry (pharma, firearms, etc.)  → STOP: "Regulated industry — legal review"
  11.9 PCI scope beyond Shopify Payments            → STOP: "PCI scope — security review"
  11.10 GDPR/CCPA data deletion workflow            → FLAG (not a hard stop; note in risks)
  11.11 Grow retainer not signed (M/L tier)         → WARNING (quote +25%)

Tier classification:
  Starter (S): 1 market, ≤3 languages, no custom integrations, 0–1 scope gates
  Medium  (M): 2–3 markets, Shopify Markets + multicurrency, ≥2 scope gates
  Large   (L): Luxury/enterprise brand, headless/Hydrogen, full Figma design system

Rules:
1. Extract answers from the questionnaire as written — do NOT invent or assume values
   that are not present. Use null for unanswered fields.
2. If a § 11 hard stop fires, set exits.triggered = true, populate exits.reasons,
   and set delivery.go = false.
3. Output ONLY a valid JSON object. No markdown fences, no explanation, no prose."""

QUESTIONNAIRE_USER_PROMPT = """Here is the completed discovery questionnaire. Extract the
spec and evaluate all exit triggers:

{questionnaire}
"""

CLARIFY_PROMPT = """Based on the brief below, ask your clarifying questions (max 5, one at a time
is fine if there are fewer). If you already have enough information, output the JSON directly.

Brief:
{brief}
"""


# ---------------------------------------------------------------------------
# Tier classification logic (local — no LLM needed for this)
# ---------------------------------------------------------------------------

def classify_tier(spec: dict) -> tuple[str, str, str]:
    """Return (tier, price_band_chf, rationale)."""
    markets = spec.get("markets", {})
    integrations = spec.get("integrations", {})
    market_count = markets.get("count", 1)
    lang_count = sum(
        len(m.get("languages", [])) for m in markets.get("market_list", [])
    )
    integration_count = integrations.get("count", 0)
    components = spec.get("components", {})
    custom_components = components.get("custom_components", [])

    if (
        market_count >= 4
        or integration_count >= 2
        or len(custom_components) > 0
    ):
        return "large", "100000-150000", (
            f"{market_count} markets, {integration_count} integrations, "
            f"{len(custom_components)} custom components → Large"
        )
    elif (
        market_count >= 2
        or lang_count > 3
        or spec.get("payments", {}).get("provider") == "adyen"
    ):
        return "medium", "70000-100000", (
            f"{market_count} markets, {lang_count} languages → Medium (lead tier)"
        )
    else:
        return "starter", "45000-70000", (
            "1 market, single currency, standard components → Starter"
        )


# ---------------------------------------------------------------------------
# Exit trigger evaluation
# ---------------------------------------------------------------------------

def evaluate_exits(spec: dict) -> tuple[bool, list[str]]:
    """Return (triggered, reasons)."""
    reasons = []
    markets = spec.get("markets", {})
    catalogue = spec.get("catalogue", {})
    payments = spec.get("payments", {})
    integrations = spec.get("integrations", {})

    market_count = markets.get("count", 1)
    lang_count = sum(
        len(m.get("languages", [])) for m in markets.get("market_list", [])
    )

    if market_count > 5:
        reasons.append("EXIT: More than 5 markets at launch — exits to Scale programme")
    if lang_count > 6:
        reasons.append("EXIT: More than 6 languages — exits to Scale programme")
    if catalogue.get("variant_options_max", 1) > 3:
        reasons.append("EXIT: More than 3 variant options per product — architecture review required")
    if integrations.get("count", 0) > 3:
        reasons.append("EXIT: More than 3 custom integrations — exits to bespoke quote")
    if catalogue.get("has_b2b") and "rfq" in catalogue.get("b2b_notes", "").lower():
        reasons.append("EXIT: B2B RFQ workflow detected — exits to composable platform")
    if payments.get("checkout_type") == "custom_checkout":
        reasons.append("EXIT: Custom checkout requested — exits to composable")
    tier = spec.get("tier", {}).get("selected", "starter")
    if tier == "large" and spec.get("client", {}).get("shopify_plan", "plus") != "plus":
        reasons.append("EXIT: Large tier requires Shopify Plus plan")

    return bool(reasons), reasons


# ---------------------------------------------------------------------------
# LLM interaction (Claude via Anthropic SDK)
# ---------------------------------------------------------------------------

def call_claude(messages: list[dict], system: str) -> str:
    """Call Claude and return the assistant's text response."""
    try:
        import anthropic
    except ImportError:
        console.print("[red]anthropic package not installed. Run: pip install anthropic[/red]")
        sys.exit(1)

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        console.print("[red]ANTHROPIC_API_KEY not set in environment[/red]")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        system=system,
        messages=messages,
    )
    return response.content[0].text.strip()


# ---------------------------------------------------------------------------
# Interactive Q&A loop
# ---------------------------------------------------------------------------

def run_interactive_session(brief: str) -> dict:
    """
    Drive a multi-turn conversation with Claude to extract the spec fields.
    Returns the parsed spec dict.
    """
    messages: list[dict] = []

    # Seed with the brief
    messages.append({
        "role": "user",
        "content": CLARIFY_PROMPT.format(brief=brief)
    })

    while True:
        response = call_claude(messages, SYSTEM_PROMPT)
        messages.append({"role": "assistant", "content": response})

        # Check if Claude output JSON (spec complete)
        stripped = response.strip()
        if stripped.startswith("{"):
            try:
                spec = json.loads(stripped)
                return spec
            except json.JSONDecodeError:
                pass

        # Otherwise, Claude asked a question — show it and get the answer
        console.print(Panel(response, title="[cyan]Frame Agent[/cyan]", border_style="cyan"))
        answer = console.input("[bold]Your answer:[/bold] ").strip()
        if not answer:
            answer = "(no answer provided)"
        messages.append({"role": "user", "content": answer})


# ---------------------------------------------------------------------------
# Spec post-processing
# ---------------------------------------------------------------------------

def post_process_spec(spec: dict, brief: str) -> dict:
    """Apply tier classification, exit evaluation, and defaults."""
    # Tier
    tier, price_band, rationale = classify_tier(spec)
    spec.setdefault("tier", {})
    spec["tier"]["selected"] = tier
    spec["tier"]["price_band_chf"] = price_band
    spec["tier"]["rationale"] = rationale

    # Exits
    triggered, reasons = evaluate_exits(spec)
    spec.setdefault("exits", {})
    spec["exits"]["triggered"] = triggered
    spec["exits"]["reasons"] = reasons

    # Delivery defaults
    spec.setdefault("delivery", {})
    if not spec["delivery"].get("kickoff_date"):
        spec["delivery"]["kickoff_date"] = date.today().isoformat()

    return spec


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

SLUG_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{0,62}$")


def safe_client_slug(raw: Any) -> str:
    """
    Validate the client slug before it is used as a directory name.
    The slug comes from LLM output, so it must never be able to escape clients/.
    """
    slug = str(raw or "").strip().lower()
    if not SLUG_PATTERN.fullmatch(slug):
        raise ValueError(
            f"Invalid client slug {slug!r} — expected kebab-case [a-z0-9-], e.g. 'acme-watches'."
        )
    return slug


def write_spec(spec: dict, client_slug: str) -> Path:
    """Write store-spec.yaml to clients/<slug>/store-spec.yaml."""
    output_path = OUTPUT_DIR / safe_client_slug(client_slug) / "store-spec.yaml"
    if OUTPUT_DIR.resolve() not in output_path.resolve().parents:
        raise ValueError(f"Refusing to write outside {OUTPUT_DIR}: {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        yaml.dump(spec, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
    return output_path


def print_summary(spec: dict, output_path: Path | None) -> None:
    """Print a human-readable delivery summary."""
    exits = spec.get("exits", {})
    tier = spec.get("tier", {})
    client = spec.get("client", {})
    markets = spec.get("markets", {})

    if exits.get("triggered"):
        console.print(Panel(
            "\n".join(f"🚫 {r}" for r in exits["reasons"]),
            title="[red bold]⛔  DELIVERY BLOCKED — EXIT TRIGGERED[/red bold]",
            border_style="red",
        ))
        console.print("[red]Spec NOT written. Resolve the above before proceeding.[/red]")
        return

    # GO summary
    t = Table(show_header=False, box=None, padding=(0, 2))
    t.add_column(style="bold cyan")
    t.add_column()
    t.add_row("Client", client.get("name", "—"))
    t.add_row("Tier", tier.get("selected", "—").upper())
    t.add_row("Price band", f"CHF {tier.get('price_band_chf', '—')}")
    t.add_row("Markets", str(markets.get("count", 1)))
    t.add_row("Rationale", tier.get("rationale", "—"))
    if output_path:
        t.add_row("Spec written", str(output_path))

    console.print(Panel(t, title="[green bold]✅  GO — LWC DELIVERY CLEARED[/green bold]", border_style="green"))

    # Grow retainer warning
    delivery = spec.get("delivery", {})
    if tier.get("selected") in ("medium", "large") and not delivery.get("grow_retainer_signed"):
        console.print(Panel(
            "⚠️  [yellow]Grow retainer not yet signed.[/yellow]\n"
            "Medium and Large tier pricing assumes a 12-month Grow retainer in the same contract.\n"
            "Without it, the client must be quoted at list price +25% (bespoke).\n"
            "Lock this with Finance/Sales before the first invoice.",
            title="[yellow]WARNING — Grow Retainer[/yellow]",
            border_style="yellow",
        ))


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="LWC Frame Agent — classify a Shopify brief")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--brief", help="Path to a brief .txt file, or inline brief text")
    group.add_argument("--interactive", action="store_true", help="Start from scratch with guided Q&A")
    group.add_argument("--questionnaire", help="Path to a completed § 0–11 discovery questionnaire (.md)")
    parser.add_argument("--dry-run", action="store_true", help="Print spec to stdout; do not write file")
    args = parser.parse_args()

    # Load brief
    if args.questionnaire:
        q_path = Path(args.questionnaire)
        if not q_path.exists():
            console.print(f"[red]Questionnaire file not found: {q_path}[/red]")
            sys.exit(1)
        questionnaire_text = q_path.read_text(encoding="utf-8")
        console.print(f"[cyan]Reading questionnaire: {q_path.name}[/cyan]")
        messages = [
            {"role": "user", "content": QUESTIONNAIRE_USER_PROMPT.format(questionnaire=questionnaire_text)}
        ]
        raw = call_claude(messages, QUESTIONNAIRE_SYSTEM_PROMPT)
        # Strip accidental markdown fences
        raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        try:
            spec = json.loads(raw)
        except json.JSONDecodeError as exc:
            console.print(f"[red]Frame Agent returned invalid JSON: {exc}[/red]")
            console.print(raw)
            sys.exit(1)
        spec = post_process_spec(spec, questionnaire_text)

    elif args.interactive:
        brief = ""
        console.print(Panel(
            "Describe the project. Include: client name, industry, target markets, "
            "catalogue size, any known integrations, and launch timeline.",
            title="[cyan]LWC Frame Agent — Project Brief[/cyan]",
            border_style="cyan",
        ))
        brief = console.input("[bold]Brief:[/bold] ").strip()
        if not brief:
            console.print("[red]No brief provided. Exiting.[/red]")
            sys.exit(1)

        console.print("[cyan]Analysing brief...[/cyan]")
        spec = run_interactive_session(brief)
        spec = post_process_spec(spec, brief)
    else:
        brief_path = Path(args.brief)
        if brief_path.exists():
            brief = brief_path.read_text(encoding="utf-8")
        else:
            brief = args.brief  # treat as inline text

        if not brief.strip():
            console.print("[red]No brief provided. Exiting.[/red]")
            sys.exit(1)

        # Run LLM session
        console.print("[cyan]Analysing brief...[/cyan]")
        spec = run_interactive_session(brief)

        # Post-process
        spec = post_process_spec(spec, brief)

    # Write or dry-run — a STOP spec is never written (exit triggers block delivery)
    client_slug = (spec.get("client") or {}).get("slug") or "unknown-client"
    stopped = bool((spec.get("exits") or {}).get("triggered"))
    output_path = None
    if args.dry_run:
        console.print(yaml.dump(spec, allow_unicode=True, sort_keys=False))
    elif not stopped:
        try:
            output_path = write_spec(spec, client_slug)
        except ValueError as exc:
            console.print(f"[red]{exc}[/red]")
            sys.exit(1)

    # Print summary
    print_summary(spec, output_path)


if __name__ == "__main__":
    main()
