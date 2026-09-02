<?php
declare(strict_types=1);

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if (!in_array($method, ['GET', 'POST'], true)) {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

if (!ss_rate_limit('weekly_audits:' . ss_client_ip(), 60, 240)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

// Require coach/admin ops auth
ss_require_ops_auth();

$db = ss_db();

$canonicalSkills = [
    'feet_to_floor' => 'Standing and falling safely',
    'pinning' => 'Staying on top',
    'pin_escapes' => 'Getting out from bottom',
    'base_retention' => 'Keeping balance on top',
    'guard_passing' => 'Getting past the legs',
    'guard_retention' => 'Keeping the legs in front',
    'guard' => 'Using the legs from bottom',
    'submissions' => 'Finishing a hold safely',
    'submission_escapes' => 'Getting safe from a hold',
];

$allowedContexts = [
    'game' => 'Game',
    'positional_round' => 'Positional round',
    'live_round' => 'Live round',
    'guided_practice' => 'Guided practice',
    'other' => 'Other',
];

$allowedHelpLevels = [
    'none' => 'None',
    'small_reminder' => 'Small reminder',
    'active_coaching' => 'Active coaching',
    'full_help' => 'Full help',
    'need_to_see_again' => 'Need to see again',
];

if ($method === 'GET') {
    $action = ss_clean_string($_GET['action'] ?? 'week', 32);
    $studentIdParam = ss_clean_string($_GET['student_id'] ?? '', 64);

    // Sub-endpoint: Student history
    if ($action === 'history' || ($studentIdParam !== '' && $action !== 'week')) {
        if ($studentIdParam === '') {
            ss_json(422, ['ok' => false, 'error' => 'student_id is required for history']);
        }

        $histStmt = $db->prepare(
            'SELECT
                id, student_id, week_start_date, week_end_date, coach_id, status,
                main_skill_key, problem_observed, observation_context, help_level,
                observed_action, next_action, getting_easier, coach_note, created_at, updated_at
             FROM weekly_student_audits
             WHERE student_id = :student_id
             ORDER BY week_start_date DESC'
        );
        $histStmt->execute([':student_id' => $studentIdParam]);
        $rows = $histStmt->fetchAll(PDO::FETCH_ASSOC);

        $history = [];
        foreach ($rows as $row) {
            $key = (string)($row['main_skill_key'] ?? '');
            $history[] = [
                'id' => (string)$row['id'],
                'student_id' => (string)$row['student_id'],
                'week_start_date' => (string)$row['week_start_date'],
                'week_end_date' => (string)$row['week_end_date'],
                'status' => (string)$row['status'],
                'main_skill_key' => $key,
                'main_skill_label' => $canonicalSkills[$key] ?? $key,
                'problem_observed' => (string)($row['problem_observed'] ?? ''),
                'observation_context' => (string)($row['observation_context'] ?? ''),
                'help_level' => (string)($row['help_level'] ?? ''),
                'observed_action' => (string)($row['observed_action'] ?? ''),
                'next_action' => (string)($row['next_action'] ?? ''),
                'getting_easier' => (string)($row['getting_easier'] ?? ''),
                'coach_note' => (string)($row['coach_note'] ?? ''),
                'created_at' => (string)$row['created_at'],
                'updated_at' => (string)$row['updated_at'],
            ];
        }

        ss_json(200, [
            'ok' => true,
            'student_id' => $studentIdParam,
            'history' => $history,
        ]);
    }

    // Default: Attendance-derived queue for selected week
    $weekStartDate = ss_clean_string($_GET['week_start_date'] ?? '', 10);
    if ($weekStartDate === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $weekStartDate)) {
        $tz = new DateTimeZone('America/New_York');
        $nowInNy = new DateTimeImmutable('now', $tz);
        $dayOfWeek = (int)$nowInNy->format('N'); // 1 = Mon, 7 = Sun
        $diffDays = $dayOfWeek - 1;
        $monday = $nowInNy->modify("-{$diffDays} days");
        $weekStartDate = $monday->format('Y-m-d');
    }

    $weekEndDate = date('Y-m-d', strtotime('+6 days', strtotime($weekStartDate)));
    $weekLabel = date('M j', strtotime($weekStartDate)) . ' – ' . date('M j, Y', strtotime($weekEndDate));

    // Query attendance records for this week
    $attStmt = $db->prepare(
        'SELECT
            p.id AS student_id,
            p.first_name,
            p.last_name,
            p.status AS person_status,
            p.notes AS person_notes,
            s.id AS session_id,
            s.title AS session_title,
            s.start_at AS session_start_at,
            a.status AS attendance_status,
            a.checked_in_at
         FROM attendance a
         JOIN session s ON s.id = a.session_id
         JOIN person p ON p.id = a.person_id
         WHERE date(s.start_at) BETWEEN :week_start AND :week_end
           AND a.status IN (\'present\', \'late\')
         ORDER BY s.start_at ASC, p.first_name ASC, p.last_name ASC'
    );
    $attStmt->execute([
        ':week_start' => $weekStartDate,
        ':week_end' => $weekEndDate,
    ]);
    $rawAttendance = $attStmt->fetchAll(PDO::FETCH_ASSOC);

    // Group unique students
    $studentsMap = [];
    foreach ($rawAttendance as $row) {
        $sid = (string)$row['student_id'];
        if (!isset($studentsMap[$sid])) {
            $first = trim((string)($row['first_name'] ?? ''));
            $last = trim((string)($row['last_name'] ?? ''));
            $fullName = trim($first . ' ' . $last);
            $studentsMap[$sid] = [
                'student_id' => $sid,
                'first_name' => $first,
                'last_name' => $last,
                'student_name' => $fullName !== '' ? $fullName : 'Student',
                'person_status' => (string)($row['person_status'] ?? 'active'),
                'person_notes' => (string)($row['person_notes'] ?? ''),
                'sessions' => [],
                'class_dates_list' => [],
            ];
        }

        $sessionDate = substr((string)$row['session_start_at'], 0, 10);
        $dayName = date('D M j', strtotime($sessionDate));
        $sessionTitle = trim((string)($row['session_title'] ?? 'BJJ Class'));
        $timeString = date('g:i A', strtotime((string)$row['session_start_at']));

        $studentsMap[$sid]['sessions'][] = [
            'session_id' => (string)$row['session_id'],
            'session_title' => $sessionTitle,
            'start_at' => (string)$row['session_start_at'],
            'date_str' => $sessionDate,
            'formatted_time' => $timeString,
            'day_name' => $dayName,
        ];
        if (!in_array($dayName, $studentsMap[$sid]['class_dates_list'], true)) {
            $studentsMap[$sid]['class_dates_list'][] = $dayName;
        }
    }

    // Fetch existing audits for this week
    $auditStmt = $db->prepare(
        'SELECT * FROM weekly_student_audits WHERE week_start_date = :week_start'
    );
    $auditStmt->execute([':week_start' => $weekStartDate]);
    $existingAudits = [];
    foreach ($auditStmt->fetchAll(PDO::FETCH_ASSOC) as $a) {
        $existingAudits[(string)$a['student_id']] = $a;
    }

    // Fetch previous weekly audits and build student list
    $students = [];
    $incompleteCount = 0;
    $reviewedCount = 0;

    $prevAuditStmt = $db->prepare(
        'SELECT * FROM weekly_student_audits
         WHERE student_id = :student_id AND week_start_date < :week_start
         ORDER BY week_start_date DESC LIMIT 1'
    );

    foreach ($studentsMap as $sid => $data) {
        $classesCount = count($data['sessions']);
        $classDatesStr = implode(' · ', $data['class_dates_list']);

        $currentAudit = $existingAudits[$sid] ?? null;
        $auditStatus = 'not_started';
        if ($currentAudit !== null) {
            $auditStatus = (string)($currentAudit['status'] ?? 'draft');
        }

        $isHandled = in_array($auditStatus, ['complete', 'needs_observation'], true);
        if ($isHandled) {
            $reviewedCount++;
        } else {
            $incompleteCount++;
        }

        // Fetch previous check-in
        $prevAuditStmt->execute([
            ':student_id' => $sid,
            ':week_start' => $weekStartDate,
        ]);
        $prevRow = $prevAuditStmt->fetch(PDO::FETCH_ASSOC);
        $lastCheckIn = null;
        if ($prevRow !== false) {
            $prevKey = (string)($prevRow['main_skill_key'] ?? '');
            $lastCheckIn = [
                'week_start_date' => (string)$prevRow['week_start_date'],
                'week_end_date' => (string)$prevRow['week_end_date'],
                'week_label' => date('M j', strtotime((string)$prevRow['week_start_date'])),
                'main_skill_key' => $prevKey,
                'main_skill_label' => $canonicalSkills[$prevKey] ?? $prevKey,
                'problem_observed' => (string)($prevRow['problem_observed'] ?? ''),
                'observed_action' => (string)($prevRow['observed_action'] ?? ''),
                'next_action' => (string)($prevRow['next_action'] ?? ''),
                'coach_note' => (string)($prevRow['coach_note'] ?? ''),
            ];
        }

        $auditPayload = null;
        if ($currentAudit !== null) {
            $curKey = (string)($currentAudit['main_skill_key'] ?? '');
            $auditPayload = [
                'id' => (string)$currentAudit['id'],
                'status' => $auditStatus,
                'main_skill_key' => $curKey,
                'main_skill_label' => $canonicalSkills[$curKey] ?? $curKey,
                'problem_observed' => (string)($currentAudit['problem_observed'] ?? ''),
                'observation_context' => (string)($currentAudit['observation_context'] ?? ''),
                'help_level' => (string)($currentAudit['help_level'] ?? ''),
                'observed_action' => (string)($currentAudit['observed_action'] ?? ''),
                'next_action' => (string)($currentAudit['next_action'] ?? ''),
                'getting_easier' => (string)($currentAudit['getting_easier'] ?? ''),
                'coach_note' => (string)($currentAudit['coach_note'] ?? ''),
                'created_at' => (string)$currentAudit['created_at'],
                'updated_at' => (string)$currentAudit['updated_at'],
            ];
        }

        $students[] = [
            'student_id' => $sid,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'student_name' => $data['student_name'],
            'classes_attended' => $classesCount,
            'class_dates_display' => $classDatesStr,
            'sessions' => $data['sessions'],
            'audit_status' => $auditStatus,
            'is_reviewed' => $isHandled,
            'current_audit' => $auditPayload,
            'last_check_in' => $lastCheckIn,
            'more_details' => [
                'belt' => 'White Belt',
                'regular_schedule' => 'Mon, Tue, Wed 5:00 PM',
                'previous_focus' => $lastCheckIn ? $lastCheckIn['main_skill_label'] : 'None recorded',
                'last_weekly_audit' => $lastCheckIn ? $lastCheckIn['week_label'] : 'None',
                'last_full_progress_review' => 'None on record',
            ],
        ];
    }

    // Sort queue according to Rule 5:
    // 1. Incomplete (not_started, draft)
    // 2. Complete (complete, needs_observation)
    // Within group, sort alphabetically by student_name
    usort($students, static function (array $a, array $b): int {
        if ($a['is_reviewed'] !== $b['is_reviewed']) {
            return $a['is_reviewed'] ? 1 : -1;
        }
        return strcasecmp($a['student_name'], $b['student_name']);
    });

    $totalTrained = count($students);

    ss_json(200, [
        'ok' => true,
        'week_start_date' => $weekStartDate,
        'week_end_date' => $weekEndDate,
        'week_label' => $weekLabel,
        'summary' => [
            'students_trained' => $totalTrained,
            'reviewed' => $reviewedCount,
            'remaining' => $incompleteCount,
            'is_complete' => ($totalTrained > 0 && $incompleteCount === 0),
        ],
        'skills' => $canonicalSkills,
        'contexts' => $allowedContexts,
        'help_levels' => $allowedHelpLevels,
        'students' => $students,
    ]);
}

// POST: Save or update weekly audit
$data = ss_request_data();
$studentId = ss_clean_string($data['student_id'] ?? '', 64);
$weekStartDate = ss_clean_string($data['week_start_date'] ?? '', 10);
$weekEndDate = ss_clean_string($data['week_end_date'] ?? '', 10);
if ($weekEndDate === '' && $weekStartDate !== '') {
    $weekEndDate = date('Y-m-d', strtotime('+6 days', strtotime($weekStartDate)));
}

$status = strtolower(ss_clean_string($data['status'] ?? 'complete', 32));
$allowedStatuses = ['not_started', 'draft', 'complete', 'needs_observation'];
if (!in_array($status, $allowedStatuses, true)) {
    $status = 'complete';
}

$mainSkillKey = ss_clean_string($data['main_skill_key'] ?? '', 64);
$problemObserved = trim((string)($data['problem_observed'] ?? ''));
$observationContext = ss_clean_string($data['observation_context'] ?? '', 32);
$helpLevel = ss_clean_string($data['help_level'] ?? '', 32);
$observedAction = trim((string)($data['observed_action'] ?? ''));
$nextAction = trim((string)($data['next_action'] ?? ''));
$gettingEasier = trim((string)($data['getting_easier'] ?? ''));
$coachNote = trim((string)($data['coach_note'] ?? ''));
$coachId = ss_clean_string($data['coach_id'] ?? '', 64);

$errors = [];

if ($studentId === '') {
    $errors['student_id'] = 'Student is required.';
}
if ($weekStartDate === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $weekStartDate)) {
    $errors['week_start_date'] = 'Valid training week date is required.';
}

if ($status === 'complete') {
    if ($mainSkillKey === '' || !isset($canonicalSkills[$mainSkillKey])) {
        $errors['main_skill_key'] = 'Choose a main skill.';
    }
    if ($problemObserved === '') {
        $errors['problem_observed'] = 'Add what were they trying to do.';
    }
    if ($observedAction === '') {
        $errors['observed_action'] = 'Add what you saw.';
    }
    if ($nextAction === '') {
        $errors['next_action'] = 'Add what they should try next.';
    }
}

if ($errors !== []) {
    ss_json(422, ['ok' => false, 'errors' => $errors]);
}

$now = ss_now_iso();

$db->beginTransaction();

try {
    // 1. Check existing record
    $checkStmt = $db->prepare(
        'SELECT id, status, created_at FROM weekly_student_audits
         WHERE student_id = :student_id AND week_start_date = :week_start'
    );
    $checkStmt->execute([
        ':student_id' => $studentId,
        ':week_start' => $weekStartDate,
    ]);
    $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($existing !== false) {
        $auditId = (string)$existing['id'];
        $updateStmt = $db->prepare(
            'UPDATE weekly_student_audits SET
                week_end_date = :week_end_date,
                coach_id = :coach_id,
                status = :status,
                main_skill_key = :main_skill_key,
                problem_observed = :problem_observed,
                observation_context = :observation_context,
                help_level = :help_level,
                observed_action = :observed_action,
                next_action = :next_action,
                getting_easier = :getting_easier,
                coach_note = :coach_note,
                updated_at = :updated_at
             WHERE id = :id'
        );
        $updateStmt->execute([
            ':id' => $auditId,
            ':week_end_date' => $weekEndDate,
            ':coach_id' => $coachId !== '' ? $coachId : null,
            ':status' => $status,
            ':main_skill_key' => $mainSkillKey !== '' ? $mainSkillKey : null,
            ':problem_observed' => $problemObserved !== '' ? $problemObserved : null,
            ':observation_context' => $observationContext !== '' ? $observationContext : null,
            ':help_level' => $helpLevel !== '' ? $helpLevel : null,
            ':observed_action' => $observedAction !== '' ? $observedAction : null,
            ':next_action' => $nextAction !== '' ? $nextAction : null,
            ':getting_easier' => $gettingEasier !== '' ? $gettingEasier : null,
            ':coach_note' => $coachNote !== '' ? $coachNote : null,
            ':updated_at' => $now,
        ]);
    } else {
        $auditId = ss_uuid_v4();
        $insertStmt = $db->prepare(
            'INSERT INTO weekly_student_audits (
                id, student_id, week_start_date, week_end_date, coach_id, status,
                main_skill_key, problem_observed, observation_context, help_level,
                observed_action, next_action, getting_easier, coach_note, created_at, updated_at
            ) VALUES (
                :id, :student_id, :week_start_date, :week_end_date, :coach_id, :status,
                :main_skill_key, :problem_observed, :observation_context, :help_level,
                :observed_action, :next_action, :getting_easier, :coach_note, :created_at, :updated_at
            )'
        );
        $insertStmt->execute([
            ':id' => $auditId,
            ':student_id' => $studentId,
            ':week_start_date' => $weekStartDate,
            ':week_end_date' => $weekEndDate,
            ':coach_id' => $coachId !== '' ? $coachId : null,
            ':status' => $status,
            ':main_skill_key' => $mainSkillKey !== '' ? $mainSkillKey : null,
            ':problem_observed' => $problemObserved !== '' ? $problemObserved : null,
            ':observation_context' => $observationContext !== '' ? $observationContext : null,
            ':help_level' => $helpLevel !== '' ? $helpLevel : null,
            ':observed_action' => $observedAction !== '' ? $observedAction : null,
            ':next_action' => $nextAction !== '' ? $nextAction : null,
            ':getting_easier' => $gettingEasier !== '' ? $gettingEasier : null,
            ':coach_note' => $coachNote !== '' ? $coachNote : null,
            ':created_at' => $now,
            ':updated_at' => $now,
        ]);
    }

    // 2. Insert audit version snapshot (preserves complete edit history)
    $versionId = ss_uuid_v4();
    $snapshot = [
        'audit_id' => $auditId,
        'student_id' => $studentId,
        'week_start_date' => $weekStartDate,
        'week_end_date' => $weekEndDate,
        'status' => $status,
        'main_skill_key' => $mainSkillKey,
        'problem_observed' => $problemObserved,
        'observation_context' => $observationContext,
        'help_level' => $helpLevel,
        'observed_action' => $observedAction,
        'next_action' => $nextAction,
        'getting_easier' => $gettingEasier,
        'coach_note' => $coachNote,
        'saved_at' => $now,
    ];
    $versionStmt = $db->prepare(
        'INSERT INTO weekly_student_audit_versions (
            id, weekly_student_audit_id, student_id, week_start_date, snapshot_json, edited_by, created_at
        ) VALUES (
            :id, :weekly_student_audit_id, :student_id, :week_start_date, :snapshot_json, :edited_by, :created_at
        )'
    );
    $versionStmt->execute([
        ':id' => $versionId,
        ':weekly_student_audit_id' => $auditId,
        ':student_id' => $studentId,
        ':week_start_date' => $weekStartDate,
        ':snapshot_json' => json_encode($snapshot, JSON_UNESCAPED_SLASHES),
        ':edited_by' => $coachId !== '' ? $coachId : 'coach',
        ':created_at' => $now,
    ]);

    $db->commit();
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    ss_json(500, [
        'ok' => false,
        'error' => 'Audit was not saved. Your text is still here. Try again.',
        'detail' => $e->getMessage(),
    ]);
}

ss_log_event('weekly_audit_saved', [
    'audit_id' => $auditId,
    'student_id' => $studentId,
    'week_start_date' => $weekStartDate,
    'status' => $status,
]);

ss_json(200, [
    'ok' => true,
    'audit_id' => $auditId,
    'version_id' => $versionId,
    'student_id' => $studentId,
    'status' => $status,
    'message' => 'Weekly audit saved successfully.',
]);
