"""Unit tests for tools/ads/swipe.py."""
import unittest
from pathlib import Path
import swipe

class SwipeTests(unittest.TestCase):
    def setUp(self):
        self.hooks = swipe.load_hooks()

    def test_total_hooks_count(self):
        self.assertEqual(len(self.hooks), 1929)

    def test_21_categories_present(self):
        categories = {h['category'] for h in self.hooks}
        self.assertEqual(len(categories), 21)
        expected = {
            'Curiosity', 'POV/Relatable', 'Contrarian', 'Story', 'Classic DR',
            'Pattern Interrupt', 'UGC', 'Problem-Aware', 'Social Proof',
            'Authority', 'Listicle', 'Question', 'Fear', 'Urgency',
            'Aspirational', 'Comparison', 'Most-Aware', 'Proof',
            'Solution-Aware', 'Unaware', 'Transformation'
        }
        self.assertEqual(categories, expected)

    def test_hook_structure(self):
        for h in self.hooks[:50]:
            self.assertIn('id', h)
            self.assertIn('category', h)
            self.assertIn('text', h)
            self.assertIn('slots', h)
            self.assertEqual(h['source'], 'k10k.com/swipe-file')

    def test_filtering_by_category(self):
        curiosity_hooks = swipe.filter_hooks(self.hooks, category='Curiosity')
        self.assertEqual(len(curiosity_hooks), 114)
        for h in curiosity_hooks:
            self.assertEqual(h['category'], 'Curiosity')

    def test_filtering_by_search(self):
        found = swipe.filter_hooks(self.hooks, search='shape')
        self.assertGreater(len(found), 0)
        for h in found:
            self.assertTrue('shape' in h['text'].lower() or 'shape' in h['category'].lower())

    def test_persona_adaptation(self):
        sample_hook = {
            'id': 9999,
            'category': 'Problem-Aware',
            'text': 'Tired of [PROBLEM]? You are not alone, [AUDIENCE].',
            'slots': ['PROBLEM', 'AUDIENCE'],
            'source': 'test'
        }
        ben_adapted = swipe.adapt_hook_for_persona(sample_hook, 'ben')
        self.assertIn('feeling out of shape', ben_adapted)
        self.assertIn('adults in the Catskills', ben_adapted)
        self.assertNotIn('[PROBLEM]', ben_adapted)
        self.assertNotIn('[AUDIENCE]', ben_adapted)

        carla_adapted = swipe.adapt_hook_for_persona(sample_hook, 'carla')
        self.assertIn('too much screen time', carla_adapted)
        self.assertIn('local parents', carla_adapted)

    def test_format_hook_markdown(self):
        sample_hook = {
            'id': 101,
            'category': 'Contrarian',
            'text': 'Your [ASSUMED_PROBLEM] is actually a [ROOT_CAUSE] issue.',
            'slots': ['ASSUMED_PROBLEM', 'ROOT_CAUSE'],
            'source': 'test'
        }
        md = swipe.format_hook_markdown(sample_hook, 'ben')
        self.assertIn('[Contrarian] Hook #101', md)
        self.assertIn('not being fit enough to start', md)
        self.assertIn('Beginner Lane', md)

if __name__ == '__main__':
    unittest.main()
