#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
const x = JSON.parse(await readFile('artifacts/performance/comparison/metrics.json', 'utf8'));
const delta = (before, after) => Number.isFinite(before) && Number.isFinite(after) ? (after - before).toFixed(1) : '—';
const rows = Object.keys(x.after).map(k => { const b = x.before[k], a = x.after[k]; return `| ${k} | ${a.score ?? '—'} | ${a.lcp ?? '—'} (${delta(b.lcp,a.lcp)}) | ${a.fcp ?? '—'} (${delta(b.fcp,a.fcp)}) | ${a.tbt ?? '—'} (${delta(b.tbt,a.tbt)}) | ${a.cls ?? '—'} (${delta(b.cls,a.cls)}) | ${a.bytes ?? '—'} (${delta(b.bytes,a.bytes)}) | ${a.requests ?? '—'} (${delta(b.requests,a.requests)}) |`; });
const report = `# Performance comparison\n\nControlled local lab evidence. Positive deltas are increases for time/bytes metrics.\n\n| Route | Score | LCP | FCP | TBT | CLS | Bytes | Requests |\n|---|---:|---:|---:|---:|---:|---:|---:|\n${rows.join('\n')}\n\nRaw evidence: metrics.json, phase manifests, Lighthouse JSON, screenshots, and functional checks.`;
await writeFile('artifacts/performance/comparison/summary.md', report); console.log(report);
