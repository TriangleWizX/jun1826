// Exercise the generated form with local responses only; no provider receives data.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync('dist/bring-a-friend.html','utf8');
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const output='.tmb/mountain-tap-release';
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
    const query=new URLSearchParams({utm_source:'member_referral',utm_medium:'offline',utm_campaign:'mountain_tap_card'});
    if(code!==null) query.set('utm_content',code);
    const url='https://senseisandy.test/bring-a-friend?'+query;
    await page.goto(url,{waitUntil:'domcontentloaded'});
    assert.equal(await page.locator('#friend-pass-source-url').inputValue(),url);
  };

  // Test MTP program code and legacy parameter normalization
  for(const code of ['mtp','MTP','st01','ST01','gt01','GT01','st10','ST10']) {
    await visit(code);
    assert.equal(await page.locator('#friend-pass-card-code').inputValue(),'MTP');
  }

  // Without parameter, defaults to MTP
  await visit(null);
  assert.equal(await page.locator('#friend-pass-card-code').inputValue(),'MTP');

  const input=page.locator('#friend-pass-card-code');
  for(const [typed,expected,valid] of [['MTP','MTP',true],['mtp','MTP',true],['ST01','MTP',true],['gt10','MTP',true],['ZZ99','ZZ99',false]]) {
    await input.fill(typed);
    await input.dispatchEvent('change');
    assert.equal(await input.inputValue(),expected);
    assert.equal(await input.evaluate(el=>el.checkValidity()),valid);
  }

  // Verify form submission captures referring friend as primary tracking mechanism
  await visit('mtp');
  for(const [id,value] of Object.entries({
    'friend-pass-name':'Referring Member Friend',
    'friend-pass-phone':'2025550143',
    'friend-pass-friend-name':'Invited Guest Name',
    'friend-pass-age':'18',
    'friend-pass-friend-phone':'2025550184',
    'friend-pass-day':'Monday evening'
  })) {
    await page.locator('#'+id).fill(value);
  }
  await page.locator('#friend-pass-permission').check();
  await page.locator('#friend-pass-form-shell button[type=submit]').click();
  await page.locator('#friend-pass-success').waitFor({state:'visible'});
  assert.equal(mockSubmissions,1);

  // Validate submitted data: Referring member is primary tracking mechanism
  assert.match(submitted,/name="student_name"\r\n\r\nReferring Member Friend/);
  assert.match(submitted,/name="student_phone"\r\n\r\n2025550143/);
  assert.match(submitted,/name="friend_name"\r\n\r\nInvited Guest Name/);
  assert.match(submitted,/name="referral_card"\r\n\r\nMTP/);
  assert.match(submitted,/name="offer_id"\r\n\r\nmountain_tap_card/);
  assert.match(submitted,/name="form_name"\r\n\r\nMountain Tap Card Request/);
  assert.match(submitted,/utm_campaign=mountain_tap_card/);
  assert.match(submitted,/utm_content=mtp/);
  assert.match(submitted,/name="offer_classes"\r\n\r\n4/);
  assert.equal(await page.locator('#friend-pass-success').evaluate(el=>el===document.activeElement),true);

  const result={programLabel:'MTP',referringFriendTracking:true,legacyMappedToMTP:true,mockSubmissions,realSubmissions:0};
  fs.writeFileSync(output+'/card-code-results.json',JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
