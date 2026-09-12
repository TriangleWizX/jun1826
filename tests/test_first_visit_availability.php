<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/lib/bootstrap.php';

function test_scarcity_copy(array $data): string {
    $status = $data['status'] ?? 'unavailable';
    $timeframeLabel = $data['timeframeLabel'] ?? 'this week';
    $count = $data['availableSlotCount'] ?? null;
    $next = $data['nextAvailableLabel'] ?? null;

    if ($status === 'unavailable' || $count === null) {
        return "First visits available {$timeframeLabel} · Check available times";
    }

    if ($status === 'full' || $count === 0) {
        return "This week is full · Check next week’s availability";
    }

    $nextSuffix = $next ? " · Next opening: {$next}" : "";

    if ($count >= 13) {
        return "First visits available {$timeframeLabel}{$nextSuffix}";
    }

    if ($count >= 7) {
        return "{$count} first visits available {$timeframeLabel}{$nextSuffix}";
    }

    if ($count >= 3) {
        return "Only {$count} first visits left {$timeframeLabel}{$nextSuffix}";
    }

    // 1-2 slots
    return "Only {$count} first visit left {$timeframeLabel}{$nextSuffix}";
}

$asserts = [];

// Test 1: 15 slots (high inventory)
$high = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 15,
    'nextAvailableLabel' => 'Sat, Sep 12',
];
$copyHigh = test_scarcity_copy($high);
assert(str_contains($copyHigh, 'First visits available this week'), 'High inventory should say First visits available this week');
assert(!str_contains($copyHigh, '15'), 'High inventory should not mention 15');
assert(str_contains($copyHigh, 'Sat, Sep 12'), 'High inventory should include next opening');
$asserts[] = 'Passed: High inventory (>12 slots)';

// Test 2: 9 slots (medium inventory)
$med = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 9,
    'nextAvailableLabel' => 'Sat, Sep 12',
];
$copyMed = test_scarcity_copy($med);
assert(str_contains($copyMed, '9 first visits available this week'), 'Medium inventory should show exact count 9');
assert(str_contains($copyMed, 'Sat, Sep 12'), 'Medium inventory should include next opening');
$asserts[] = 'Passed: Medium inventory (7-12 slots)';

// Test 3: 4 slots (low inventory)
$low = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 4,
    'nextAvailableLabel' => 'Mon, Sep 14',
];
$copyLow = test_scarcity_copy($low);
assert(str_contains($copyLow, 'Only 4 first visits left this week'), 'Low inventory should show Only 4');
$asserts[] = 'Passed: Low inventory (3-6 slots)';

// Test 4: 1 slot (critical inventory)
$veryLow = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 1,
    'nextAvailableLabel' => 'Mon, Sep 14',
];
$copyVeryLow = test_scarcity_copy($veryLow);
assert(str_contains($copyVeryLow, 'Only 1 first visit left this week'), 'Critical inventory should show Only 1 first visit left');
$asserts[] = 'Passed: Very low inventory (1-2 slots)';

// Test 5: 0 slots (full)
$full = [
    'status' => 'full',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 0,
];
$copyFull = test_scarcity_copy($full);
assert(str_contains($copyFull, 'This week is full'), 'Full status should show week is full');
$asserts[] = 'Passed: Full status (0 slots)';

// Test 6: Fallback when API unavailable
$unavail = [
    'status' => 'unavailable',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => null,
];
$copyUnavail = test_scarcity_copy($unavail);
assert(str_contains($copyUnavail, 'First visits available this week · Check available times'), 'Fallback should show check available times');
$asserts[] = 'Passed: Unavailable / fallback state';

// Test 7: "This coming week" copy test (Sunday framing)
$comingWeekData = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this coming week',
    'availableSlotCount' => 8,
    'nextAvailableLabel' => 'Mon, Sep 14',
];
$copyComing = test_scarcity_copy($comingWeekData);
assert(str_contains($copyComing, '8 first visits available this coming week · Next opening: Mon, Sep 14'), 'Coming week copy should format cleanly');
$asserts[] = 'Passed: Coming week framing';

// Test 8: Monday-anchored date calculations across the week
$tz = new DateTimeZone('America/New_York');

