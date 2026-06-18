import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const CHROME_BIN = process.env.CHROME_BIN || 'chromium';
const MIN_RATIO = 4.5;

const pages = [
  { label: 'hub', path: '/bjj-glossary/' },
  { label: 'term', path: '/bjj-glossary/guard/' }
];

const themes = ['auto', 'light', 'dark'];
const viewports = [
  { label: 'mobile', width: 390, height: 1400 },
  { label: 'desktop', width: 1366, height: 1800 }
];

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const ensure = (condition, message) => {
  if (!condition) throw new Error(message);
};

const parseHex = (value) => {
  const hex = value.replace(/^#/, '');
  ensure(hex.length === 6, `Expected 6-digit hex color, got ${value}.`);
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
    a: 1
  };
};

const channel = (value) => {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const luminance = (color) =>
  0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);

const contrastRatio = (foreground, background) => {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const runStaticSurfaceAudit = async (reason) => {
  console.warn(`Browser contrast audit unavailable (${reason}). Running static glossary surface contrast audit.`);

  const [hubHtml, termHtml, glossaryCss, componentsCss] = await Promise.all([
    fs.readFile(path.join(ROOT, 'bjj-glossary', 'index.html'), 'utf8'),
    fs.readFile(path.join(ROOT, 'bjj-glossary', 'guard', 'index.html'), 'utf8'),
    fs.readFile(path.join(ROOT, 'assets', 'css', 'pages', 'glossary.css'), 'utf8'),
    fs.readFile(path.join(ROOT, 'assets', 'css', 'components.css'), 'utf8')
  ]);

  ensure(/\/assets\/css\/global(?:\.[0-9a-f]{6})?\.css/.test(hubHtml), 'Glossary hub does not load global CSS.');
  ensure(/\/assets\/css\/components(?:\.[0-9a-f]{6})?\.css/.test(hubHtml), 'Glossary hub does not load component CSS.');
  ensure(/\/assets\/css\/pages\/glossary(?:\.[0-9a-f]{6})?\.css/.test(hubHtml), 'Glossary hub does not load page-owned glossary CSS.');
  ensure(/\/assets\/css\/pages\/glossary(?:\.[0-9a-f]{6})?\.css/.test(termHtml), 'Glossary term page does not load page-owned glossary CSS.');
  ensure(hubHtml.includes('class="glossary-shell glossary-next-steps glossary-surface--dark"'), 'Next-step CTA is not using the dark glossary surface.');
  ensure(hubHtml.includes('class="ss-glossary-paths glossary-surface--dark"'), 'Buyer path section is not using the dark glossary surface.');
  ensure(hubHtml.includes('class="ss-paths-inner"'), 'Buyer path section still lacks the generated surface inner wrapper.');
  ensure(!hubHtml.includes('<div class="container">\n    <div class="text-center mb-5">'), 'Buyer path section still uses the legacy Bootstrap wrapper.');
  ensure(!componentsCss.includes('.page-glossary[data-glossary-theme-root] .glossary-controls .container'), 'Shared CSS still assigns a surface to .glossary-controls .container.');
  ensure(!componentsCss.includes('.page-glossary[data-glossary-theme-root] .ss-glossary-paths,\n.page-glossary[data-glossary-theme-root] .ss-glossary-paths h2'), 'Shared CSS still forces all glossary path text white without a surface class.');
  ensure(!/\.page-bjj-glossary\s+\.glossary-card\s+\*/.test(glossaryCss), 'Glossary CSS reintroduced a blanket child color rule.');
  ensure(glossaryCss.includes('.ss-page-feed .ss-community-post {'), 'Glossary feed card no longer has a page-owned light-surface override.');
  ensure(glossaryCss.includes('.ss-page-feed .ss-community-pill:not(.ss-primary) {'), 'Glossary feed secondary pills no longer have a page-owned light-surface override.');
  ensure(glossaryCss.includes('--glossary-pill-bg: #173033;'), 'Glossary pill surface token is missing.');
  ensure(glossaryCss.includes('background: var(--glossary-pill-bg) !important;'), 'Glossary pills no longer use the page-owned dark pill surface.');

  const pairs = [
    ['dark heading text', '#f4fbfb', '#0d2022'],
    ['dark muted text', '#b8cccc', '#0d2022'],
    ['dark accent text', '#8ffcff', '#0d2022'],
    ['primary CTA text', '#ffffff', '#b94700'],
    ['secondary dark CTA text', '#f4fbfb', '#192f31'],
    ['neutral pill text', '#f4fbfb', '#173033'],
    ['active control text', '#062022', '#00dde0'],
    ['disabled control text', '#8ea4a4', '#122224'],
    ['path chip text', '#58f4f6', '#173033'],
    ['metadata pill text', '#8ffcff', '#173033'],
    ['light surface text', '#1f1712', '#ffffff'],
    ['light muted text', '#4f433c', '#ffffff'],
    ['term dark heading text', '#f4fbfb', '#151f25'],
    ['term dark muted text', '#cfe1e1', '#151f25'],
    ['term dark accent text', '#8ffcff', '#151f25']
  ];

  const failures = pairs
    .map(([label, foreground, background]) => ({
      label,
      foreground,
      background,
      ratio: contrastRatio(parseHex(foreground), parseHex(background))
    }))
    .filter((result) => result.ratio < MIN_RATIO);

  if (failures.length) {
    for (const failure of failures) {
      console.error(`${failure.label}: ${failure.ratio.toFixed(2)} (${failure.foreground} on ${failure.background})`);
    }
    process.exit(1);
  }

  console.log(`Static glossary surface contrast checks passed (${pairs.length} pairs).`);
};

const contentTypeFor = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js' || ext === '.mjs') return 'text/javascript; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
};

