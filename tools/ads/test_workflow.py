import unittest
from types import SimpleNamespace
import ads,workflow
class WorkflowTests(unittest.TestCase):
 def test_filtered_routes(self):
  jobs=ads.build_plan(SimpleNamespace(count=12,personas=['carla','ben'],series=['first_visit','beginner_questions'],week='test'))
  self.assertEqual({j['concept']['id'] for j in jobs},{'carla-fh01','ben-fh01'})
  self.assertTrue(all(j['concept']['proof_needed'] for j in jobs))
 def test_filtered_capacity(self):
  with self.assertRaises(ValueError): ads.build_plan(SimpleNamespace(count=7,personas=['wendy'],series=['visitor_questions'],week='test'))
 def test_no_ian_buyer(self):
  with self.assertRaises(ValueError): workflow.brief({'questions':[{'persona_id':'ian'}]})

class DeletionTests(unittest.TestCase):
 def test_count_required_before_render(self):
  import subprocess,sys
  result=subprocess.run([sys.executable,str(ads.ROOT/'ads.py'),'render'],capture_output=True,text=True)
  self.assertEqual(result.returncode,2)
  self.assertIn('--count',result.stderr)
 def test_brief_does_not_assign_retention_or_production(self):
  data={'questions':[dict(persona_id='ben',question='Example?',stage='inquiry',evidence='hypothesis',answer='Verify',proof_needed='Actual photo')]}
  text=workflow.brief(data)
  self.assertNotIn('Retention review',text)
  self.assertIn('existing asset',text)
 def test_brief_no_overwrite_and_invalid_input_no_output(self):
  import tempfile,subprocess,sys,json
  from pathlib import Path
  with tempfile.TemporaryDirectory() as d:
   root=Path(d); src=root/'input.json'; out=root/'brief.md'
   src.write_text(json.dumps({'questions':[{'persona_id':'ian'}]}))
   command=[sys.executable,str(ads.ROOT/'workflow.py'),'--input',str(src),'--output',str(out)]
   self.assertNotEqual(subprocess.run(command,capture_output=True).returncode,0)
   self.assertFalse(out.exists())
   src.write_text(json.dumps({'questions':[]}));out.write_text('keep')
   self.assertNotEqual(subprocess.run(command,capture_output=True).returncode,0)
   self.assertEqual(out.read_text(),'keep')

if __name__=='__main__': unittest.main()
