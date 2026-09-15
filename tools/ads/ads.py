#!/usr/bin/env python3
"""SSBJJ static-ad scaffold. Discover -> curate -> render. No publishing."""
import argparse, csv, hashlib, html, io, json, random, shutil
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlencode
from urllib.request import urlopen, Request
from PIL import Image, ImageDraw, ImageFont, ImageOps
ROOT = Path(__file__).resolve().parent
SITE = 'https://senseisandy.com'
FORMATS = {'square': (1080,1080), 'portrait': (1080,1350), 'story': (1080,1920)}

def fetch(url):
    if urlparse(url).hostname not in ('senseisandy.com','www.senseisandy.com'):
        raise ValueError('Only site-hosted assets are supported; import other owned assets locally.')
    with urlopen(Request(url,headers={'User-Agent':'SSBJJ-Ad-Studio/0.1'}),timeout=30) as r:
        if urlparse(r.url).hostname not in ('senseisandy.com','www.senseisandy.com'): raise ValueError('Unexpected redirect')
        data=r.read(20_000_001)
        if len(data)>20_000_000: raise ValueError('Asset exceeds 20 MB')
        return data

class Images(HTMLParser):
    def __init__(self): super().__init__(); self.items=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='img' and a.get('src'): self.items.append(a)

def discover(args):
    target=ROOT/'assets.json'
    old=json.loads(target.read_text()) if target.exists() else []
    known={a['url'] for a in old}
    for page in args.pages:
        p=Images(); p.feed(fetch(urljoin(SITE,page)).decode())
        for i in p.items:
            url=urljoin(SITE,i['src'])
            if url in known or urlparse(url).hostname not in ('senseisandy.com','www.senseisandy.com'): continue
            known.add(url)
            old.append(dict(id=hashlib.sha256(url.encode()).hexdigest()[:12],url=url,source_page=urljoin(SITE,page),alt=i.get('alt',''),approved=False,role='photo',audiences=[],notes='Confirm ownership/paid-ad permission and audience; use original logo without alteration.'))
    target.write_text(json.dumps(old,indent=2))
    print(f'{len(old)} candidates in {target}; existing approvals preserved.')

def font(size):
    return ImageFont.truetype(str(ROOT/'font.ttf'),size)

def fitted(draw,text,width,maxheight,start=74,minimum=32):
    for size in range(start,minimum-1,-2):
        f=font(size); lines=[]; line=''
        for word in text.split():
            proposed=(line+' '+word).strip()
            if draw.textlength(proposed,font=f)>width:
                if not line: break
                lines.append(line); line=word
            else: line=proposed
        else:
            if line: lines.append(line)
            if all(draw.textlength(l,font=f)<=width for l in lines) and len(lines)*(size+10)<=maxheight:
                return '\n'.join(lines),f
    raise ValueError('Copy will not fit at readable size: '+text)

def build_plan(args):
    if not 1 <= args.count <= 200: raise ValueError('--count must be 1–200; small previews are allowed')
    personas=json.loads((ROOT/'personas.json').read_text())
    concepts=json.loads((ROOT/'concepts.json').read_text())
    if len({c['id'] for c in concepts}) != len(concepts): raise ValueError('Duplicate concept IDs')
    if getattr(args, 'series', None):
        concepts=[c for c in concepts if c.get('series_id') in args.series]
    requested=set(args.personas or [k for k,v in personas.items() if v['weight']>0])
    if requested-set(personas): raise ValueError('Unknown persona')
    if 'ian' in requested: raise ValueError('Ian is an experience lens on Carla; select carla')
    queues={k:[c for c in concepts if c['persona_id']==k] for k in personas if k in requested}
    rng=random.Random(args.week)
    for q in queues.values(): rng.shuffle(q)
    counts={k:0 for k in queues}; selected=[]
    needed=(args.count+5)//6
    if needed>sum(map(len,queues.values())): raise ValueError('Not enough concepts for requested persona/count; lower count or add concepts')
    # Largest current deficit gives weighted concept allocation without quota padding.
    weights={k:personas[k]['weight'] for k in queues}
    total=sum(weights.values())
    for n in range(needed):
        available=[k for k in queues if queues[k]]
        k=max(available,key=lambda k:weights[k]*(n+1)/total-counts[k])
        selected.append(queues[k].pop()); counts[k]+=1
    jobs=[]
    for c in selected:
        persona=personas[c['persona_id']]
        path=persona['destination']
        if not path.startswith('/') or path.startswith('//'): raise ValueError('Destination must be a site-relative path')
        for layout in ('photo_top','photo_bottom'):
            for fmt in FORMATS:
                jobs.append(dict(concept=c,persona=persona,layout=layout,format=fmt))
    return jobs[:args.count]

