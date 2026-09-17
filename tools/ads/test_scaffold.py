#!/usr/bin/env python3
"""Unit tests for tools/ads/scaffold.py."""
import unittest
from tools.ads.scaffold import build_scaffold, generate_markdown, LOCAL_ANCHORS, SCHEDULE_SLOTS

class TestScaffold(unittest.TestCase):
    def test_schedule_length(self):
        """Schedule must produce exactly 30 items for a 10x weekly cadence."""
        schedule = build_scaffold("2026-W38")
        self.assertEqual(len(schedule), 30)

    def test_schedule_slots_count(self):
        """Underlying slot definition must be exactly 30 items."""
        self.assertEqual(len(SCHEDULE_SLOTS), 30)

    def test_format_distribution(self):
        """Ensure the target mix: 10 reels/tiktoks, 10 static ads, 7 stories, 3 carousels."""
        schedule = build_scaffold("2026-W38")
        formats = [item['format_type'] for item in schedule]
        reels = sum(1 for f in formats if 'Reel' in f or 'TikTok' in f)
        statics = sum(1 for f in formats if 'Static' in f)
        stories = sum(1 for f in formats if 'Story' in f)
        carousels = sum(1 for f in formats if 'Carousel' in f)

        self.assertEqual(reels, 10)
        self.assertEqual(statics, 10)
        self.assertEqual(stories, 7)
        self.assertEqual(carousels, 3)

    def test_persona_coverage(self):
        """All core avatars (carla, ben, tyler, casey, wendy, frankie, ian) must be scheduled."""
        schedule = build_scaffold("2026-W38")
        personas = set(item['persona_id'] for item in schedule)
        expected = {'carla', 'ben', 'tyler', 'casey', 'wendy', 'frankie', 'ian'}
        self.assertTrue(expected.issubset(personas))

    def test_required_keys_and_utm(self):
        """Each scheduled item must have valid content and UTM links."""
        schedule = build_scaffold("2026-W38")
        for item in schedule:
            for key in ['slot_number', 'day', 'time', 'persona_id', 'persona_name',
                        'platform', 'format_type', 'hook_category', 'hook_id',
                        'hook_template', 'local_anchor', 'local_context', 'cta', 'destination_url']:
                self.assertIn(key, item, f"Missing {key} in item {item['slot_number']}")

            self.assertIn("utm_source=social", item['destination_url'])
            self.assertIn("utm_campaign=ssbjj_2026-W38", item['destination_url'])
            self.assertIn(f"utm_content=post-{item['slot_number']:02d}-{item['persona_id']}", item['destination_url'])

    def test_determinism(self):
        """Running with the same week label must produce deterministic hook choices."""
        sched1 = build_scaffold("2026-W38")
        sched2 = build_scaffold("2026-W38")
        self.assertEqual(sched1, sched2)

    def test_markdown_generation(self):
        """Markdown output must include header, all 7 days, and 30 slots."""
        schedule = build_scaffold("2026-W38")
        md = generate_markdown("2026-W38", schedule)
        self.assertIn("# SSBJJ 10x Weekly Multi-Platform Content Playbook (2026-W38)", md)
        for day in ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']:
            self.assertIn(f"## 📅 {day}", md)
        for item in schedule:
            self.assertIn(f"### #{item['slot_number']:02d}", md)
            self.assertIn(item['hook_template'], md)

    def test_parse_start_date(self):
        """Flexible parser must accept human and ISO date formats."""
        from tools.ads.scaffold import parse_start_date
        from datetime import date
        self.assertEqual(parse_start_date("2026-09-16"), date(2026, 9, 16))
        self.assertEqual(parse_start_date("september 16th", default_year=2026), date(2026, 9, 16))
        self.assertEqual(parse_start_date("starting september 16th", default_year=2026), date(2026, 9, 16))
        self.assertEqual(parse_start_date("starting sept 16", default_year=2026), date(2026, 9, 16))

    def test_start_date_rotation(self):
        """Schedule starting on Wednesday Sep 16 must cycle 7 days to Tuesday Sep 22 with 30 items."""
        schedule = build_scaffold("2026-W38", start_date="2026-09-16")
        self.assertEqual(len(schedule), 30)
        self.assertEqual(schedule[0]['day'], 'Wednesday')
        self.assertEqual(schedule[0]['date'], '2026-09-16')
        self.assertEqual(schedule[-1]['day'], 'Tuesday')
        self.assertEqual(schedule[-1]['date'], '2026-09-22')

        # Check that the format distribution remains invariant
        formats = [item['format_type'] for item in schedule]
        self.assertEqual(sum(1 for f in formats if 'Reel' in f or 'TikTok' in f), 10)
        self.assertEqual(sum(1 for f in formats if 'Static' in f), 10)
        self.assertEqual(sum(1 for f in formats if 'Story' in f), 7)
        self.assertEqual(sum(1 for f in formats if 'Carousel' in f), 3)

if __name__ == '__main__':
    unittest.main()
