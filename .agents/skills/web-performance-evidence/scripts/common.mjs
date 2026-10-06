import { readFile, readdir, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
export function args(argv=process.argv.slice(2)){const out={};for(let i=0;i<argv.length;i++){const key=argv[i];if(!key.startsWith('--'))throw new Error(`Unexpected argument ${key}`);out[key.slice(2)]=argv[i+1]&&!argv[i+1].startsWith('--')?argv[++i]:true;}return out;}
export function required(a,key){if(typeof a[key]!=='string'||!a[key])throw new Error(`Required --${key}`);return a[key];}
export function integer(value,fallback,min=1,max=65535){const n=Number(value??fallback);if(!Number.isInteger(n)||n<min||n>max)throw new Error(`Invalid integer ${value}`);return n;}
export const routeKey=route=>Buffer.from(route).toString('hex');
export function routes(value){const list=(value||'/,/free-bjj-intro-tannersville-ny,/schedule,/bjj-classes/kids-tannersville-ny,/bjj-classes/teens-tannersville-ny,/bjj-classes/adults-tannersville-ny,/options-pricing').split(',');if(new Set(list).size!==list.length||list.some(x=>!x.startsWith('/')||x.startsWith('//')||/[?#]/.test(x)))throw new Error('Routes must be unique origin-relative paths');return list;}
export const readJSON=async path=>JSON.parse(await readFile(path,'utf8'));
export const median=values=>{if(!values.length||values.some(v=>!Number.isFinite(v)))throw new Error('Missing/nonfinite measurement');const v=[...values].sort((a,b)=>a-b),m=Math.floor(v.length/2);return v.length%2?v[m]:(v[m-1]+v[m])/2;};
export function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v;}
export const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
export async function treeHash(dir){const h=createHash('sha256'),root=await realpath(dir);async function walk(path){for(const item of(await readdir(path,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const full=join(path,item.name);if(item.isSymbolicLink())throw new Error(`Site symlink unsupported: ${full}`);if(item.isDirectory())await walk(full);else if(item.isFile()){h.update(full.slice(root.length));h.update('\0');h.update(await readFile(full));h.update('\0');}}}await walk(root);return h.digest('hex');}
