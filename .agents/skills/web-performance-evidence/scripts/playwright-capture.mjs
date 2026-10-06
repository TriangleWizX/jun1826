#!/usr/bin/env node
import { mkdir,writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { args,required,routes,routeKey } from './common.mjs';
const a=args(),require=createRequire(resolve(a['project-root']||process.cwd(),'package.json')),{chromium}=require('playwright');
const out=required(a,'out'),base=required(a,'base-url');await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:required(a,'chrome-path')});const results=[];
try{for(const viewport of [{width:390,height:844},{width:1440,height:1000}]){const context=await browser.newContext({viewport,deviceScaleFactor:1});try{for(const route of routes(a.routes)){const page=await context.newPage();try{
 const response=await page.goto(new URL(route,base).href,{waitUntil:'load',timeout:45000});await page.evaluate(()=>document.fonts.ready);const title=await page.title();if(response?.status()!==200||new URL(page.url()).pathname!==route||!title||!await page.locator('h1').first().isVisible())throw new Error(`Wrong page/status/title/heading: ${route}`);
 const candidates=page.locator('a').filter({hasText:/reserve free intro|text sandy|free intro|book.*intro/i}),ctas=[];
 for(let i=0;i<await candidates.count();i++){const el=candidates.nth(i);if(!await el.isVisible())continue;const href=await el.getAttribute('href');if(!href||href==='#'||/^javascript:/i.test(href))continue;const target=new URL(href,page.url());if(!['http:','https:','sms:','tel:'].includes(target.protocol))continue;ctas.push({text:(await el.innerText()).trim(),href});}
 if(!ctas.length)throw new Error(`No visible actionable intro/text CTA: ${route}`);
 const screenshot=`${routeKey(route)}-${viewport.width}.png`;await page.screenshot({path:`${out}/${screenshot}`,fullPage:true});results.push({route,url:page.url(),status:response.status(),title,viewport,ctas,screenshot});
 }finally{await page.close();}}}finally{await context.close();}}await writeFile(`${out}/functional.json`,JSON.stringify({browser:browser.version(),results},null,2),{flag:'wx'});}finally{await browser.close();}