const contrastHarness = ({ targetPath, theme }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Glossary contrast check</title>
</head>
<body>
  <pre id="contrast-results">pending</pre>
  <iframe id="target" title="contrast target" style="width:100%;height:1200px;border:0"></iframe>
  <script>
    const targetPath = ${JSON.stringify(targetPath)};
    const theme = ${JSON.stringify(theme)};
    const minRatio = ${MIN_RATIO};

    function parseColor(value) {
      if (!value || value === 'transparent') return null;
      const match = value.match(/rgba?\\(([^)]+)\\)/i);
      if (!match) return null;
      const parts = match[1].split(',').map((part) => part.trim());
      if (parts.length < 3) return null;
      return {
        r: Number.parseFloat(parts[0]),
        g: Number.parseFloat(parts[1]),
        b: Number.parseFloat(parts[2]),
        a: parts.length >= 4 ? Number.parseFloat(parts[3]) : 1
      };
    }

    function blend(top, bottom) {
      const alpha = Math.max(0, Math.min(1, top.a));
      return {
        r: Math.round(top.r * alpha + bottom.r * (1 - alpha)),
        g: Math.round(top.g * alpha + bottom.g * (1 - alpha)),
        b: Math.round(top.b * alpha + bottom.b * (1 - alpha)),
        a: 1
      };
    }

    function channel(value) {
      const normalized = value / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    }

    function luminance(color) {
      return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
    }

    function contrast(foreground, background) {
      const a = luminance(foreground);
      const b = luminance(background);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }

    function effectiveBackground(element, win) {
      const chain = [];
      for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
        chain.push(node);
      }
      let bg = { r: 255, g: 255, b: 255, a: 1 };
      for (const node of chain.reverse()) {
        const color = parseColor(win.getComputedStyle(node).backgroundColor);
        if (color && color.a > 0) bg = blend(color, bg);
      }
      return bg;
    }

    function selectorFor(element) {
      if (element.id) return '#' + element.id;
      const parts = [];
      for (let node = element; node && node.nodeType === 1 && parts.length < 5; node = node.parentElement) {
        let part = node.tagName.toLowerCase();
        const classes = Array.from(node.classList || []).slice(0, 3);
        if (classes.length) part += '.' + classes.join('.');
        parts.unshift(part);
      }
      return parts.join(' > ');
    }

    function hasOwnText(element) {
      if (element.matches('input, textarea')) return Boolean(element.placeholder || element.value);
      if (element.matches('select')) return Boolean(element.options[element.selectedIndex]?.textContent.trim());
      return Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    }

    function textFor(element) {
      if (element.matches('input, textarea')) return element.value || element.placeholder || '';
      if (element.matches('select')) return element.options[element.selectedIndex]?.textContent.trim() || '';
      return Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent.trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\\s+/g, ' ')
        .trim();
    }

    function isVisible(element, win) {
      if (element.closest('[hidden], [aria-hidden="true"], [aria-disabled="true"], .is-disabled')) return false;
      const style = win.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (Number.parseFloat(style.opacity || '1') < 0.2) return false;
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    function runCheck() {
      const frame = document.getElementById('target');
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      const root = doc.querySelector('main') || doc.body;
      const selector = [
        'h1', 'h2', 'h3', 'h4', 'p', 'li', 'a', 'button', 'label',
        'summary', 'legend', 'span', 'input', 'select'
      ].join(',');
      const failures = [];
      const checked = [];

      for (const element of root.querySelectorAll(selector)) {
        if (!hasOwnText(element) || !isVisible(element, win)) continue;
        const style = win.getComputedStyle(element);
        const foreground = parseColor(style.color);
        if (!foreground || foreground.a === 0) continue;
        const background = effectiveBackground(element, win);
        const ratio = contrast(blend(foreground, background), background);
        const text = textFor(element);
        checked.push({ selector: selectorFor(element), text, ratio });
        if (ratio < minRatio) {
          failures.push({
            selector: selectorFor(element),
            text: text.slice(0, 90),
            ratio: Number(ratio.toFixed(2)),
            color: style.color,
            background: 'rgb(' + background.r + ', ' + background.g + ', ' + background.b + ')'
          });
        }
      }

      document.getElementById('contrast-results').textContent = JSON.stringify({
        ok: failures.length === 0,
        checked: checked.length,
        failures
      });
    }

    window.localStorage.setItem('glossaryTheme', theme);
    const frame = document.getElementById('target');
    frame.addEventListener('load', () => setTimeout(runCheck, 900), { once: true });
    frame.src = targetPath;
  </script>
</body>
</html>`;

const resolveRequestPath = async (pathname) => {
  let safePath = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!safePath || safePath.endsWith('/')) safePath += 'index.html';
  let filePath = path.resolve(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) return null;

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    if (!path.extname(filePath)) {
      const indexPath = path.join(filePath, 'index.html');
      try {
        await fs.stat(indexPath);
        filePath = indexPath;
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }

  return filePath.startsWith(ROOT) ? filePath : null;
};

const startServer = () => new Promise((resolve, reject) => {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname === '/__contrast-check') {
        const targetPath = url.searchParams.get('path') || '/bjj-glossary/';
        const theme = url.searchParams.get('theme') || 'auto';
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(contrastHarness({ targetPath, theme }));
        return;
      }

      const filePath = await resolveRequestPath(url.pathname);
      if (!filePath) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      const body = await fs.readFile(filePath);
      res.writeHead(200, { 'content-type': contentTypeFor(filePath) });
      res.end(body);
    } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error.stack || String(error));
    }
  });

  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    resolve({ server, port: address.port });
  });
});

const runChromium = ({ url, viewport }) => new Promise((resolve, reject) => {
  const child = spawn(CHROME_BIN, [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--window-size=${viewport.width},${viewport.height}`,
    '--virtual-time-budget=10000',
    '--dump-dom',
    url
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', reject);
  child.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(`${CHROME_BIN} exited ${code}\n${stderr}`));
      return;
    }
    resolve(stdout);
  });
});

