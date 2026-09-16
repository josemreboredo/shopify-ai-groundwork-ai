"""
Regression tests for agents/frame-agent/frame_agent.py (Phase 0 fixes).
Stdlib unittest only; the LLM call is mocked — no network.
"""
from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("frame_agent", ROOT / "agents/frame-agent/frame_agent.py")
fa = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fa)


def make_spec(slug: str = "acme-watches", markets: int = 1) -> dict:
    return {
        "client": {"name": "ACME", "slug": slug, "shopify_plan": "plus"},
        "markets": {"count": markets, "market_list": []},
        "catalogue": {"variant_options_max": 1},
        "integrations": {"count": 0},
        "payments": {"checkout_type": "shopify_hosted"},
    }


class SlugTests(unittest.TestCase):
    def test_accepts_kebab_case(self):
        self.assertEqual(fa.safe_client_slug("Acme-Watches"), "acme-watches")

    def test_rejects_traversal_and_absolute_paths(self):
        for bad in ["../../tmp/evil", "/etc", "a/b", "", None, "-leading"]:
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                fa.safe_client_slug(bad)


class MainTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        patcher = mock.patch.object(fa, "OUTPUT_DIR", Path(self.tmp.name))
        patcher.start()
        self.addCleanup(patcher.stop)

    def run_main(self, argv, llm_spec):
        import json
        with mock.patch.object(sys, "argv", ["frame_agent.py", *argv]), \
             mock.patch.object(fa, "call_claude", return_value=json.dumps(llm_spec)), \
             mock.patch.object(fa, "run_interactive_session", return_value=llm_spec), \
             mock.patch.object(fa.console, "input", return_value="A brief"), \
             mock.patch.object(fa.console, "print"):
            fa.main()

    def written(self):
        return list(Path(self.tmp.name).rglob("store-spec.yaml"))

    def test_go_spec_is_written(self):
        q = Path(self.tmp.name) / "q.md"
        q.write_text("# questionnaire", encoding="utf-8")
        self.run_main(["--questionnaire", str(q)], make_spec())
        self.assertEqual(len(self.written()), 1)

    def test_stop_spec_is_not_written(self):
        q = Path(self.tmp.name) / "q.md"
        q.write_text("# questionnaire", encoding="utf-8")
        self.run_main(["--questionnaire", str(q)], make_spec(markets=6))  # > 5 markets → exit
        self.assertEqual(self.written(), [])

    def test_interactive_builds_and_writes_spec(self):
        self.run_main(["--interactive"], make_spec())
        self.assertEqual(len(self.written()), 1)

    def test_malicious_slug_exits_without_writing(self):
        q = Path(self.tmp.name) / "q.md"
        q.write_text("# questionnaire", encoding="utf-8")
        with self.assertRaises(SystemExit):
            self.run_main(["--questionnaire", str(q)], make_spec(slug="../../escape"))
        self.assertEqual(self.written(), [])


if __name__ == "__main__":
    unittest.main()
