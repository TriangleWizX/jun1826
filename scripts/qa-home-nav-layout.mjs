import {createServer} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {readHtmlWithSsi} from '../scripts/url-qa-lib.mjs';
const root=path.resolve('dist');
const server=createServer(async(req,res)=>{try{let rel=decodeURI(new URL(req.url,'http://local').pathname).slice(1)||'index.html'; let file=path.join(root,rel);try{if((await fs.stat(file)).isDirectory()){rel+='/index.html';file=path.join(root,rel)}}catch{if(!path.extname(rel)){rel+='.html';file=path.join(root,rel)}}const html=rel.endsWith('.html');res.setHeader('Content-Type',html?'text/html':({'.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'}[path.extname(rel)]||'application/octet-stream'));res.end(html?await readHtmlWithSsi(rel,{root}):await fs.readFile(file));}catch{res.statusCode=404;res.end('missing')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const results=[];const failures=[];
try{for(const width of [320,390,768,992,1366,1920]){
const page=await browser.newPage({viewport:{width,height:900}});
await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});
const snap=()=>page.evaluate(()=>{const rect=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,b:r.bottom}};return {overflow:document.documentElement.scrollWidth>innerWidth,menu:getComputedStyle(document.querySelector('#ssMainNav')).display,expanded:document.querySelector('.ss-menu-button').getAttribute('aria-expanded'),button:rect('.ss-menu-button'),cta:rect('.ss-nav-cta--persistent'),hero:rect('.ss-home-conversion__hero'),columns:getComputedStyle(document.querySelector('.ss-home-conversion__hero')).gridTemplateColumns,reviewGap:document.querySelector('.ss-reviews-actions').getBoundingClientRect().top-document.querySelector('.ss-review-item:last-child').getBoundingClientRect().bottom,h1:[...document.querySelectorAll('h1')].filter(e=>e.getClientRects().length).map(e=>e.textContent.trim()),oldCtas:[...document.querySelectorAll('[data-hero-primary-cta],.ss-nav-actions a')].filter(e=>e.href.includes('/free-bjj-intro-tannersville-ny')).length}});
const closed=await snap();console.log('initial',width,JSON.stringify(closed));await page.screenshot({path:`tmp/agy-${width}.png`,fullPage:false});await page.locator('.ss-menu-button').click();const opened=await snap();await page.locator('#programsDropdownToggle').click();await page.waitForTimeout(200);const dropdown=await page.locator('#programsDropdownMenu').isVisible();await page.locator('.ss-menu-button').click();const reclosed=await snap();
await page.locator('.ss-menu-button').focus();await page.keyboard.press('Enter');await page.keyboard.press('Escape');
const keyboardClosed=await page.locator('.ss-menu-button').getAttribute('aria-expanded')==='false';
if(!keyboardClosed)failures.push('keyboard-'+width);
if(width===1366){const author=await page.locator('#ss-review-author').innerText();await page.waitForTimeout(7600);if(author===await page.locator('#ss-review-author').innerText())failures.push('review-rotation');}

if(closed.overflow||opened.overflow||closed.menu!=='none'||opened.menu==='none'||reclosed.menu!=='none'||closed.cta.b>900||closed.cta.x+closed.cta.w>width||closed.button.x+closed.button.w>closed.cta.x||closed.cta.w<44||closed.button.h<44||!dropdown||closed.oldCtas||closed.reviewGap>24)failures.push(width);
await page.screenshot({path:`tmp/agy-${width}.png`,fullPage:false});
results.push({width,closed,openedMenu:opened.menu,dropdown,reclosed:reclosed.menu});await page.close();
}}finally{await browser.close();server.close();}
await fs.writeFile('tmp/agy-layout-results.json',JSON.stringify({results,failures},null,2));console.log(JSON.stringify({results,failures},null,2));if(failures.length)process.exitCode=1;
