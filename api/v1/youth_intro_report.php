<?php
declare(strict_types=1);

ss_require_ops_auth();
$db = ss_db();
$stageOrder = ['New inquiry', 'Intro invited', 'Intro booked', 'Confirmed', 'Attended', 'Core Culture recommended', 'Enrolled', 'Follow-up needed', 'Not ready', 'Not a fit', 'No-show', 'Visitor or alternate offer'];
$count = static function (PDO $db, string $where = '', array $params = []): int {
    $statement = $db->prepare('SELECT COUNT(*) FROM youth_intro_records' . ($where !== '' ? " WHERE {$where}" : ''));
    $statement->execute($params);
    return (int)$statement->fetchColumn();
};
$attended = $count($db, "attendance_status = 'Attended' OR pipeline_stage IN ('Attended', 'Core Culture recommended', 'Enrolled')");
$records = $db->query("SELECT id, student_name, student_age, town, preferred_date, scheduled_class_id, pipeline_stage, attendance_status, non_enrollment_reason, created_at, updated_at FROM youth_intro_records WHERE attendance_status = 'Attended' OR pipeline_stage IN ('Attended', 'Core Culture recommended', 'Enrolled') ORDER BY updated_at ASC LIMIT 20")->fetchAll(PDO::FETCH_ASSOC);
$reasonRows = $db->query("SELECT non_enrollment_reason AS reason, COUNT(*) AS total FROM youth_intro_records WHERE non_enrollment_reason <> '' GROUP BY non_enrollment_reason ORDER BY total DESC")->fetchAll(PDO::FETCH_ASSOC);
$stageCounts = [];
foreach ($stageOrder as $stage) $stageCounts[$stage] = $count($db, 'pipeline_stage = :stage', [':stage' => $stage]);
ss_json(200, [
    'ok' => true,
    'cohort' => ['target' => 20, 'attendedCount' => $attended, 'complete' => $attended >= 20, 'records' => $records],
    'funnel' => [
        'inquiries' => $count($db),
        'booked' => $count($db, "pipeline_stage IN ('Intro booked', 'Confirmed', 'Attended', 'Core Culture recommended', 'Enrolled')"),
        'confirmed' => $count($db, "pipeline_stage IN ('Confirmed', 'Attended', 'Core Culture recommended', 'Enrolled')"),
        'attended' => $attended,
        'recommended' => $count($db, "pipeline_stage IN ('Core Culture recommended', 'Enrolled')"),
        'enrolled' => $count($db, "pipeline_stage = 'Enrolled'"),
        'noShows' => $count($db, "pipeline_stage = 'No-show'"),
    ],
    'stageCounts' => $stageCounts,
    'nonEnrollmentReasons' => $reasonRows,
    'analyticsNote' => 'Page visits, form starts, and CTA rates require the configured analytics dashboard; personal data is intentionally excluded here.',
]);
