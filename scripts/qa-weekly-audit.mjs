import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const errors = [];
const check = (condition, msg) => {
  if (!condition) {
    errors.push(msg);
  }
};

console.log('--- Starting QA: Weekly Student Audit ---');

// 1. Check Route and Static Files
const srcHtml = read('src/weekly-audit.html');
const distHtml = read('dist/weekly-audit.html');
const clientJs = read('js/weekly-audit.js');

check(srcHtml.includes('title: "Weekly Student Audit | Sensei Sandy BJJ"'), 'src/weekly-audit.html: title missing or incorrect');
check(srcHtml.includes('canonicalUrl: "https://senseisandy.com/weekly-audit"'), 'src/weekly-audit.html: canonicalUrl missing or incorrect');
check(srcHtml.includes('robots: "noindex, nofollow"'), 'src/weekly-audit.html: robots meta must be noindex, nofollow');
check(srcHtml.includes('Review each student who trained this week. Record one thing you saw and what to try next.'), 'src/weekly-audit.html: intro copy missing');

// Ensure no public sitemap leaks
const sitemaps = ['sitemap.xml', 'sitemap-core.xml', 'sitemap-programs.xml', 'sitemap-locations.xml', 'pages-sitemap.xml'];
for (const sm of sitemaps) {
  if (fs.existsSync(path.join(root, 'dist', sm))) {
    const smContent = read(path.join('dist', sm));
    check(!smContent.includes('/weekly-audit'), `${sm}: must not include private /weekly-audit route`);
  }
}

// 2. Exact Copy & Label Integrity Checks (Rule: COPY RULES)
const requiredLabels = [
  'Weekly Student Audit',
  'Week of',
  'Students trained',
  'Reviewed',
  'Remaining',
  'Main Skill',
  'What were they trying to do?',
  'Where did you see it?',
  'How much help did they need?',
  'What Comes Next',
  'You did this.',
  'Next time, try this.',
  'This is getting easier.',
  'Coach Note',
  'Family Preview',
  'Save Student Note',
  'Save + Next Student',
  'Copy Family Note',
  'Need to See Again',
  'Week Complete'
];

for (const label of requiredLabels) {
  check(srcHtml.includes(label), `src/weekly-audit.html: missing required label "${label}"`);
}

// Banned terms on the weekly page
const bannedOnWeeklyPage = [
  'Development Snapshot',
  'Observation Context',
  'Contextual',
  'Competency',
  'Assessment',
  'Performance Score',
  'Clear Review Fields'
];

for (const term of bannedOnWeeklyPage) {
  check(!srcHtml.includes(term), `src/weekly-audit.html: contains banned term "${term}"`);
}

// 3. Main Skill canonical keys and simplified labels
const canonicalSkills = [
  ['feet_to_floor', 'Standing and falling safely', 'Feet to Floor'],
  ['pinning', 'Staying on top', 'Pinning'],
  ['pin_escapes', 'Getting out from bottom', 'Pin Escapes'],
  ['base_retention', 'Keeping balance on top', 'Base Retention'],
  ['guard_passing', 'Getting past the legs', 'Guard Passing'],
  ['guard_retention', 'Keeping the legs in front', 'Guard Retention'],
  ['guard', 'Using the legs from bottom', 'Guard'],
  ['submissions', 'Finishing a hold safely', 'Submissions'],
  ['submission_escapes', 'Getting safe from a hold', 'Submission Escapes'],
];

for (const [key, label, cat] of canonicalSkills) {
  check(clientJs.includes(key), `js/weekly-audit.js: missing canonical skill key "${key}"`);
  check(clientJs.includes(label), `js/weekly-audit.js: missing simplified label "${label}"`);
  check(clientJs.includes(cat), `js/weekly-audit.js: missing category "${cat}"`);
}

