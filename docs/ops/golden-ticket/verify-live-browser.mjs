import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const base=process.env.SHINEY_BASE_URL || 'https://senseisandy.com';
const output=path.resolve(process.env.SHINEY_QA_OUTPUT || '.tmb/shiney-st-release');
fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const target=base+'/bring-a-friend.html?utm_source=member_referral&utm_medium=offline&utm_campaign=shiney_ticket&utm_content=st01';
const results=[];
try{
  for(const viewport of [{width:375,height:900},{width:1440,height:1000}]){
    const context=await browser.newContext({viewport,reducedMotion:'reduce',serviceWorkers:'block'});
    await context.route('**/*',route=>{
      const request=route.request();
      const url=new URL(request.url());
      return url.origin===new URL(base).origin && ['GET','HEAD'].includes(request.method()) ? route.continue() : route.abort();
    });
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(target,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    assert(page.url().includes('utm_campaign=shiney_ticket') && page.url().includes('utm_content=st01'));
    assert.equal(await page.locator('#friend-pass-card-code').inputValue(),'ST01');
    assert.equal(await page.locator('#friend-pass-source-url').inputValue(),page.url());
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('.shiney-ticket').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(23, 71, 53)');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    const cta=await page.locator('.shiney-button').boundingBox();
    assert(cta && cta.y+cta.height<viewport.height,'live CTA above fold');
    await page.screenshot({path:path.join(output,`live-${viewport.width}-hero.png`)});
    await page.locator('#friend-pass-form').scrollIntoViewIfNeeded();
    assert(await page.locator('#friend-pass-form-shell').isVisible());
    await page.screenshot({path:path.join(output,`live-${viewport.width}-form.png`)});
    await page.locator('footer').last().scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,`live-${viewport.width}-footer.png`)});
    assert.deepEqual(errors,[]);
    results.push({viewport,tracking:true,cardAndSourcePrefill:true,noOverflow:true,ctaAboveFold:true,formVisible:true,pageErrors:errors,realSubmissions:0});
    await context.close();
  }
  fs.writeFileSync(path.join(output,'live-browser-results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
