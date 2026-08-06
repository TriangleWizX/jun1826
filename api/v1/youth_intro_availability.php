<?php
declare(strict_types=1);

$configPath = dirname(__DIR__, 2) . '/config/youth-intro-availability.json';
$config = json_decode((string)file_get_contents($configPath), true, 512, JSON_THROW_ON_ERROR);
$date = ss_clean_string($_GET['date'] ?? '', 10);
$lane = ss_clean_string($_GET['lane'] ?? '', 20);
$db = ss_db();
$records = $db->query(
    "SELECT preferred_date, age_lane, scheduled_class_id, COUNT(*) AS total
     FROM youth_intro_records
     WHERE pipeline_stage NOT IN ('Not fit', 'Visitor or alternate offer')
     GROUP BY preferred_date, age_lane, scheduled_class_id"
)->fetchAll(PDO::FETCH_ASSOC);
$counts = [];
foreach ($records as $record) {
    $counts[$record['preferred_date'] . '|' . $record['age_lane'] . '|' . $record['scheduled_class_id']] = (int)$record['total'];
}
$overrideStmt = $db->prepare('SELECT status, intro_capacity, partner_approved, manual_review, moved_to_class_id FROM youth_intro_overrides WHERE class_id = :class_id AND (override_date IS NULL OR override_date = :override_date) ORDER BY created_at DESC LIMIT 1');
$weekly = [];
foreach ($records as $record) {
    $week = date('o-W', strtotime((string)$record['preferred_date']));
    $weekly[$week] = ($weekly[$week] ?? 0) + (int)$record['total'];
}
$result = [];
foreach ($config['classes'] as $class) {
    if (!$class['active'] || ($lane !== '' && !in_array($lane, $class['ageLanes'], true))) continue;
    $overrideStmt->execute([':class_id' => $class['classId'], ':override_date' => $date]);
    $override = $overrideStmt->fetch(PDO::FETCH_ASSOC) ?: null;
    $slotCapacity = $override && $override['intro_capacity'] !== null ? (int)$override['intro_capacity'] : (int)$config['introCapacity'];
    $slotCount = $date !== '' && $lane !== '' ? ($counts[$date . '|' . $lane . '|' . $class['classId']] ?? 0) : 0;
    $weekCount = $date !== '' ? ($weekly[date('o-W', strtotime($date))] ?? 0) : 0;
    $status = 'Available';
    if ($override && $override['status'] !== null) $status = (string)$override['status'];
    elseif ($slotCount >= $slotCapacity) $status = 'Intro capacity reached';
    elseif ($weekCount >= (int)$config['weeklyIntroLimit']) $status = 'Closed';
    elseif ($class['requiresPartnerApproval'] && (!$override || (int)($override['partner_approved'] ?? 0) !== 1)) $status = 'Manual approval required';
    $result[] = [
        'classId' => $class['classId'], 'day' => $class['day'], 'startTime' => $class['startTime'],
        'status' => $status, 'introBooked' => $slotCount, 'introCapacity' => $slotCapacity,
        'weeklyBooked' => $weekCount, 'weeklyLimit' => (int)$config['weeklyIntroLimit'],
    ];
}
ss_json(200, ['ok' => true, 'date' => $date, 'lane' => $lane, 'availability' => $result]);
