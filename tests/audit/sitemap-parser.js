import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '../../');

function extractUrls(xmlContent) {
  const urls = [];
  const regex = /<loc>(.*?)<\/loc>/g;
  let match;
  while ((match = regex.exec(xmlContent)) !== null) {
    if (!match[1].endsWith('.xml')) {
      urls.push(match[1]);
    }
  }
  return urls;
}

export function getSitemapUrls() {
  const urls = new Set();
  const sitemaps = ['pages-sitemap.xml', 'blog-sitemap.xml', 'video-sitemap.xml'];
  
  for (const sitemap of sitemaps) {
    const sitemapPath = path.join(ROOT, sitemap);
    if (fs.existsSync(sitemapPath)) {
      const content = fs.readFileSync(sitemapPath, 'utf-8');
      const extracted = extractUrls(content);
      for (const url of extracted) {
        let localUrl = url.replace('https://senseisandy.com', '');
        if (!localUrl) localUrl = '/';
        urls.add(localUrl);
      }
    }
  }
  
  const urlList = Array.from(urls);
  // Default to ['/'] if sitemaps aren't built or found
  return urlList.length > 0 ? urlList : ['/'];
}
