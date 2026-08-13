#!/usr/bin/env node
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const args = new Map(process.argv.slice(2).map((v, i, a) => v.startsWith('--') ? [v, a[i + 1] ?? true] : [String(i), v]));
const url = args.get('--url'); const out = args.get('--out'); const n = Number(args.get('--samples') || 3);
if (!url || !out) throw new Error('Usage: lighthouse-run.mjs --url URL --out FILE [--samples 3]');
await mkdir(dirname(out), { recursive: true });
const samples = [];
for (let i = 1; i <= n; i++) {
  const target = out.replace(/\.json$/, `.${i}.json`);
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) { try { await exec('npx', ['--yes', 'lighthouse', url, '--output=json', `--output-path=${target}`, '--chrome-flags=--headless=new', '--quiet'], { maxBuffer: 1024 * 1024 * 20 }); lastError = null; break; } catch (error) { lastError = error; if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000)); } }
  if (lastError) throw lastError;
  samples.push(JSON.parse(await readFile(target, 'utf8')));
}
await writeFile(out, JSON.stringify({ url, samples }, null, 2));
