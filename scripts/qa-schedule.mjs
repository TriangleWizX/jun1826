import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

// Audit rules
const bannedStrings = [
  "10:00 AM Private",
  "10:00 AM Morning",
  "Thursday Closed",
  "Classes are 45 minutes",
  "Saturday No-Gi Small-Group Class",
  "5:00 PM Youth Small-Group Class"
];

function checkFile(filePath) {
  let errors = [];
  const content = fs.readFileSync(filePath, 'utf8');
  for (const banned of bannedStrings) {
    if (content.includes(banned)) {
      errors.push(`Found banned string: "${banned}"`);
    }
  }
  return errors;
}

function scanDirectory(dir) {
  let allErrors = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.tmb', 'tmp', 'archive', 'tools', 'scripts', '.claude'].includes(file)) {
        allErrors = allErrors.concat(scanDirectory(fullPath));
      }
    } else if (stat.isFile() && (fullPath.endsWith('.html') || fullPath.endsWith('.md') || fullPath.endsWith('.js'))) {
      const errors = checkFile(fullPath);
      if (errors.length > 0) {
        allErrors.push(`File: ${fullPath.replace(root, '')}\n  - ` + errors.join('\n  - '));
      }
    }
  }
  return allErrors;
}

console.log('Running automated schedule audit...');
const errors = scanDirectory(root);

if (errors.length > 0) {
  console.error('\nSchedule Audit Failed! The following files contain banned schedule strings:');
  console.error(errors.join('\n\n'));
  process.exit(1);
} else {
  console.log('Schedule Audit Passed! No banned strings found.');
  process.exit(0);
}
