const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const safe = value => String(value).replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '').slice(0,100) || 'item';

function sanitizeTitle(title) {
  if (!title) return '';
  return String(title)
    .replace(/\|.*$/, '')
    .replace(/[^a-zA-Z0-9\s._-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getPromptFolderName(title, urlStr, exportsDir) {
  const parts = urlStr.replace(/\/$/, '').split('/prompt/');
  const uuid = parts.length > 1 ? parts[parts.length - 1].split('?')[0] : 'unknown-uuid';
  const baseName = sanitizeTitle(title) || uuid;

  const targetDir = path.join(exportsDir, baseName);
  const jsonPath = path.join(targetDir, 'prompt.json');

  if (fs.existsSync(jsonPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      const existingUuid = existing.uuid || existing.id || (existing.url ? existing.url.replace(/\/$/, '').split('/prompt/').pop().split('?')[0] : '');
      if (existingUuid && existingUuid !== uuid) {
        return `${baseName}-${uuid}`;
      }
    } catch (e) {}
  }

  return baseName;
}

function saveAsset(dir, key, name, bytes) {
  if (!bytes.length) throw Error('Empty asset');
  fs.mkdirSync(dir, {recursive:true});
  const receiptPath = path.join(dir, safe(key) + '.receipt.json');
  let receipt;
  try { receipt = JSON.parse(fs.readFileSync(receiptPath)); } catch {}
  if (receipt) {
    const existing = path.join(dir, path.basename(receipt.file));
    if (fs.existsSync(existing) && hash(fs.readFileSync(existing)) === receipt.sha256 && receipt.sha256 === hash(bytes)) return {...receipt,status:'skipped_verified'};
  }
  let file = safe(name);
  if (fs.existsSync(path.join(dir,file))) file = `${hash(bytes).slice(0,12)}-${file}`;
  if (!fs.existsSync(path.join(dir,file))) fs.writeFileSync(path.join(dir,file), bytes, {flag:'wx'});
  receipt = {file,bytes:bytes.length,sha256:hash(bytes),status:'saved'};
  fs.writeFileSync(receiptPath, JSON.stringify(receipt,null,2));
  return receipt;
}

async function metadata(page) {
  return page.evaluate(() => {
    const visible = e => !!(e.getClientRects().length);
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);
    const section = label => {
      const h = headings.find(e => e.innerText.trim().toLowerCase().startsWith(label.toLowerCase()));
      if (!h) return null;
      const parent = h.parentElement;
      if (parent && parent !== document.body && parent.innerText.length > h.innerText.length && !parent.querySelector('h1')) return parent;
      return h.nextElementSibling;
    };
    const body = document.body.innerText;
    const notes = section('Notes'); const tags = section('Tags'); const files = section('Additional Files');
    const isNavHeading = t => /^(home|account|dashboard|prompts|catalog|settings)$/i.test(t.trim());
    const titleH1 = headings.find(e => e.tagName === 'H1' && !isNavHeading(e.innerText));
    const titleFallback = headings.find(e => !isNavHeading(e.innerText) && !/^(notes|tags|additional files|versions)/i.test(e.innerText.trim()));
    const title = titleH1 || titleFallback;
    const candidates = [...document.querySelectorAll('p,div')].filter(e=>visible(e) && !e.querySelector('div,p,h1,h2,h3,button,a') && e.innerText.length>80);
    const description = candidates.find(e=>!notes?.contains(e) && !/^(Notes|Changes)/.test(e.innerText));
    const images = [...document.images].filter(e=>visible(e) && e.naturalWidth>=150 && e.naturalHeight>=100);
    return {title:title?.innerText?.trim() || null,description:description?.innerText?.trim() || null,
      notes:notes?.innerText.replace(/^Notes\s*/,'')?.trim() || null,
      tags:tags ? [...tags.querySelectorAll('a,[class*="badge"],[class*="chip"]')].map(e=>e.innerText.trim()).filter(Boolean) : [],
      version:body.match(/\bv\d+\.\d+(?:\.\d+)?(?:[-\w.]*)?/)?.[0] || null,
      tier:body.match(/\b[A-Z][A-Z -]* TIER\b/)?.[0] || null,
      created:body.match(/Created:\s*([^\n]+)/)?.[1] || null,updated:body.match(/Updated:\s*([^\n]+)/)?.[1] || null,
      thumbnail:images[0] ? {url:images[0].currentSrc,alt:images[0].alt} : null,
      attachments:files ? [...files.querySelectorAll('a,button')].filter(visible).map(e=>({name:e.innerText.trim(),href:e.getAttribute('href')})).filter(e=>e.name) : []};
  });
}

async function versions(page) {
  const select = page.locator('select').filter({has:page.locator('option')});
  for (let i=0;i<await select.count();i++) {
    const options=await select.nth(i).locator('option').evaluateAll(es=>es.map(e=>({label:e.textContent.trim(),value:e.value})));
    if (options.length && options.every(o=>/^v?\d+\./.test(o.label))) return {kind:'select',index:i,options};
  }
  const button=page.getByRole('button',{name:/^v\d+\.\d+/}).first();
  if (await button.count()) {
    await button.click();
    const options=await page.locator('[role="option"],[role="menuitem"],a').allTextContents();
    const labels=[...new Set(options.map(t=>t.trim()).filter(t=>/^v\d+\.\d+(?:\.\d+)?$/.test(t)))];
    await page.keyboard.press('Escape');
    if(labels.length) return {kind:'menu',options:labels.map(label=>({label}))};
    throw Error('Version dropdown present but options unrecognized');
  }
  return {kind:'current',options:[{label:'current'}]};
}

async function exportDetails(page, exportsRoot, downloadPrompt, renderMarkdown) {
  const plan=await versions(page); const records=[];
  for(const option of plan.options) {
    if(plan.kind==='select') await page.locator('select').nth(plan.index).selectOption(option.value);
    if(plan.kind==='menu') {
      await page.getByRole('button',{name:/^v\d+\.\d+/}).first().click();
      await page.getByText(option.label,{exact:true}).last().click();
    }
    await page.waitForTimeout(1000);

    // Wait for hydration or prompt elements to appear
    try {
      await page.waitForSelector('h1, [data-testid*="prompt"], .prompt-text, main', { timeout: 8000 });
    } catch (e) {}

    const data=await metadata(page);
    data.url = page.url();
    const urlParts = data.url.replace(/\/$/, '').split('/prompt/');
    const uuid = urlParts.length > 1 ? urlParts[urlParts.length - 1].split('?')[0] : (data.id || 'unknown-uuid');
    data.uuid = uuid;
    data.id = uuid;

    // Retry metadata if title is still missing or caught nav text
    if (!data.title || /^(home|account|dashboard)$/i.test(data.title.trim()) || data.title.includes('\n')) {
      await page.waitForTimeout(2000);
      const retryMeta = await metadata(page);
      if (retryMeta.title && !/^(home|account|dashboard)$/i.test(retryMeta.title.trim())) {
        Object.assign(data, retryMeta);
      }
    }

    if(plan.kind!=='current' && data.version?.replace(/^v/,'')!==option.label.replace(/^v/,'')) throw Error('Selected version could not be verified');

    const folderName = getPromptFolderName(data.title, data.url || '', exportsRoot);
    const promptDir = path.join(exportsRoot, folderName);
    const dir = path.join(promptDir, 'versions', safe(data.version || option.label));

    const errors=[];
    let downloaded;
    try {
      downloaded = await downloadPrompt(page, dir);
    } catch (e) {
      errors.push(`DownloadPrompt: ${e.message}`);
    }

    if (downloaded) {
      data.text = downloaded.text;
      data.prompt_download = { ...downloaded, text: undefined };
    }
    data.scraped_at = new Date().toISOString();

    const fatalErrors = [];
    if (!data.text || data.text.length < 10 || /^(HOME\s+ACCOUNT|HOME\nACCOUNT)/i.test(data.text.trim())) {
      fatalErrors.push('Prompt text could not be extracted or contains unrendered nav fallback');
    }
    if (!data.title || /^(home|account|dashboard)$/i.test(data.title.trim())) {
      fatalErrors.push('Prompt title could not be extracted');
    }

    data.additional_files=[];
    for(const [i,attachment] of (data.attachments || []).entries()) {
      try {
        const control = page.getByRole('link', { name: attachment.name })
          .or(page.getByRole('button', { name: attachment.name }))
          .or(page.locator(`a:has-text("${attachment.name}")`))
          .first();
        if (await control.count() > 0) {
          const [download] = await Promise.all([
            page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
            control.click().catch(() => {})
          ]);
          if (download) {
            const failure = await download.failure();
            if (failure) throw Error(failure);
            const bytes = fs.readFileSync(await download.path());
            data.additional_files.push({
              ...attachment,
              ...saveAsset(path.join(dir, 'additional-files'), `attachment-${i}`, download.suggestedFilename(), bytes)
            });
            continue;
          }
        }
        // Fallback: If href is an absolute URL, fetch it via context HTTP request
        if (attachment.href && /^https?:\/\//i.test(attachment.href)) {
          const resp = await page.context().request.get(attachment.href, { timeout: 20000 });
          if (resp.ok()) {
            const bytes = await resp.body();
            const filename = attachment.name || `attachment-${i}.bin`;
            data.additional_files.push({
              ...attachment,
              ...saveAsset(path.join(dir, 'additional-files'), `attachment-${i}`, filename, bytes)
            });
            continue;
          }
        }
      } catch(e) {
        errors.push(`Attachment ${attachment.name}: ${e.message}`);
      }
    }
    if(data.thumbnail) {
      try {
        const response=await page.context().request.get(data.thumbnail.url,{timeout:30000});
        const mime=response.headers()['content-type'] || '';
        if(!response.ok() || !mime.startsWith('image/'))throw Error('Thumbnail response is not an image');
        const bytes=await response.body();
        data.thumbnail={...data.thumbnail,...saveAsset(dir,'thumbnail',`thumbnail.${safe(mime.split('/')[1].split(';')[0])}`,bytes)};
      } catch(e) {errors.push(`Thumbnail: ${e.message}`);}
    }
    data.missing_fields=['title','description','notes','created','updated'].filter(k=>!data[k]);
    data.errors=[...fatalErrors, ...errors];
    data.status=fatalErrors.length ? 'failed' : (errors.length || data.missing_fields.length ? 'partial' : 'complete');

    // Only write on-disk prompt files if scrape was not completely failed
    if (data.status !== 'failed' && data.title && data.text) {
      const suffix=fs.existsSync(path.join(dir,'prompt.json')) ? `-${Date.now()}`:'';
      fs.writeFileSync(path.join(dir,`prompt${suffix}.json`),JSON.stringify(data,null,2),{flag:'w'});
      fs.writeFileSync(path.join(dir,`prompt${suffix}.md`),renderMarkdown(data),{flag:'w'});

      // Root-level prompt directory synchronization
      fs.mkdirSync(promptDir, {recursive:true});
      fs.writeFileSync(path.join(promptDir,'prompt.json'),JSON.stringify(data,null,2));
      fs.writeFileSync(path.join(promptDir,'prompt.md'),renderMarkdown(data));
      fs.writeFileSync(path.join(promptDir,'prompt-original.txt'),data.text);

      // Synchronize additional files and attachments to root prompt directory
      const versionAddDir = path.join(dir, 'additional-files');
      if (fs.existsSync(versionAddDir)) {
        const rootAddDir = path.join(promptDir, 'additional-files');
        fs.mkdirSync(rootAddDir, { recursive: true });
        for (const file of fs.readdirSync(versionAddDir)) {
          fs.copyFileSync(path.join(versionAddDir, file), path.join(rootAddDir, file));
        }
      }
    }

    data._folderName = folderName;
    records.push(data);
  }
  return records;
}

module.exports={sanitizeTitle,getPromptFolderName,saveAsset,metadata,versions,exportDetails};
