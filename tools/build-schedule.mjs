import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

// Import the data
const schedulePath = path.join(root, 'data', 'schedule.js');
let rawData = fs.readFileSync(schedulePath, 'utf8');

// Quick and dirty parser for the simple JS export
let scheduleData = null;
try {
  // Strip export const schedule = 
  const jsonStr = rawData
    .replace('export const schedule =', '')
    .replace(/;\s*$/, '')
    // convert to JSON by adding quotes to keys if needed, but it's easier to just eval
    .trim();
  
  // Use Function to safely evaluate the object literal
  scheduleData = new Function(`return ${jsonStr}`)();
} catch (e) {
  console.error("Failed to parse schedule.js:", e);
  process.exit(1);
}

function generateCompact() {
  let html = `<!-- AUTO-GENERATED from data/schedule.js -->\n`;
  html += `<div class="schedule-compact">\n`;
  html += `  <h4 class="mb-3">Group Classes</h4>\n`;
  html += `  <ul class="list-unstyled">\n`;
  
  for (const cls of scheduleData.groupClasses) {
    html += `    <li class="mb-2">\n`;
    html += `      <strong>${cls.days.join(', ')}</strong><br>\n`;
    html += `      ${cls.audience}: ${cls.start}–${cls.end}\n`;
    if (cls.note) {
      html += `      <br><small class="text-muted">${cls.note}</small>\n`;
    }
    html += `    </li>\n`;
  }
  html += `  </ul>\n`;
  html += `  <div class="mt-2 mb-4 small text-muted">\n`;
  html += `    <p>All youth and adult classes are 45 minutes. The final 15 minutes are elective. Sandy will consult with you on how to use this time productively.</p>\n`;
  html += `  </div>\n`;
  html += `  <h4 class="mb-3 mt-4">Private Coaching</h4>\n`;
  html += `  <p class="small text-muted">Select Tuesday–Friday morning windows by request.</p>\n`;
  html += `</div>\n`;
  return html;
}

function generateFull() {
  let html = `<!-- AUTO-GENERATED from data/schedule.js -->\n`;
  html += `<div class="schedule-full">\n`;
  html += `  <div class="row">\n`;
  
  // Group Classes
  html += `    <div class="col-md-6 mb-4">\n`;
  html += `      <h3 class="h5 border-bottom pb-2 mb-3">Group Classes</h3>\n`;
  for (const cls of scheduleData.groupClasses) {
    html += `      <div class="card mb-3 shadow-sm border-0">\n`;
    html += `        <div class="card-body">\n`;
    html += `          <h4 class="h6 fw-bold text-success mb-1">${cls.audience} (${cls.format})</h4>\n`;
    html += `          <p class="mb-1 text-dark fw-medium">${cls.days.join(', ')}</p>\n`;
    html += `          <p class="mb-0 text-muted"><i class="bi bi-clock me-2"></i>${cls.start} – ${cls.end}</p>\n`;
    if (cls.note) {
      html += `          <p class="mt-2 mb-0 small text-danger"><i class="bi bi-info-circle me-1"></i>${cls.note}</p>\n`;
    }
    html += `        </div>\n`;
    html += `      </div>\n`;
  }
  html += `      <div class="mt-3 small text-muted">\n`;
  html += `        <p><strong>Note on class length:</strong> All youth and adult classes are 45 minutes of core instruction. The final 15 minutes of the hour are elective. Sandy will consult with you on how to use this time productively based on your skill level.</p>\n`;
  html += `      </div>\n`;
  html += `    </div>\n`;
  
  // Private Coaching
  html += `    <div class="col-md-6 mb-4">\n`;
  html += `      <h3 class="h5 border-bottom pb-2 mb-3">Private Coaching</h3>\n`;
  html += `      <p class="text-muted mb-3">Available by request during the following morning windows:</p>\n`;
  html += `      <ul class="list-group list-group-flush border-top-0">\n`;
  for (const priv of scheduleData.privateCoaching) {
    html += `        <li class="list-group-item bg-transparent px-0 border-light d-flex justify-content-between align-items-center">\n`;
    html += `          <span class="fw-medium">${priv.day}</span>\n`;
    html += `          <span class="text-muted small">${priv.start} – ${priv.end}</span>\n`;
    html += `        </li>\n`;
  }
  html += `      </ul>\n`;
  html += `    </div>\n`;
  
  html += `  </div>\n`;
  html += `</div>\n`;
  return html;
}

const compactHtml = generateCompact();
const fullHtml = generateFull();

fs.writeFileSync(path.join(root, '_includes', 'schedule-compact.html'), compactHtml);
fs.writeFileSync(path.join(root, '_includes', 'schedule-full.html'), fullHtml);

console.log('Successfully generated schedule components from data/schedule.js');