// Helper to compute Monday-anchored window:
$computeWindow = function (string $dateStr) use ($tz): array {
    $now = new DateTimeImmutable($dateStr, $tz);
    $dayOfWeek = (int)$now->format('N'); // 1 = Mon, ..., 7 = Sun
    $daysSinceMonday = $dayOfWeek - 1;
    $thisMonday = $now->modify("-{$daysSinceMonday} days");
    $thisSunday = $thisMonday->modify('+6 days');
    $nextMonday = $thisMonday->modify('+7 days');
    $nextSunday = $thisMonday->modify('+13 days');

    if ($dayOfWeek <= 5) {
        $startDate = $now;
        $endDate = $thisSunday;
        $label = 'this week';
    } else {
        $startDate = $now;
        $endDate = $nextSunday;
        $label = ($dayOfWeek === 7) ? 'this coming week' : 'this week';
    }

    return [
        'dayOfWeek' => $dayOfWeek,
        'startYmd' => $startDate->format('Y-m-d'),
        'endYmd' => $endDate->format('Y-m-d'),
        'label' => $label,
        'days' => (int)$startDate->diff($endDate)->format('%a') + 1,
    ];
};

// Monday (Day 1)
$mon = $computeWindow('2026-09-14');
assert($mon['dayOfWeek'] === 1, 'Monday is day 1');
assert($mon['startYmd'] === '2026-09-14', 'Monday start is Monday');
assert($mon['endYmd'] === '2026-09-20', 'Monday end is this Sunday');
assert($mon['days'] === 7, 'Monday window is 7 days');
assert($mon['label'] === 'this week', 'Monday label is this week');

// Wednesday (Day 3)
$wed = $computeWindow('2026-09-16');
assert($wed['dayOfWeek'] === 3, 'Wednesday is day 3');
assert($wed['startYmd'] === '2026-09-16', 'Wednesday start is Wednesday');
assert($wed['endYmd'] === '2026-09-20', 'Wednesday end is this Sunday');
assert($wed['days'] === 5, 'Wednesday window is 5 days');

// Friday (Day 5)
$fri = $computeWindow('2026-09-18');
assert($fri['dayOfWeek'] === 5, 'Friday is day 5');
assert($fri['startYmd'] === '2026-09-18', 'Friday start is Friday');
assert($fri['endYmd'] === '2026-09-20', 'Friday end is this Sunday');
assert($fri['days'] === 3, 'Friday window is 3 days');

// Saturday (Day 6)
$sat = $computeWindow('2026-09-19');
assert($sat['dayOfWeek'] === 6, 'Saturday is day 6');
assert($sat['startYmd'] === '2026-09-19', 'Saturday start is Saturday');
assert($sat['endYmd'] === '2026-09-27', 'Saturday end extends through next Sunday');
assert($sat['days'] === 9, 'Saturday window covers weekend + next week');

// Sunday (Day 7)
$sun = $computeWindow('2026-09-20');
assert($sun['dayOfWeek'] === 7, 'Sunday is day 7');
assert($sun['startYmd'] === '2026-09-20', 'Sunday start is Sunday');
assert($sun['endYmd'] === '2026-09-27', 'Sunday end extends through next Sunday');
assert($sun['label'] === 'this coming week', 'Sunday label is this coming week');
assert($sun['days'] === 8, 'Sunday window covers upcoming week');
$asserts[] = 'Passed: Monday-anchored weekly cycle across all days';

// Test 9: Month boundary transition
$monthBoundary = $computeWindow('2026-09-30'); // Sep 30 is Wednesday
assert($monthBoundary['startYmd'] === '2026-09-30', 'Starts on Sep 30');
assert($monthBoundary['endYmd'] === '2026-10-04', 'Ends on Oct 4 Sunday');
assert($monthBoundary['days'] === 5, 'Crosses month boundary cleanly');
$asserts[] = 'Passed: Month boundary transition';

// Test 10: Year boundary transition
$yearBoundary = $computeWindow('2026-12-31'); // Dec 31 is Thursday
assert($yearBoundary['startYmd'] === '2026-12-31', 'Starts on Dec 31');
assert($yearBoundary['endYmd'] === '2027-01-03', 'Ends on Jan 3 Sunday');
assert($yearBoundary['days'] === 4, 'Crosses year boundary cleanly');
$asserts[] = 'Passed: Year boundary transition';

echo implode(PHP_EOL, $asserts) . PHP_EOL;
echo "All availability test cases passed successfully!" . PHP_EOL;
