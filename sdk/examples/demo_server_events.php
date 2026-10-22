<?php
/**
 * ServerTracker demo — run from the terminal:
 *
 *   php sdk/examples/demo_server_events.php
 *
 * This simulates an external system (e.g. a POS, payment gateway, or
 * kitchen display system) firing server-side analytics events to the
 * running Laravel API.  It requires the backend to be running on port 8080.
 */

require_once __DIR__ . '/../src/ServerTracker.php';

use RestroAnalytics\ServerTracker;

$endpoint = 'http://localhost:8080/api/events';
$tracker  = new ServerTracker($endpoint, timeoutSeconds: 3);

$scenarios = [
    [
        'type'  => 'order_confirmed',
        'name'  => 'Order Confirmed',
        'props' => ['order_id' => 'ORD-SRV-001', 'total' => 42.50, 'currency' => 'USD',
                    'items'    => [['name' => 'Braised Short Rib', 'qty' => 1, 'price' => 34.00],
                                   ['name' => 'Tiramisu',          'qty' => 1, 'price' =>  9.50]]],
        'path'  => '/checkout',
    ],
    [
        'type'  => 'reservation_confirmed',
        'name'  => 'Reservation Confirmed',
        'props' => ['reservation_id' => 'RES-1001', 'guests' => 4, 'date' => '2026-11-15', 'time' => '19:30'],
        'path'  => '/reservations',
    ],
    [
        'type'  => 'payment_processed',
        'name'  => 'Payment Processed',
        'props' => ['order_id' => 'ORD-SRV-001', 'amount' => 42.50, 'method' => 'card', 'gateway' => 'stripe'],
        'path'  => '/checkout',
    ],
];

echo "Restro Analytics — ServerTracker demo\n";
echo str_repeat('─', 45) . "\n";
echo "Endpoint: {$endpoint}\n\n";

foreach ($scenarios as $s) {
    $ok = $tracker->track(
        eventType:   $s['type'],
        eventName:   $s['name'],
        properties:  $s['props'],
        anonymousId: 'srv-demo-' . bin2hex(random_bytes(4)),
        pagePath:    $s['path'],
    );

    $status = $ok ? '✓  sent' : '✗  failed';
    echo "{$status}  {$s['name']} ({$s['type']})\n";
}

echo "\nDone. Check the dashboard Live Event Feed to see the server-sourced events.\n";