def plan(args):
    jobs=build_plan(args)
    counts={}
    for j in jobs:
        k=j['concept']['persona_id']; counts[k]=counts.get(k,0)+1
    print(json.dumps(dict(exports=len(jobs),concepts=len({j['concept']['id'] for j in jobs}),by_persona=counts,jobs=jobs),indent=2))

def render(args):
    planned=build_plan(args)
    concepts=list({j['concept']['id']:j['concept'] for j in planned}.values())
    assets=json.loads((ROOT/'assets.json').read_text())
    approved=[a for a in assets if a.get('approved') and a.get('role')=='photo']
    if not approved: raise ValueError('No approved photos. Curate assets.json first.')
    out=ROOT/'output'/args.week
    if out.exists(): raise ValueError('Output already exists; choose another --week/run name to preserve history.')
    cache=ROOT/'cache'; cache.mkdir(exist_ok=True)
    def source(a):
        if a.get('local_path'): return Image.open(ROOT/a['local_path']).convert('RGBA')
        path=cache/a['id']
        if not path.exists(): path.write_bytes(fetch(a['url']))
        return Image.open(path).convert('RGBA')
    logo=next((a for a in assets if a.get('approved') and a.get('role')=='logo'),None)
    if not logo: raise ValueError('Approve the official logo and set role=logo.')
    logoimage=source(logo)
    jobs=[]
    for j in planned:
        c=j['concept']; persona=j['persona']
        matching=[a for a in approved if c['audience'] in a.get('audiences',[]) or 'all' in a.get('audiences',[])]
        matching=[a for a in matching if not a.get('persona_ids') or c['persona_id'] in a['persona_ids']]
        if not matching: raise ValueError('No approved matching photo for '+c['persona_id'])
        a=matching[int(hashlib.sha256((args.week+c['id']).encode()).hexdigest(),16)%len(matching)]
        jobs.append((c,a,j['layout'],j['format'],persona))
    out.mkdir(parents=True); rows=[]; seen=set()
    for c,a,layout,fmt,persona in jobs:
        w,h=FORMATS[fmt]; im=Image.new('RGB',(w,h),'#151922'); d=ImageDraw.Draw(im)
        # Preserve entire photo; no face cropping, recoloring, or generated alterations.
        photo=source(a).convert('RGB'); box=(960, int(h*.32))
        if photo.width<box[0]//2 or photo.height<box[1]//2: raise ValueError('Source too small: '+a['url'])
        photo=ImageOps.contain(photo,box)
        top=210 if layout=='photo_top' else h-210-box[1]
        im.paste(photo,((w-photo.width)//2,top+(box[1]-photo.height)//2))
        d.rounded_rectangle((52,57,178,183),radius=12,fill='#f3cf52')
        logo_scaled=ImageOps.contain(logoimage,(110,110)); im.paste(logo_scaled,(60,65),logo_scaled)
        d.text((195,83),'SENSEI SANDY BJJ',font=font(38),fill='#f3cf52')
        d.text((195,132),'TANNERSVILLE, NY',font=font(25),fill='#f3cf52')
        y=top+box[1]+34 if layout=='photo_top' else 230
        textheight=(h-190-y) if layout=='photo_top' else (top-y-28)
        headline,f=fitted(d,c['headline'],940,textheight*.58)
        d.multiline_text((65,y),headline,font=f,fill='#f3cf52',spacing=10)
        b=d.multiline_textbbox((65,y),headline,font=f,spacing=10)
        body,bf=fitted(d,c['body'],940,textheight*.37,start=34,minimum=26)
        d.multiline_text((65,b[3]+20),body,font=bf,fill='#f3cf52',spacing=10)
        d.rounded_rectangle((60,h-165,1020,h-99),radius=16,fill='#f3cf52')
        cta,cf=fitted(d,persona['cta'],890,50,start=36,minimum=26)
        d.text((90,h-155),cta,font=cf,fill='#151922')
        d.text((65,h-80),'SenseiSandy.com',font=font(30),fill='#f3cf52')
        digest=hashlib.sha256(im.tobytes()).hexdigest()
        if digest in seen: raise ValueError('Duplicate rendered image')
        seen.add(digest)
        cid=hashlib.sha256((c['id']+a['id']+layout+fmt+c['headline']+c['body']+persona['cta']+persona['destination']).encode()).hexdigest()[:16]
        filename=f'{cid}.png'; im.save(out/filename)
        dest=SITE+persona['destination']+'?'+urlencode(dict(utm_source='meta',utm_medium='paid_social',utm_campaign='ssbjj_'+args.week,utm_content=cid))
        rows.append(dict(creative_id=cid,concept_id=c['id'],persona_id=c['persona_id'],experience_lens=c['experience_lens'],series_id=c.get('series_id','evergreen'),lifecycle_stage=c.get('lifecycle_stage','acquisition'),offer_id=persona['offer_id'],followup_id=persona['followup_id'],cta=persona['cta'],audience=c['audience'],hypothesis=c['hypothesis'],asset_id=a['id'],layout=layout,format=fmt,file=filename,headline=c['headline'],body=c['body'],destination=dest,status='draft',sha256=digest))
    with (out/'manifest.csv').open('w',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0])); writer.writeheader(); writer.writerows(rows)
    (out/'inputs.json').write_text(json.dumps(dict(week=args.week,concepts=concepts,personas=json.loads((ROOT/'personas.json').read_text()),assets=assets),indent=2))
    cards=''.join(f'<figure><img loading="lazy" src="{r["file"]}"><figcaption>{html.escape(r["concept_id"]+" / "+r["offer_id"]+" / "+r["layout"]+" / "+r["format"])}</figcaption></figure>' for r in rows)
    (out/'review.html').write_text('<!doctype html><meta charset="utf-8"><title>SSBJJ draft review</title><style>body{background:#151922;color:#f3cf52;font:16px sans-serif}main{display:grid;grid-template-columns:repeat(3,1fr)}img{width:100%}figure{margin:12px}</style><h1>Drafts — review before use</h1><main>'+cards+'</main>')
    print(f'Rendered {len(rows)} drafts: {out}')

if __name__=='__main__':
    p=argparse.ArgumentParser(); sub=p.add_subparsers(dest='command',required=True)
    d=sub.add_parser('discover'); d.add_argument('--pages',nargs='+',default=['/']); d.set_defaults(run=discover)
    for command,handler in [('plan',plan),('render',render)]:
        r=sub.add_parser(command); r.add_argument('--count',type=int,required=True)
        r.add_argument('--week',default=date.today().strftime('%G-W%V'))
        r.add_argument('--personas',nargs='+',help='carla ben tyler casey frankie wendy; Ian is a lens')
        r.add_argument('--series',nargs='+',help='Optional content-series filter')
        r.set_defaults(run=handler)
    args=p.parse_args(); args.run(args)
