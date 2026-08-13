#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import('playwright');
const routes = process.argv.slice(2).filter(Boolean); const base = process.env.PERF_BASE_URL || 'http://127.0.0.1:8080';
const out = process.env.PERF_OUT || 'artifacts/performance';
if (!routes.length) throw new Error('Pass route paths');
await mkdir(out, { recursive: true }); const executablePath = process.env.PERF_EXECUTABLE_PATH || '/snap/bin/chromium'; const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) }); const results = [];
for (const route of routes) { const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }); const url = new URL(route, base).href; await page.goto(url, { waitUntil: 'networkidle' }); const checks = { url: page.url(), title: await page.title(), cta: await page.locator('a,button').filter({ hasText: /reserve free intro|text sandy|free intro/i }).count(), form: await page.locator('form').count() }; await page.screenshot({ path: `${out}/${route.replaceAll('/', '_') || 'home'}.png`, fullPage: true }); if (!checks.title || (!checks.cta && !checks.form)) throw new Error(`Functional check failed: ${route}`); results.push({ route, ...checks }); await page.close(); }
await writeFile(`${out}/functional.json`, JSON.stringify(results, null, 2)); await browser.close();
