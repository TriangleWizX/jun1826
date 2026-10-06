#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile, stat, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.gif':'image/gif','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.mp4':'video/mp4','.webm':'video/webm','.pdf':'application/pdf','.txt':'text/plain'};
export async function startServer(siteDir,port=8080,token=''){
 const root=await realpath(siteDir);
 async function content(file,seen=new Set()){if(seen.has(file)||seen.size>12)throw new Error('SSI include cycle/depth');const body=await readFile(file);if(extname(file)!=='.html')return body;const next=new Set([...seen,file]);let html=body.toString('utf8');const matches=[...html.matchAll(/<!--#include\s+virtual=["']([^"']+)["']\s*-->/g)];for(const match of matches){if(!match[1].startsWith('/'))throw new Error('SSI must be root-relative');const target=await realpath(resolve(root,'.'+match[1]));if(!target.startsWith(root+sep))throw new Error('SSI outside root');html=html.replace(match[0],(await content(target,next)).toString('utf8'));}return Buffer.from(html);}
 const server=createServer(async(req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const pathname=decodeURIComponent(req.url.split('?')[0]);
 if(pathname==='/__perf_ready'&&token){res.writeHead(200,{'content-type':'text/plain'});res.end(token);return;}
 if(pathname.includes('\0')||pathname.includes('\\')||pathname.split('/').includes('..')){res.writeHead(400);res.end();return;}
 const rel=pathname.replace(/^\/+/,''),candidates=pathname==='/'?['index.html']:pathname.endsWith('/')?[`${rel}index.html`]:extname(rel)?[rel]:[`${rel}/index.html`,`${rel}.html`];
 for(const candidate of candidates){const file=resolve(root,candidate);if(!file.startsWith(root+sep))continue;try{const actual=await realpath(file);if(!actual.startsWith(root+sep)||!(await stat(actual)).isFile())continue;const body=await content(actual);res.writeHead(200,{'content-type':types[extname(actual)]||'application/octet-stream','content-length':body.length,'cache-control':'no-store'});res.end(req.method==='HEAD'?undefined:body);return;}catch(error){if(!['ENOENT','ENOTDIR'].includes(error.code))throw error;}}
 res.writeHead(404);res.end('Not found');
 }catch(error){res.writeHead(error instanceof URIError?400:500);res.end('Request failed');}});
 await new Promise((ok,no)=>{server.once('error',no);server.listen(port,'127.0.0.1',ok);});return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){const server=await startServer(process.argv[2]||'dist',Number(process.argv[3]||8080));console.log(`Listening on ${server.address().port}`);}
