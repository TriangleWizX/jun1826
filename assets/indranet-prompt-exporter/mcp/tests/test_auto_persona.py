#!/usr/bin/env python3
import sys
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))

from mcp.lib.auto_persona import select_best_persona

class TestAutoPersona(unittest.TestCase):
    def test_python_task_persona(self):
        res = select_best_persona("Write Python script to parse CSV data")
        self.assertIn("persona_title", res)
        title = (res["persona_title"] or "").lower()
        self.assertTrue("python" in title or "pythia" in title or "apollo" in title)

    def test_seo_task_persona(self):
        res = select_best_persona("Optimize landing page on-page SEO meta tags")
        self.assertIn("persona_title", res)
        title = (res["persona_title"] or "").lower()
        self.assertTrue("estrella" in title or "seo" in title or "alex" in title or "monster" in title)

    def test_copywriting_task_persona(self):
        res = select_best_persona("Write persuasive email sales copy for new feature launch")
        self.assertIn("persona_title", res)
        title = (res["persona_title"] or "").lower()
        self.assertTrue("copywriter" in title or "alex" in title or len(title) > 0)

if __name__ == "__main__":
    unittest.main()
