# Frame Agent

The first agent in the LWC biota pipeline. Takes a plain-language client brief → outputs a validated `store-spec.yaml` with tier classification and exit-trigger evaluation.

## What it does

1. Reads a client brief (file or inline text)
2. Opens a Claude-powered Q&A session (max 5 clarifying questions)
3. Extracts structured data into the store-spec schema
4. Classifies the project into Starter / Medium / Large
5. Evaluates all exit triggers
6. Either: writes `clients/<slug>/store-spec.yaml` + prints a GO summary
   Or: prints STOP with the exit reason and does NOT write the spec

## Usage

```bash
# From the workspace root
pip install anthropic pyyaml rich python-dotenv

# Pass a brief file
python agents/frame-agent/frame_agent.py --brief docs/briefs/client-a.txt

# Pass inline brief text
python agents/frame-agent/frame_agent.py --brief "Swiss watch brand, 3 markets (CH/DE/AT), German + French + Italian, Adyen payments, no custom integrations, 200 SKUs"

# Fully interactive (guided Q&A from scratch)
python agents/frame-agent/frame_agent.py --interactive

# Dry run — print spec to stdout without writing
python agents/frame-agent/frame_agent.py --brief "..." --dry-run
```

## Environment

```bash
# .env (never commit)
ANTHROPIC_API_KEY=sk-ant-...
```

## Exit triggers

The agent **blocks delivery** and prints a STOP message if any of these fire:

| Condition | Exit destination |
|---|---|
| `markets.count > 5` | Scale programme |
| Total languages > 6 | Scale programme |
| `catalogue.variant_options_max > 3` | Architecture review |
| `integrations.count > 3` | Bespoke quote |
| B2B with RFQ workflow | Composable platform |
| Custom checkout | Composable platform |
| Large tier + no Shopify Plus | Upgrade plan first |

## Output

On GO:
```
clients/
└── <client-slug>/
    └── store-spec.yaml     ← drives all downstream agents
```

On STOP: nothing is written. The consultant resolves the flagged issue and re-runs.

## Grow retainer warning

For Medium and Large tiers, the agent prints a warning if `delivery.grow_retainer_signed: false`. LWC pricing assumes a 12-month Grow retainer in the same contract. Without it, quote at list price +25%.

## Pipeline position

```
Frame Agent → Commerce Agent → Theme Agent → QA Agent
    ↑
    You are here
```
