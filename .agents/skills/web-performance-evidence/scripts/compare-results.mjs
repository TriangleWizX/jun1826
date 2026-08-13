#!/usr/bin/env node
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
const metric = (r, id) => r?.audits?.[id]?.numericValue ?? null;
async function phase(name) {
  const dir = `artifacts/performance/${name}/lighthouse`;
  const files = (await readdir(dir)).filter(f => f.endsWith('.json') && !/\.\d+\.json$/.test(f)).sort();
  const entries = await Promise.all(files.map(async file => {
    const data = JSON.parse(await readFile(`${dir}/${file}`, 'utf8'));
    const samples = data.samples ?? [];
    const median = id => { const values = samples.map(r => metric(r, id)).filter(Number.isFinite).sort((a,b) => a-b); return values.length ? values[Math.floor(values.length / 2)] : null; };
    const first = samples[0]; const categoryScore = samples.map(r => r.categories?.performance?.score * 100).filter(Number.isFinite).sort((a,b) => a-b); const breakdown = first?.audits?.['lcp-breakdown-insight']?.details?.items ?? []; const lcpNode = breakdown.find(item => item.type === 'node') ?? null; const lcpPhases = breakdown.find(item => item.type === 'table')?.items ?? null; const snippetUrl = lcpNode?.snippet?.match(/(?:src|poster)=\"([^\"]+)/)?.[1] ?? null; const resources = first?.audits?.['resource-summary']?.details?.items ?? []; const resourceBytes = type => resources.find(item => item.resourceType === type)?.transferSize ?? null; const total = resources.find(item => item.resourceType === 'total'); const requests = total?.requestCount ?? null;
    return [file.replace('.json', ''), { score: categoryScore.length ? categoryScore[Math.floor(categoryScore.length / 2)] : null, fcp: median('first-contentful-paint'), lcp: median('largest-contentful-paint'), speedIndex: median('speed-index'), tbt: median('total-blocking-time'), cls: median('cumulative-layout-shift'), ttfb: median('server-response-time'), bytes: total?.transferSize ?? median('total-byte-weight'), requests, jsBytes: resourceBytes('script'), cssBytes: resourceBytes('stylesheet'), imageBytes: resourceBytes('image'), fontBytes: resourceBytes('font'), lcpElement: lcpNode, lcpResource: snippetUrl, lcpPhases }];
  }));
  return Object.fromEntries(entries);
}
const metrics = { before: await phase('before'), after: await phase('after') };
await mkdir('artifacts/performance/comparison', { recursive: true });
await writeFile('artifacts/performance/comparison/metrics.json', JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));