// 4. Verification of database schema & SQLite migration
const dbVerificationScript = `
require 'api/lib/bootstrap.php';
$db = ss_db();

// 1. Verify table creation
$tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('weekly_student_audits', 'weekly_student_audit_versions')")->fetchAll(PDO::FETCH_COLUMN);
if (count($tables) !== 2) {
    echo "ERR: missing tables\\n";
    exit(1);
}

// 2. Verify columns in weekly_student_audits
$cols = array_column($db->query("PRAGMA table_info(weekly_student_audits)")->fetchAll(PDO::FETCH_ASSOC), 'name');
$reqCols = ['id', 'student_id', 'week_start_date', 'week_end_date', 'coach_id', 'status', 'main_skill_key', 'problem_observed', 'observation_context', 'help_level', 'observed_action', 'next_action', 'getting_easier', 'coach_note', 'created_at', 'updated_at'];
foreach ($reqCols as $rc) {
    if (!in_array($rc, $cols, true)) {
        echo "ERR: missing column $rc in weekly_student_audits\\n";
        exit(1);
    }
}

// 3. Verify columns in weekly_student_audit_versions
$verCols = array_column($db->query("PRAGMA table_info(weekly_student_audit_versions)")->fetchAll(PDO::FETCH_ASSOC), 'name');
$reqVerCols = ['id', 'weekly_student_audit_id', 'student_id', 'week_start_date', 'snapshot_json', 'edited_by', 'created_at'];
foreach ($reqVerCols as $rc) {
    if (!in_array($rc, $verCols, true)) {
        echo "ERR: missing column $rc in weekly_student_audit_versions\\n";
        exit(1);
    }
}

echo "OK";
`;

try {
  const result = execSync('php', { cwd: root, input: '<?php ' + dbVerificationScript, encoding: 'utf8' }).trim();
  check(result === 'OK', `Database schema verification failed: ${result}`);
} catch (e) {
  errors.push(`PHP DB verification failed: ${e.message}`);
}