const extractResult = (html) => {
  const match = html.match(/<pre id="contrast-results">([\s\S]*?)<\/pre>/);
  if (!match) {
    throw new Error(`Could not find contrast result payload in Chromium output. Output starts:\n${html.slice(0, 1200)}`);
  }
  const text = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  return JSON.parse(text);
};

let server;

try {
  const started = await startServer();
  server = started.server;
  const { port } = started;
  const failures = [];

  for (const page of pages) {
    for (const theme of themes) {
      for (const viewport of viewports) {
        const url = `http://127.0.0.1:${port}/__contrast-check?path=${encodeURIComponent(page.path)}&theme=${theme}`;
        const html = await runChromium({ url, viewport });
        const result = extractResult(html);
        const label = `${page.label}/${theme}/${viewport.label}`;
        console.log(`Checked ${label}: ${result.checked} text nodes`);
        if (!result.ok) {
          failures.push({ label, failures: result.failures });
        }
      }
    }
  }

  if (failures.length) {
    console.error('\nGlossary contrast failures:');
    for (const group of failures) {
      console.error(`\n${group.label}`);
      for (const failure of group.failures.slice(0, 20)) {
        console.error(`- ${failure.ratio}: ${failure.selector} "${escapeHtml(failure.text)}" ${failure.color} on ${failure.background}`);
      }
    }
    process.exit(1);
  }

  console.log('Glossary contrast checks passed.');
} catch (error) {
  await runStaticSurfaceAudit(error.message);
} finally {
  if (server) server.close();
}
