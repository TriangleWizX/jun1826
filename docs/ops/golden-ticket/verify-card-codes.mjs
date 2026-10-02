// Exercise the generated form with local responses only; no provider receives data.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('dist/bring-a-friend.html','utf8');
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const output='.tmb/shiney-st-release';
fs.mkdirSync(output,{recursive:true});
let mockSubmissions=0;
let submitted='';
try {
  const context=await browser.newContext({serviceWorkers:'block'});
  await context.route('**/*',route=>{
    const request=route.request();
    if(request.url()==='https://formspree.io/f/myzpdvay' && request.method()==='POST') {
      mockSubmissions++;
      submitted=request.postData();
      return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'});
    }
    if(request.isNavigationRequest()) return route.fulfill({status:200,contentType:'text/html',body:html});
    return route.abort();
  });
  const page=await context.newPage();
  const visit=async(code)=>{
    const query=new URLSearchParams({utm_source:'member_referral',utm_medium:'offline',utm_campaign:'shiney_ticket'});
    if(code!==null) query.set('utm_content',code);
    const url='https://senseisandy.test/bring-a-friend?'+query;
    await page.goto(url,{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('#friend-pass-source-url').inputValue(),url);
  };
  for(let i=1;i<=10;i++) {
    const suffix=String(i).padStart(2,'0');
    for(const prefix of ['st','ST','gt','GT']) {
      await visit(prefix+suffix);
      assert.equal(await page.locator('#friend-pass-card-code').inputValue(),'ST'+suffix);
    }
  }
  for(const code of [null,'','st00','st11','st99','other','st01suffix','<script>']) {
    await visit(code);
    assert.equal(await page.locator('#friend-pass-card-code').inputValue(),'');
  }
  const input=page.locator('#friend-pass-card-code');
  for(const [typed,expected,valid] of [['ST01','ST01',true],['st10','ST10',true],['GT01','ST01',true],['gt10','ST10',true],['ST00','ST00',false],['ST11','ST11',false],['ZZ01','ZZ01',false],['','',true]]) {
    await input.fill(typed);
    await input.dispatchEvent('change');
    assert.equal(await input.inputValue(),expected);
    assert.equal(await input.evaluate(el=>el.checkValidity()),valid);
  }
  await visit('gt01');
  for(const [id,value] of Object.entries({'friend-pass-name':'Local Test Member','friend-pass-phone':'2025550143','friend-pass-friend-name':'Local Test Guest','friend-pass-age':'18','friend-pass-friend-phone':'2025550184','friend-pass-day':'Local test only'})) {
    await page.locator('#'+id).fill(value);
  }
  await page.locator('#friend-pass-permission').check();
  await page.locator('#friend-pass-form-shell button[type=submit]').click();
  await page.locator('#friend-pass-success').waitFor({state:'visible'});
  assert.equal(mockSubmissions,1);
  assert.match(submitted,/name="referral_card"\r\n\r\nST01/);
  assert.match(submitted,/utm_content=gt01/);
  assert.match(submitted,/name="offer_classes"\r\n\r\n4/);
  assert.equal(await page.locator('#friend-pass-success').evaluate(el=>el===document.activeElement),true);
  const result={queryCases:48,typedCases:8,legacyMapsToST:true,originalSourcePreserved:true,mockSubmissions,realSubmissions:0};
  fs.writeFileSync(output+'/card-code-results.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
