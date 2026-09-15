import unittest
from collections import Counter
import weekly
class WeeklyTests(unittest.TestCase):
 def test_standard(self):
  rows=weekly.generate('2026-W38')
  self.assertEqual(Counter(r['medium'] for r in rows),{'Static':250,'Video':250})
  self.assertEqual(len({r['id'] for r in rows}),500)
  self.assertEqual(Counter(r['persona'] for r in rows),dict(carla=160,ben=140,tyler=60,casey=60,frankie=40,wendy=40))
  self.assertEqual(weekly.markdown('2026-W38',rows).count('\n### '),500)
 def test_routes_and_video(self):
  for r in weekly.generate('2026-W38'):
   self.assertTrue(r['instructions'])
   self.assertNotIn('{scene}',r['instructions'])
   if r['persona']=='wendy':self.assertTrue(r['url'].endswith('/options-pricing'))
   if r['medium']=='Video':self.assertIn(r['seconds'],[10,12,15,18,20])
 def test_no_fake_freshness(self):
  a=weekly.generate('2026-W38');b=weekly.generate('2026-W39')
  self.assertEqual({r['id'] for r in a},{r['id'] for r in b})
  with self.assertRaises(ValueError):weekly.generate('2026-W99')
if __name__=='__main__':unittest.main()
