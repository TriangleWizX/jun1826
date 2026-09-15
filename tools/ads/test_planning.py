"""Run python -m unittest test_planning.py from this folder."""
import unittest
from types import SimpleNamespace
from collections import Counter
import ads

def args(count=150,personas=None):
    return SimpleNamespace(count=count,personas=personas,week='2026-W38')

class PlanningTests(unittest.TestCase):
    def test_default_allocation_and_ian_lens(self):
        jobs=ads.build_plan(args())
        self.assertEqual(Counter(j['concept']['persona_id'] for j in jobs),dict(carla=48,ben=42,tyler=18,casey=18,frankie=12,wendy=12))
        self.assertNotIn('ian',{j['concept']['persona_id'] for j in jobs})
        self.assertEqual(jobs,ads.build_plan(args()))
    def test_visitor_has_different_offer_and_destination(self):
        for job in ads.build_plan(args(6,['wendy'])):
            self.assertEqual(job['persona']['offer_id'],'visitor')
            self.assertEqual(job['persona']['destination'],'/options-pricing')
            self.assertNotIn('FREE',job['persona']['cta'])
    def test_capacity_and_no_duplicate_jobs(self):
        jobs=ads.build_plan(args(200))
        self.assertEqual(len(jobs),200)
        self.assertEqual(len({(j['concept']['id'],j['layout'],j['format']) for j in jobs}),200)
    def test_invalid_and_experience_only_requests(self):
        for request in [args(0),args(201),args(1,['ian']),args(1,['unknown']),args(150,['wendy'])]:
            with self.assertRaises(ValueError): ads.build_plan(request)
    def test_small_preview(self):
        self.assertEqual(len(ads.build_plan(args(1,['ben']))),1)

if __name__=='__main__': unittest.main()
