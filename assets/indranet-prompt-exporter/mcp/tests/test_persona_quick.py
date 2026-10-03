import sys
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))

from mcp.lib.persona_quick import build_result


class TestPersonaQuick(unittest.TestCase):
    def test_single_task_returns_ranked_persona_evidence(self):
        result = build_result("Write a Python script to parse CSV data", BASE_DIR / "exports")
        self.assertEqual(result["mode"], "persona")
        self.assertIsNotNone(result["selection"]["selected"])
        self.assertIn("python", result["selection"]["selected"]["covered"])

    def test_plan_returns_persona_and_instruction_asset(self):
        result = build_result("Refactor a Python selector and add focused validation", BASE_DIR / "exports", "plan")
        self.assertEqual(result["mode"], "plan")
        self.assertIsNotNone(result["selection"]["selected"])
        self.assertEqual(result["instruction_asset"]["title"], "Instructions - CODE")
        self.assertEqual(result["guidance"]["attachments_loaded"], [])


if __name__ == "__main__":
    unittest.main()