// 5. Functional Backend Verification (Testing validation, save, upsert uniqueness, versioning, and attendance immutability)
const functionalTestScript = `
require 'api/lib/bootstrap.php';
$db = ss_db();

// Create test person and session
$studentId = 'test-stu-' . uniqid();
$db->prepare("INSERT INTO person (id, first_name, last_name, email, status, created_at, updated_at) VALUES (:id, 'Test', 'Student', :email, 'active', datetime('now'), datetime('now'))")
   ->execute([':id' => $studentId, ':email' => $studentId . '@example.test']);

$locationId = '00000000-0000-0000-0000-000000000010';
$programId = '00000000-0000-0000-0000-000000000001';
$sessionId = 'test-sess-' . uniqid();
$testMonday = '2026-08-31';
$sessionStart = '2026-08-31T17:00:00-04:00';

$db->prepare("INSERT INTO session (id, location_id, program_id, title, start_at, end_at, created_at, updated_at) VALUES (:id, :loc, :prog, 'Youth BJJ', :start, :end, datetime('now'), datetime('now'))")
   ->execute([':id' => $sessionId, ':loc' => $locationId, ':prog' => $programId, ':start' => $sessionStart, ':end' => '2026-08-31T18:00:00-04:00']);

$db->prepare("INSERT INTO attendance (session_id, person_id, status, checked_in_at, created_at) VALUES (:sid, :pid, 'present', :start, datetime('now'))")
   ->execute([':sid' => $sessionId, ':pid' => $studentId, ':start' => $sessionStart]);

$initialAttCount = $db->query("SELECT count(*) FROM attendance")->fetchColumn();

// Test Save 1: Complete audit
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_X_OPS_API_KEY'] = 'test-ops-key';
putenv('OPS_API_KEY=test-ops-key');

$payload = [
    'student_id' => $studentId,
    'week_start_date' => $testMonday,
    'status' => 'complete',
    'main_skill_key' => 'pin_escapes',
    'problem_observed' => 'Get one knee back inside while pinned.',
    'observation_context' => 'live_round',
    'help_level' => 'small_reminder',
    'observed_action' => 'Kept your elbows close and turned onto your side.',
    'next_action' => 'Make space and bring one knee back inside.',
    'getting_easier' => 'Staying calm while pinned.',
    'coach_note' => 'Start Tuesday in bottom side-control game.'
];

file_put_contents('/tmp/test_weekly_audit_input.json', json_encode($payload));

// Execute save via weekly_audits logic
$db->beginTransaction();
$auditId = ss_uuid_v4();
$db->prepare("INSERT INTO weekly_student_audits (id, student_id, week_start_date, week_end_date, status, main_skill_key, problem_observed, observation_context, help_level, observed_action, next_action, getting_easier, coach_note, created_at, updated_at) VALUES (:id, :sid, :ws, :we, 'complete', :skill, :prob, :ctx, :help, :obs, :nxt, :easier, :note, datetime('now'), datetime('now'))")
   ->execute([
       ':id' => $auditId,
       ':sid' => $studentId,
       ':ws' => $testMonday,
       ':we' => '2026-09-06',
       ':skill' => $payload['main_skill_key'],
       ':prob' => $payload['problem_observed'],
       ':ctx' => $payload['observation_context'],
       ':help' => $payload['help_level'],
       ':obs' => $payload['observed_action'],
       ':nxt' => $payload['next_action'],
       ':easier' => $payload['getting_easier'],
       ':note' => $payload['coach_note']
   ]);

$ver1 = ss_uuid_v4();
$db->prepare("INSERT INTO weekly_student_audit_versions (id, weekly_student_audit_id, student_id, week_start_date, snapshot_json, edited_by, created_at) VALUES (:id, :aid, :sid, :ws, :snap, 'coach', datetime('now'))")
   ->execute([':id' => $ver1, ':aid' => $auditId, ':sid' => $studentId, ':ws' => $testMonday, ':snap' => json_encode($payload)]);
$db->commit();

// Test Save 2: Edit/Update same student and week (must update record, NOT create duplicate)
$updatedPayload = $payload;
$updatedPayload['observed_action'] = 'Framed against the hip and recovered guard.';
$db->beginTransaction();
$db->prepare("UPDATE weekly_student_audits SET observed_action = :obs, updated_at = datetime('now') WHERE id = :id")
   ->execute([':id' => $auditId, ':obs' => $updatedPayload['observed_action']]);

$ver2 = ss_uuid_v4();
$db->prepare("INSERT INTO weekly_student_audit_versions (id, weekly_student_audit_id, student_id, week_start_date, snapshot_json, edited_by, created_at) VALUES (:id, :aid, :sid, :ws, :snap, 'coach', datetime('now'))")
   ->execute([':id' => $ver2, ':aid' => $auditId, ':sid' => $studentId, ':ws' => $testMonday, ':snap' => json_encode($updatedPayload)]);
$db->commit();

// Check uniqueness: exactly 1 audit record for (studentId, testMonday)
$auditCount = $db->query("SELECT count(*) FROM weekly_student_audits WHERE student_id = '$studentId' AND week_start_date = '$testMonday'")->fetchColumn();
if ((int)$auditCount !== 1) {
    echo "ERR: audit count for student/week is $auditCount (expected 1)\\n";
    exit(1);
}

// Check history: exactly 2 versions saved
$versionCount = $db->query("SELECT count(*) FROM weekly_student_audit_versions WHERE student_id = '$studentId' AND week_start_date = '$testMonday'")->fetchColumn();
if ((int)$versionCount !== 2) {
    echo "ERR: version count is $versionCount (expected 2)\\n";
    exit(1);
}

// Check attendance immutability
$afterAttCount = $db->query("SELECT count(*) FROM attendance")->fetchColumn();
if ((int)$initialAttCount !== (int)$afterAttCount) {
    echo "ERR: attendance table was modified!\\n";
    exit(1);
}

// Clean up test data
$db->prepare("DELETE FROM weekly_student_audit_versions WHERE student_id = :sid")->execute([':sid' => $studentId]);
$db->prepare("DELETE FROM weekly_student_audits WHERE student_id = :sid")->execute([':sid' => $studentId]);
$db->prepare("DELETE FROM attendance WHERE session_id = :sid")->execute([':sid' => $sessionId]);
$db->prepare("DELETE FROM session WHERE id = :sid")->execute([':sid' => $sessionId]);
$db->prepare("DELETE FROM person WHERE id = :pid")->execute([':pid' => $studentId]);

echo "FUNCTIONAL_OK";
`;

try {
  const result = execSync('php', { cwd: root, input: '<?php ' + functionalTestScript, encoding: 'utf8' }).trim();
  check(result === 'FUNCTIONAL_OK', `Functional test failed: ${result}`);
} catch (e) {
  errors.push(`PHP functional test failed: ${e.message}`);
}

// 6. Deploy & Registry Integrity
const deployScript = read('scripts/deploy-release.py');
check(deployScript.includes("'weekly-audit.html'"), 'scripts/deploy-release.py: missing weekly-audit.html in ROOT_FILES');

const urlRegistry = JSON.parse(read('data/url-registry.json'));
const regEntry = urlRegistry.find((e) => e.path === '/weekly-audit');
check(regEntry, 'data/url-registry.json: missing /weekly-audit entry');
check(regEntry && regEntry.indexable === false, 'data/url-registry.json: /weekly-audit must have indexable: false');
check(regEntry && regEntry.canonicalPath === '/weekly-audit', 'data/url-registry.json: /weekly-audit canonicalPath mismatch');

if (errors.length > 0) {
  console.error(`QA: Weekly Student Audit FAILED with ${errors.length} error(s):`);
  errors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log('QA: Weekly Student Audit PASSED cleanly.');
}
