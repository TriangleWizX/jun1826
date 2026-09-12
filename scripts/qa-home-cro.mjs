import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {readHtmlWithSsi} from '../scripts/url-qa-lib.mjs';
const root=path.resolve('dist');
const server=createServer(async(req,res)=>{try{let rel=decodeURI(new URL(req.url,'http://local').pathname).slice(1)||'index.html'; let file=path.join(root,rel);try{if((await fs.stat(file)).isDirectory()){rel+='/index.html';file=path.join(root,rel)}}catch{if(!path.extname(rel)){rel+='.html';file=path.join(root,rel)}}const html=rel.endsWith('.html');res.setHeader('Content-Type',html?'text/html':({'.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'}[path.extname(rel)]||'application/octet-stream'));res.end(html?await readHtmlWithSsi(rel,{root}):await fs.readFile(file));}catch{res.statusCode=404;res.end('missing')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});

const phase=process.argv[2]||'verification';
await fs.mkdir(`tmp/home-cro-${phase}`,{recursive:true});
const results=[]; const failures=[];
try {
for(const [width,height] of [[320,568],[375,667],[390,844],[414,896],[768,1024],[992,768],[1366,768],[1440,900],[667,375]]){
 const page=await browser.newPage({viewport:{width,height}});
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}/`); await page.evaluate(()=>document.fonts.ready);
 const initial=await page.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}};const img=document.querySelector('.ss-home-conversion__media img');return {cta:box('#hero-primary-cta'),nav:box('header'),cue:box('.ss-hero-mobile-cue'),columns:getComputedStyle(document.querySelector('.ss-home-conversion__hero')).gridTemplateColumns,overflow:document.documentElement.scrollWidth>innerWidth,image:{src:img.currentSrc,width:img.naturalWidth,height:img.naturalHeight},sticky:getComputedStyle(document.querySelector('#mobile-sticky-first-visit')).display}});
 await page.screenshot({path:`tmp/home-cro-${phase}/${width}-initial.png`});
 await page.locator('.ss-menu-button').click(); await page.screenshot({path:`tmp/home-cro-${phase}/${width}-menu.png`}); await page.keyboard.press('Escape');
 await page.evaluate(()=>{window.__events=[];window.SS_TRACK_EVENT=(name,payload)=>window.__events.push({name,payload})});
 if(initial.overflow) failures.push(`overflow ${width}`);
 if(phase!=='baseline' && [320,375,390].includes(width) && initial.cta.bottom>height) failures.push(`fold ${width}`);
 const lanes=[];
 for(const choice of ['child','teen','adult','family']) {await page.locator(`[data-audience-choice="${choice}"]`).click();lanes.push(await page.locator('#builder-continue-btn').getAttribute('href'));await page.screenshot({path:`tmp/home-cro-${phase}/${width}-${choice}.png`});}
 await page.locator('#builder-continue-btn').scrollIntoViewIfNeeded();await page.screenshot({path:`tmp/home-cro-${phase}/${width}-sticky.png`});
 await page.locator('footer').first().scrollIntoViewIfNeeded();await page.screenshot({path:`tmp/home-cro-${phase}/${width}-footer.png`});
 if(phase!=='baseline' && (await page.evaluate(()=>window.__events.filter(e=>e.name==='audience_selected').length))!==4) failures.push(`selection events ${width}`);
 results.push({width,height,initial,lanes,events:await page.evaluate(()=>window.__events)});await page.close();
}
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
await page.addInitScript(()=>{window.SS_ENABLE_ANALYTICS=true});
for(const [alias,choice] of Object.entries({kids:'child',child:'child',teens:'teen',teen:'teen',adults:'adult',adult:'adult',family:'family',invalid:'adult'})) {
 await page.goto(`http://127.0.0.1:${server.address().port}/?lane=${alias}`);
 if(await page.locator(`[data-audience-choice="${choice}"]`).getAttribute('aria-pressed')!=='true')failures.push(`alias ${alias}`);
 if(await page.evaluate(()=>window.dataLayer.some(e=>e.event==='audience_selected')))failures.push(`init event ${alias}`);
}
await page.waitForFunction(()=>typeof window.SS_TRACK_EVENT==='function');
for(const key of ['Enter','Space']) {
 await page.locator('[data-audience-choice="child"]').focus();await page.keyboard.press(key);
 if(await page.locator('[data-audience-choice="child"]').getAttribute('aria-pressed')!=='true')failures.push(key);
 if(!await page.locator('[data-audience-choice="child"]').evaluate(e=>e===document.activeElement))failures.push(`focus ${key}`);
}
await page.evaluate(()=>{document.activeElement.blur();window.scrollTo({top:document.querySelector('#home-student-reviews').getBoundingClientRect().top + scrollY + 200,behavior:'instant'})});await page.waitForTimeout(1000);
const sticky=await page.locator('#mobile-sticky-first-visit').isVisible();
if(!sticky) {failures.push('sticky after hero'); console.log(await page.evaluate(()=>({scrollY,active:document.activeElement.tagName,bar:document.querySelector('#mobile-sticky-first-visit').className,continuation:document.querySelector('#builder-continue-btn').getBoundingClientRect().top,footer:document.querySelector('footer').getBoundingClientRect().top,menu:document.querySelector('.ss-menu-button').getAttribute('aria-expanded')})))};
await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);
if(await page.locator('#mobile-sticky-first-visit').isVisible())failures.push('sticky initial');
await page.addScriptTag({url:'/assets/js/analytics-events.js'});
await page.locator('.ss-home-conversion__actions [href^="sms:"]').evaluate(e=>e.addEventListener('click',ev=>ev.preventDefault()));
await page.locator('.ss-home-conversion__actions [href^="sms:"]').click();
if(await page.evaluate(()=>window.dataLayer.filter(e=>e.event==='text_sandy_clicked').length)!==1)failures.push('text event');
await page.emulateMedia({reducedMotion:'reduce'});
await page.addStyleTag({content:'html {font-size:200%}'});
await page.screenshot({path:`tmp/home-cro-${phase}/text-200.png`,fullPage:true});
results.push({keyboard:true,aliases:true,stickyObserved:sticky,text200Overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
await page.close();
const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:320,height:568}});
await nojs.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
await nojs.goto(`http://127.0.0.1:${server.address().port}/`);
if(!await nojs.locator('noscript a[href*="booking-flow"]').isVisible())failures.push('noscript booking');
await nojs.close();
}finally{await browser.close();server.close()}
await fs.writeFile(`tmp/home-cro-${phase}/results.json`,JSON.stringify(results,null,2));await fs.writeFile(`tmp/home-cro-${phase}/failures.json`,JSON.stringify(failures));console.log(JSON.stringify({failures}));if(failures.length)process.exitCode=1;
