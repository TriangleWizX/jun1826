<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/bootstrap.php';

$path = (string)($_GET['path'] ?? '');
if ($path === '') {
    $requestPath = parse_url((string)($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH) ?: '';
    if (str_starts_with($requestPath, '/api/')) {
        $path = substr($requestPath, 5);
    } elseif ($requestPath === '/api') {
        $path = '';
    }
}

$path = trim($path, '/');
if (str_starts_with($path, 'v1/')) {
    $path = substr($path, 3);
}

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$opsProtectedPaths = [
    'students',
    'sessions',
    'attendance',
    'attendance/checkin',
    'waivers',
    'exports/attendance.csv',
];

if (in_array($path, $opsProtectedPaths, true)) {
    ss_require_ops_auth();
}

if ($path === '' && $method === 'GET') {
    ss_json(200, [
        'ok' => true,
        'service' => 'senseisandy-utility-api',
        'version' => 'v1',
        'routes' => [
            'GET /api/health',
            'POST /api/leads',
            'POST /api/csp-reports',
            'POST /api/webhook/booking',
            'GET /api/reviews',
            'GET /api/students',
            'POST /api/students',
            'GET /api/sessions',
            'POST /api/sessions',
            'GET /api/attendance',
            'POST /api/attendance',
            'POST /api/attendance/checkin',
            'GET /api/waivers',
            'POST /api/waivers',
            'GET /api/exports/attendance.csv',
        ],
    ]);
}

switch ($path) {
    case 'health':
        require __DIR__ . '/v1/health.php';
        break;
    case 'leads':
        require __DIR__ . '/v1/leads.php';
        break;
    case 'csp-reports':
        require __DIR__ . '/v1/csp_reports.php';
        break;
    case 'webhook/booking':
        require __DIR__ . '/v1/webhook_booking.php';
        break;
    case 'reviews':
        require __DIR__ . '/v1/reviews.php';
        break;
    case 'students':
        require __DIR__ . '/v1/students.php';
        break;
    case 'sessions':
        require __DIR__ . '/v1/sessions.php';
        break;
    case 'attendance':
    case 'attendance/checkin':
        require __DIR__ . '/v1/attendance.php';
        break;
    case 'waivers':
        require __DIR__ . '/v1/waivers.php';
        break;
    case 'exports/attendance.csv':
        require __DIR__ . '/v1/export_attendance_csv.php';
        break;
    default:
        ss_json(404, [
            'ok' => false,
            'error' => 'Not Found',
            'path' => $path,
        ]);
}
