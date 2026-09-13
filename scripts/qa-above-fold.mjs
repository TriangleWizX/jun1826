import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {readHtmlWithSsi} from './url-qa-lib.mjs';

const root=path.resolve('dist');
const out=path.resolve('tmp/above-fold-qa');
await fs.mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{
  try {
    let rel=decodeURI(new URL(req.url,'http://local').pathname).slice(1)||'index.html';
    let file=path.join(root,rel);
    try {if((await fs.stat(file)).isDirectory()){rel+='/index.html';file=path.join(root,rel);}}
    catch {if(!path.extname(rel)){rel+='.html';file=path.join(root,rel);}}
    if(!file.startsWith(root+path.sep)) throw Error('Invalid path');
    res.setHeader('Content-Type',rel.endsWith('.html')?'text/html':({'.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.webp':'image/webp'}[path.extname(rel)]||'application/octet-stream'));
    res.end(rel.endsWith('.html')?await readHtmlWithSsi(rel,{root}):await fs.readFile(file));
  } catch {res.statusCode=404;res.end('missing');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const routes=[
  'options-pricing',
  'schedule',
  'bjj-faqs',
  'contact',
  'show-up-kit',
  'how-class-works',
  'jiu-jitsu-safety-tannersville-ny',
  'bjj-tannersville-ny-directions',
  'private-lessons',
  'bjj-classes/hunter-ny',
  'bjj-classes/windham-ny',
  'blog/jiu-jitsu-windham-ny',
  'sensei-jiu-jitsu',
  'sensei-studio',
  'bully-proof-jiu-jitsu-tannersville-ny',
  'bjj-classes/haines-falls-ny',
  'bjj-classes/woodstock-ny',
  'blog/jiu-jitsu-near-hunter-mountain',
  'blog/jiu-jitsu-near-windham-mountain-club',
  'blog/bjj-schedule-windham-ny',
  'blog/private-jiu-jitsu-lessons-windham-ny',
  'blog/gi-bjj-windham-ny',
  'bjj-classes/tannersville-ny',
  'bjj-classes/kids-tannersville-ny',
  'bjj-classes/teens-tannersville-ny',
  'bjj-classes/adults-tannersville-ny',
  'bjj-classes/elka-park-ny',
  'bjj-classes/palenville-ny',
  'bjj-classes/lexington-ny',
  'bjj-classes/maplecrest-ny',
  'bjj-classes/cairo-ny',
  'bjj-classes/catskill-ny',
  'bjj-classes/saugerties-ny',
  'bjj-classes/shandaken-ny',
  'bjj-classes/lanesville-ny',
  'bjj-classes/prattsville-ny',
  ''
];
const results=[];
try {
  for(const [width,height] of [[375,667],[390,844],[768,1024],[1366,768]]) {
    for(const route of routes){
      const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
      await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
      await page.goto(`http://127.0.0.1:${server.address().port}/${route}`);
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForTimeout(350);
      const data=await page.evaluate(()=>{
        const main=document.querySelector('main');
        const h=main?.querySelector('h1');
        const links=[...main.querySelectorAll('a')].filter(a=>a.getBoundingClientRect().width>0).slice(0,12).map(a=>{
          const b=a.getBoundingClientRect();return {label:a.textContent.trim(),href:a.getAttribute('href'),top:b.top,bottom:b.bottom,height:b.height,inFold:b.top>=0&&b.bottom<=innerHeight};
        });
        return {heading:h?.textContent.trim(),headingTop:h?.getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth,links,canonical:document.querySelector('link[rel=canonical]')?.href,description:document.querySelector('meta[name=description]')?.content};
      });
      await page.screenshot({path:path.join(out,`${route.replace(/\//g, '_')}-${width}.png`)});
      results.push({route,width,height,...data});
      await page.close();
    }
  }
}finally{await browser.close();server.close();}
await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({cases:results.length,overflow:results.filter(r=>r.overflow).map(r=>[r.route,r.width]),noVisibleMainAction:results.filter(r=>!r.links.some(a=>a.inFold)).map(r=>[r.route,r.width]),results:path.join(out,'results.json')}));
if(results.some(r=>r.overflow||!r.heading||!r.canonical||!r.description))process.exitCode=1;
