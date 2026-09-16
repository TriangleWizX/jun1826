#!/usr/bin/env python3
import sys
import unittest
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.resolve()
sys.path.insert(0, str(BASE_DIR))

from mcp.lib.prompt_catalog import PromptCatalog

class TestPromptCatalog(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = PromptCatalog()

    def test_catalog_loaded(self):
        self.assertGreater(len(self.catalog.prompts), 0, "Catalog should load exported prompts")

    def test_search_prompts(self):
        results = self.catalog.search_prompts("Python", limit=5)
        self.assertIsInstance(results, list)

    def test_get_prompt_by_title_or_uuid(self):
        if self.catalog.prompts:
            first = self.catalog.prompts[0]
            title = first.get("title")
            if title:
                found = self.catalog.get_prompt(title)
                self.assertIsNotNone(found)
                self.assertEqual(found.get("title"), title)

    def test_template_rendering(self):
        if self.catalog.prompts:
            first = self.catalog.prompts[0]
            title = first.get("title")
            if title:
                rendered = self.catalog.render_template(title, {"test_var": "val"})
                self.assertIsNotNone(rendered)

if __name__ == "__main__":
    unittest.main()
