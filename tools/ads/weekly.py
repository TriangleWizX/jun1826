"""Write 250 static and 250 video concept cards in Markdown."""
import argparse,json,random,re
from datetime import date
from pathlib import Path
ROOT=Path(__file__).resolve().parent
STATIC=[('Photo question','One clear photo of {scene}. Put the question above it and the detail below.'),('Coach answer','A portrait of Sandy next to the question, with the detail in an answer box.'),('Two-photo story','A wide photo and a close detail of {scene}, with the headline between them.'),('Simple drawing','Draw simple outlines of {scene}. Add the question and answer; no student likeness needed.'),('Room invitation','Use a real wide photo of the studio. Put the question in clear space and the answer below.'),('Note card','Put the question and answer on a dark note-shaped card, with a small original logo. No fake chat.'),('Look closer','Use a close detail of {scene}. Point one arrow toward the relevant interaction.'),('Three-part card','Use three areas: the question, a photo of {scene}, and the next action.'),('Contact sheet','Use three photos from the same moment: {scene}. Add the headline once.'),('Handwritten question','Write the question in yellow on a dark board. Photograph Sandy beside it. Add the answer in clean type.')]
VIDEO=[('Coach answers',15,'0–3s: Show the question. 3–11s: Sandy says the detail to camera. 11–15s: Show the next action.'),('Class glimpse',12,'0–3s: Wide view of {scene}. 3–8s: Close view with the detail as captions. 8–12s: Next action.'),('Walk inside',20,'0–5s: Real entrance. 5–14s: Walk into the room and show {scene}, reading the detail. 14–20s: Next action.'),('Off-camera question',15,'0–4s: An adult asks the question off camera. 4–11s: Sandy replies with the detail. 11–15s: Next action.'),('Three still photos',12,'0–4s: Wide photo of {scene}. 4–8s: Detail photo with the answer. 8–12s: Coach photo and next action.'),('Freeze and explain',18,'0–4s: Show {scene}. 4–12s: Freeze a frame while Sandy reads the detail. 12–18s: Resume and show next action.'),('Board answer',15,'0–4s: Write the question on a board. 4–11s: Add the answer as captions. 11–15s: Sandy points to next action.'),('One take',15,'0–3s: Question on screen. 3–11s: Film {scene} without cuts and read the detail. 11–15s: Hold next action.'),('Coach and example',20,'0–4s: Sandy asks the question. 4–15s: Cut to {scene} as he reads the detail. 15–20s: Sandy gives next action.'),('Silent story',10,'0–3s: Question on dark background. 3–7s: Show {scene} with the detail. 7–10s: Next action. No voice needed.')]
LABELS={'carla':'Parents','ben':'Adult beginners','tyler':'Teens and parents','casey':'Community-service adults','frankie':'Families','wendy':'Visitors'}
def generate(week):
 if not re.fullmatch(r'\d{4}-W\d{2}',week):raise ValueError('Use YYYY-Www')
 date.fromisocalendar(int(week[:4]),int(week[-2:]),1)
 topics=json.loads((ROOT/'weekly-topics.json').read_text());personas=json.loads((ROOT/'personas.json').read_text())
 if len(topics)!=25 or len({t['id'] for t in topics})!=25:raise ValueError('Need 25 distinct topics')
 random.Random(week).shuffle(topics);records=[]
 for medium,styles in [('Static',STATIC),('Video',VIDEO)]:
  for t in topics:
   for i,s in enumerate(styles,1):
    r=dict(t);r.update(id=f"{medium[0]}-{t['id']}-{i:02}",medium=medium,style=s[0],instructions=s[-1].format(scene=t['scene']),seconds=s[1] if medium=='Video' else None,cta=personas[t['persona']]['cta'].capitalize(),url='https://senseisandy.com'+personas[t['persona']]['destination']);records.append(r)
 return records

def markdown(week,records):
 lines=[f'# SSBJJ: 500 ad concepts | {week}','','**250 static ideas + 250 video ideas.** Static means one image. Video means a short clip. This file contains concepts, not finished media.','','## How to use this','','1. Pick an audience below.','2. Choose an idea you can make with real photos or footage.','3. Follow Make it or Film it.','4. Check the offer and destination before using it.','','Use the original logo, dark/yellow design and readable words. Use student images only with appropriate permission. Never invent testimonials, discounts, safety guarantees or shared mixed-age classes. The example scenes are capture requests, not verified available assets.','','There are 25 message topics, each with 10 static and 10 video treatments. These are creative variants, not 500 unrelated promises. Changing the week changes the order, not the ideas. Refresh weekly-topics.json with new questions to change the content. Stable IDs identify repeats.','','## Pick an audience','']
 for m in ['Static','Video']:
  for p,label in LABELS.items():lines.append(f'- [{m}: {label}](#{m.lower()}-{p})')
 for m in ['Static','Video']:
  for p,label in LABELS.items():
   lines.extend(['',f'<a id="{m.lower()}-{p}"></a>',f'## {m}: {label}',''])
   for r in records:
    if (r['medium'],r['persona'])!=(m,p):continue
    lines.extend([f"### {r['id']} — {r['style']}",f"- **Main words:** {r['headline']}",f"- **Useful detail:** {r['detail']}"])
    if m=='Video':lines.extend([f"- **Length:** {r['seconds']} seconds",f"- **Say or caption:** {r['headline']} {r['detail']} {r['cta']}."])
    lines.extend([f"- **{'Film it' if m=='Video' else 'Make it'}:** {r['instructions']}",f"- **Next action:** [{r['cta']}]({r['url']})",''])
 return '\n'.join(lines)
def main():
 p=argparse.ArgumentParser(description='Standard: 500 concepts, half static, half video, in Markdown.');p.add_argument('--week',default=date.today().strftime('%G-W%V'));p.add_argument('--output');a=p.parse_args()
 text=markdown(a.week,generate(a.week));out=Path(a.output) if a.output else ROOT/f'ssbjj-500-concepts-{a.week}.md'
 with out.open('x') as f:f.write(text)
 print(out.resolve())
if __name__=='__main__':main()
