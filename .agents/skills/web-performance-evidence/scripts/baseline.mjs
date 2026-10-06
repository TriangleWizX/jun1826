#!/usr/bin/env node
import { mkdir,writeFile,readFile,readdir,copyFile,stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID,createHash } from 'node:crypto';
import { platform,release,arch,cpus } from 'node:os';
import { createRequire } from 'node:module';
import { args,required,integer,routes,routeKey,treeHash,readJSON,same } from './common.mjs';
import { startServer } from './static-server.mjs';
const a=args(),exec=promisify(execFile),scripts=dirname(fileURLToPath(import.meta.url)),out=resolve(required(a,'out')),site=resolve(required(a,'site-dir')),project=resolve(a['project-root']||process.cwd()),phase=required(a,'phase');
if(!['before','after'].includes(phase))throw new Error('Use --phase before|after');
const routeList=routes(a.routes),samples=integer(a.samples,3,1,20),port=integer(a.port,8080,0),bin=required(a,'lighthouse-bin'),version=required(a,'lighthouse-version'),chrome=required(a,'chrome-path');
await mkdir(dirname(out),{recursive:true});await mkdir(out); // Exclusive run reservation; never overwrite prior evidence.
const manifest={schema:1,status:'running',phase,timestamp:new Date().toISOString(),siteDir:site,projectRoot:project,routes:routeList,samples,node:process.version,server:'local static directory-first; no compression, cache disabled; not production hosting',build:a['skip-build']?'prebuilt snapshot':'npm run build'};let server;
manifest.os={platform:platform(),release:release(),arch:arch(),cpu:cpus()[0]?.model};
try{
 if(!a['skip-build'])await exec('npm',['run','build'],{cwd:project,maxBuffer:20*1024*1024});
 manifest.siteHash=await treeHash(site);manifest.sha=(await exec('git',['rev-parse','HEAD'],{cwd:project})).stdout.trim();manifest.gitStatus=(await exec('git',['status','--porcelain'],{cwd:project})).stdout;
 const require=createRequire(resolve(project,'package.json'));manifest.playwright=require('playwright/package.json').version;manifest.chrome=(await exec(chrome,['--version'])).stdout.trim();manifest.lighthouse=(await exec(bin,['--version'])).stdout.trim();if(manifest.lighthouse!==version)throw new Error('Lighthouse version mismatch');
 const config={extends:'lighthouse:default',settings:{onlyCategories:['performance'],formFactor:'mobile',throttlingMethod:'simulate',screenEmulation:{mobile:true,width:390,height:844,deviceScaleFactor:1,disabled:false},emulatedUserAgent:true}};
 manifest.requestedConfig=config;manifest.requestedConfigHash=createHash('sha256').update(JSON.stringify(config)).digest('hex');
 const publicSources=resolve(project,'src');manifest.sourceHashes={};async function hashSources(dir){for(const item of await readdir(dir,{withFileTypes:true})){const file=resolve(dir,item.name);if(item.isDirectory())await hashSources(file);else if(item.isFile()&&/\.(?:html|css|js|mjs|njk)$/.test(item.name))manifest.sourceHashes[file.slice(project.length+1)]=createHash('sha256').update(await readFile(file)).digest('hex');}}await hashSources(publicSources);
 // Lighthouse uses deviceScaleFactor in current configuration; actual returned settings are saved and compared.
 await writeFile(`${out}/lighthouse-config.cjs`,`module.exports = ${JSON.stringify(config,null,2)};\n`,{flag:'wx'});
 const token=randomUUID();server=await startServer(site,port,token);const base=`http://127.0.0.1:${server.address().port}`;manifest.baseUrl=base;
 const ready=await fetch(`${base}/__perf_ready`,{signal:AbortSignal.timeout(5000)});if(await ready.text()!==token)throw new Error('Server identity failed');
 manifest.preflight=[];for(const route of routeList){const r=await fetch(base+route,{redirect:'manual',signal:AbortSignal.timeout(5000)});const html=await r.text();if(r.status!==200||!r.headers.get('content-type')?.includes('text/html')||!/<h1[\s>]/i.test(html)||!/<title[\s>]/i.test(html))throw new Error(`Route preflight failed: ${route} ${r.status}`);manifest.preflight.push({route,status:r.status});}
 const resumed=new Set();if(a['resume-from']){
  const prior=resolve(a['resume-from']),previous=await readJSON(`${prior}/manifest.json`);
  if(previous.status!=='failed')throw new Error('Resume requires a failed immutable run');
  for(const key of ['phase','siteHash','routes','samples','node','chrome','lighthouse','playwright'])if(!same(previous[key],manifest[key]))throw new Error(`Resume incompatible ${key}`);
  const legacyServer='local static; no compression, cache disabled; not production hosting';if(previous.server!==manifest.server&&previous.server!==legacyServer)throw new Error('Resume server differs');
  const priorConfig=await readFile(`${prior}/lighthouse-config.cjs`,'utf8'),currentConfig=await readFile(`${out}/lighthouse-config.cjs`,'utf8');if(priorConfig!==currentConfig)throw new Error('Resume config differs');
  if(previous.os&&!same(previous.os,manifest.os))throw new Error('Resume OS differs');
  manifest.resume={from:prior,previousFinishedAt:previous.finishedAt,legacyOSUnavailable:!previous.os,serverCorrection:previous.server!==manifest.server?'directory-first resolution; reuse only identical flat/directory payloads or single candidates':null,routes:[],skipped:[]};
  const names=await readdir(`${prior}/lighthouse`);await mkdir(`${out}/lighthouse`,{recursive:true});let oldSettings;
  for(const route of routeList){const key=routeKey(route);try{if(previous.server!==manifest.server&&!route.endsWith('/')&&!/\.[^/]+$/.test(route)){const flat=resolve(site,'.'+route+'.html'),nested=resolve(site,'.'+route+'/index.html');let flatBytes,nestedBytes;try{flatBytes=await readFile(flat);}catch(error){if(error.code!=='ENOENT')throw error;}try{nestedBytes=await readFile(nested);}catch(error){if(error.code!=='ENOENT'&&error.code!=='ENOTDIR')throw error;}if(flatBytes&&nestedBytes&&!flatBytes.equals(nestedBytes))throw new Error('route resolution changed: rerun');if(flatBytes&&/<meta[^>]+http-equiv=["']?refresh/i.test(flatBytes.toString()))throw new Error('legacy redirect stub: rerun');}const data=await readJSON(`${prior}/lighthouse/${key}.json`);if(data.samples.length!==samples)throw new Error('incomplete sample count');
   for(let i=0;i<samples;i++){const r=data.samples[i],raw=await readJSON(`${prior}/lighthouse/${key}.${i+1}.json`);if(!same(raw,r)||r.runtimeError||r.lighthouseVersion!==version||new URL(r.finalDisplayedUrl||r.finalUrl).pathname!==route)throw new Error('invalid sample');if(oldSettings&&!same(oldSettings,r.configSettings))throw new Error('settings mismatch');oldSettings=r.configSettings;for(const id of ['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','cumulative-layout-shift','server-response-time','total-byte-weight'])if(!Number.isFinite(r.audits?.[id]?.numericValue))throw new Error(`missing ${id}`);for(const suffix of ['-0.trace.json','-0.devtoolslog.json'])await stat(`${prior}/lighthouse/${key}.${i+1}${suffix}`);}
   const files=names.filter(name=>name===`${key}.json`||name.startsWith(`${key}.`));for(const name of files)await copyFile(`${prior}/lighthouse/${name}`,`${out}/lighthouse/${name}`);resumed.add(route);manifest.resume.routes.push({route,files});
  }catch(error){manifest.resume.skipped.push({route,reason:error.message});}}
 }
 for(const route of routeList)if(!resumed.has(route))await exec(process.execPath,[`${scripts}/lighthouse-run.mjs`,'--url',base+route,'--out',`${out}/lighthouse/${routeKey(route)}.json`,'--samples',String(samples),'--lighthouse-bin',bin,'--lighthouse-version',version,'--chrome-path',chrome,'--config',`${out}/lighthouse-config.cjs`],{cwd:project,maxBuffer:20*1024*1024,timeout:samples*260000});
 let settings;for(const route of routeList){const data=await readJSON(`${out}/lighthouse/${routeKey(route)}.json`);for(const sample of data.samples){if(settings&&!same(settings,sample.configSettings))throw new Error('Sample settings differ');settings=sample.configSettings;}}manifest.lighthouseConfig=settings;
 await exec(process.execPath,[`${scripts}/playwright-capture.mjs`,'--out',`${out}/screenshots`,'--base-url',base,'--routes',routeList.join(','),'--chrome-path',chrome,'--project-root',project],{cwd:project,maxBuffer:10*1024*1024,timeout:routeList.length*100000});
 manifest.status='complete';
}catch(error){manifest.status='failed';manifest.error=error.message;throw error;}finally{manifest.finishedAt=new Date().toISOString();await writeFile(`${out}/manifest.json`,JSON.stringify(manifest,null,2));if(server){server.closeAllConnections();await new Promise(ok=>server.close(ok));}}
