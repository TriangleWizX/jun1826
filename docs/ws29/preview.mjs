import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const root=path.resolve(process.argv[2]||new URL('../..',import.meta.url).pathname);
const out=path.resolve(process.argv[2]||path.join(root,'docs/ws29/baseline'));
const routes=['/','/schedule','/options-pricing','/free-bjj-intro-tannersville-ny','/visit','/programs','/bjj-classes/kids-tannersville-ny','/bjj-classes/adults-tannersville-ny','/bjj-classes/teens-tannersville-ny','/blog/after-school-jiu-jitsu','/bjj-glossary/arm-drag','/alley-bootcamp','/winter-armor-2027','/bjj-faqs'];
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
async function materialize(file,stack=[]){if(stack.includes(file))throw Error('SSI cycle '+file);let html=await fs.readFile(file,'utf8');const matches=[...html.matchAll(/<!--\s*#include\s+(virtual|file)=["']([^"']+)["']\s*-->/g)];for(const match of matches){const include=match[1]==='virtual'?path.resolve(root,'dist','.'+match[2]):path.resolve(path.dirname(file),match[2]);if(!include.startsWith(path.join(root,'dist')+path.sep))throw Error('SSI path');html=html.replace(match[0],await materialize(include,[...stack,file]));}return html;}
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const base=path.resolve(root,'dist','.'+pathname);if(!base.startsWith(path.join(root,'dist')+path.sep)&&base!==path.join(root,'dist'))throw Error('path');for(const candidate of [base,path.join(base,'index.html'),base+'.html']){let stat;try{stat=await fs.stat(candidate);}catch{continue;}if(stat.isFile()){res.setHeader('Content-Type',mime[path.extname(candidate)]||'application/octet-stream');res.end(path.extname(candidate)==='.html'?await materialize(candidate):await fs.readFile(candidate));return;}}res.writeHead(404);res.end('Not found');}catch(error){console.error(error);res.writeHead(500);res.end('Error');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
console.log(`SSI-aware local preview: http://127.0.0.1:${server.address().port}`);
