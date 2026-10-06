#!/usr/bin/env node
import { mkdir,writeFile,readFile } from 'node:fs/promises';
import { dirname,resolve } from 'node:path';
import { execFile,spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { args,required,integer } from './common.mjs';
const exec=promisify(execFile),a=args(),url=required(a,'url'),out=resolve(required(a,'out')),bin=required(a,'lighthouse-bin'),version=required(a,'lighthouse-version');
const actual=(await exec(bin,['--version'])).stdout.trim();if(actual!==version)throw new Error(`Lighthouse version mismatch: ${actual} != ${version}`);
async function run(command,argv){await new Promise((ok,no)=>{const child=spawn(command,argv,{detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']}),chunks=[];let bytes=0,timedOut=false;const capture=data=>{bytes+=data.length;if(bytes<2*1024*1024)chunks.push(data);};child.stdout.on('data',capture);child.stderr.on('data',capture);const kill=signal=>{try{if(process.platform!=='win32')process.kill(-child.pid,signal);else child.kill(signal);}catch(error){if(error.code!=='ESRCH')throw error;}};let force;const timer=setTimeout(()=>{timedOut=true;kill('SIGTERM');force=setTimeout(()=>kill('SIGKILL'),2000);},240000);child.once('error',error=>{clearTimeout(timer);clearTimeout(force);no(error);});child.once('close',(code,signal)=>{clearTimeout(timer);clearTimeout(force);kill('SIGTERM');if(code===0&&!timedOut)ok();else no(new Error(`Lighthouse ${timedOut?'timeout after 240s':`exit ${code} ${signal}`}\n${Buffer.concat(chunks).toString('utf8').slice(-12000)}`));});});}
const count=integer(a.samples,3,1,20);if(!out.endsWith('.json'))throw new Error('--out must end .json');await mkdir(dirname(out),{recursive:true});const samples=[];
for(let i=1;i<=count;i++){
 const target=out.replace(/\.json$/,`.${i}.json`);
 await run(bin,[url,'--output=json',`--output-path=${target}`,`--config-path=${required(a,'config')}`,`--chrome-path=${required(a,'chrome-path')}`,'--chrome-flags=--headless=new','--save-assets'],);
 const r=JSON.parse(await readFile(target,'utf8'));if(r.runtimeError)throw new Error(`Lighthouse failed: ${JSON.stringify(r.runtimeError)}`);if(r.lighthouseVersion!==version)throw new Error('Unexpected result version');if(new URL(r.finalDisplayedUrl||r.finalUrl).pathname!==new URL(url).pathname)throw new Error('Unexpected final route');samples.push(r);
}
await writeFile(out,JSON.stringify({url,samples},null,2),{flag:'wx'});
