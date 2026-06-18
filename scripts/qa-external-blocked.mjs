import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ROOT, csvEscape } from './url-qa-lib.mjs';

const execFileAsync = promisify(execFile);
const REPORT_PATH = path.join(ROOT, 'crawl-reports', 'external-blocked-links.csv');

const BLOCKED_URLS = [
  'https://cancercontrol.cancer.gov/sites/default/files/2020-06/goal_intent_attain.pdf?utm_source=chatgpt.com',
  'https://www.gracieuniversity.com/Pages/Public/Course?enc=R5U2QaJ8C2JmDn4K2pJfOA%3D%3D',
  'https://journals.lww.com/acsm-msse/fulltext/2007/02000/exercise_and_fluid_replacement.22.aspx',
  'https://www.governor.ny.gov/news/governor-hochul-announces-transformational-projects-tannersville-part-10-million-downtown',
  'https://www.ny.gov/counties/ulster',
  'https://www.waterqualitydata.us/provider/NWIS/USGS-NY/USGS-01362250/',
  'https://publications.aap.org/aapnews/news/10313/Good-moves-Martial-arts-can-offer-striking',
  'https://hunterfoundation.org/event/jiu-jitsu-with-sensei-sandy/2026-03-02/',
  'https://www.ny.gov/counties/greene',
  'https://www.sciencedirect.com/science/article/abs/pii/S1359178921000653',
  'https://publications.aap.org/pediatrics/article/138/5/e20162591/60503/Media-and-Young-Minds',
  'https://nces.ed.gov/learn/blog/measuring-student-safety-new-data-bullying-rates-school',
  'https://www.sciencedirect.com/science/article/pii/S2666374023000882',
  'https://www.unesco.org/en/articles/school-violence-and-bullying-major-global-issue-new-unesco-publication-finds',
  'https://www.ufc.com/event/ufc-1',
  'https://smoothcomp.com/fr/profile/196686',
  'https://aasm.org/recharge-with-sleep-pediatric-sleep-recommendations-promoting-optimal-health/',
  'https://pure.amsterdamumc.nl/en/publications/injury-prevalence-among-brazilian-jiu-jitsu-practitioners-globall/',
  'https://www.greenehealthnetwork.com/wp-content/uploads/2018/05/PhysicalActivity-in-the-Twin-Counties-2-12-18.pdf',
  'https://aasm.org/advocacy/position-statements/child-sleep-duration-health-advisory/',
  'https://hunterfoundation.org/event/jiu-jitsu-with-sensei-sandy/2026-02-25/',
  'https://www.ny.gov/downtown-revitalization-initiative/downtown-revitalization-initiative-round-five',
  'https://www.mmafighting.com/latest-news/452254/this-is-the-start-of-eternity-gracies-century-jiu-jitsu-brazil-ufc',
  'https://dec.ny.gov/things-to-do/hiking/catskill-hikes'
];

const toCsv = (rows) => {
  const lines = [['url', 'file', 'line', 'sample'].map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push([row.url, row.file, String(row.line), row.sample].map(csvEscape).join(','));
  }
  return `${lines.join('\n')}\n`;
};

const main = async () => {
  const { stdout } = await execFileAsync('git', ['ls-files', '*.html', '*.json'], { cwd: ROOT });
  const files = stdout.split('\n').map((v) => v.trim()).filter(Boolean);
  const hits = [];

  for (const relPath of files) {
    const fullPath = path.join(ROOT, relPath);
    let content = '';
    try {
      content = await fs.readFile(fullPath, 'utf8');
    } catch (error) {
      if (error && error.code === 'ENOENT') continue;
      throw error;
    }
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      for (const url of BLOCKED_URLS) {
        if (!line.includes(url)) continue;
        hits.push({
          url,
          file: relPath,
          line: i + 1,
          sample: line.trim().slice(0, 220)
        });
      }
    }
  }

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(REPORT_PATH, toCsv(hits), 'utf8');

  if (hits.length > 0) {
    console.error(`qa-external-blocked failed: found ${hits.length} blocked URL occurrence(s).`);
    for (const hit of hits.slice(0, 30)) {
      console.error(`- ${hit.url} :: ${hit.file}:${hit.line}`);
    }
    if (hits.length > 30) {
      console.error(`... ${hits.length - 30} more`);
    }
    process.exit(1);
  }

  console.log('qa-external-blocked passed.');
};

main().catch((error) => {
  console.error(`qa-external-blocked failed: ${error.message}`);
  process.exit(1);
});
