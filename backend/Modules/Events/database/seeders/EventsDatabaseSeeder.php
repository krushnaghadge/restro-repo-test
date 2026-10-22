<?php

namespace Modules\Events\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventsDatabaseSeeder extends Seeder
{
    private array $pages = [
        ['path' => '/',              'title' => 'Home | Bistro Table'],
        ['path' => '/menu',          'title' => 'Menu | Bistro Table'],
        ['path' => '/reservations',  'title' => 'Reservations | Bistro Table'],
        ['path' => '/about',         'title' => 'About | Bistro Table'],
    ];

    private array $referrers = [
        '',                        // Direct (60%)
        '',
        '',
        'https://www.google.com',  // Organic search (20%)
        'https://www.google.com',
        'https://www.instagram.com', // Social (10%)
        'https://www.facebook.com',  // Social (7%)
        'https://www.yelp.com',      // Review sites (3%)
    ];

    private array $menuItems = [
        'Burrata & Heirloom Tomatoes',
        'Seared Scallops',
        'Mushroom Arancini',
        'Grilled Atlantic Salmon',
        'Braised Short Rib',
        'Pasta Carbonara',
        'Margherita Risotto',
        'Tiramisu',
        'Crème Brûlée',
        'Chocolate Fondant',
    ];

    public function run(): void
    {
        DB::table('events')->truncate();

        $batch = [];
        $now   = Carbon::now();

        // Build a pool of returning visitors (~30% of traffic comes from repeat visitors)
        $returningVisitors = [];
        for ($i = 0; $i < 120; $i++) {
            $returningVisitors[] = $this->uuid();
        }

        // Generate 30 days of realistic traffic data
        for ($daysAgo = 29; $daysAgo >= 0; $daysAgo--) {
            $date = $now->copy()->subDays($daysAgo);

            // More traffic on weekends (Fri/Sat/Sun) and dinner hours (17:00–22:00)
            $isWeekend    = in_array($date->dayOfWeek, [5, 6, 0]);
            $dailyVisitors = $isWeekend
                ? rand(40, 80)
                : rand(20, 45);

            for ($v = 0; $v < $dailyVisitors; $v++) {
                // 30% chance this is a returning visitor (same anonymous_id, new session)
                $isReturning = rand(1, 100) <= 30;
                $anonymousId = $isReturning
                    ? $returningVisitors[array_rand($returningVisitors)]
                    : $this->uuid();
                $sessionId   = $this->uuid(); // always a fresh session
                $referrer    = $this->referrers[array_rand($this->referrers)];

                // Dinner-hour bias for visit time
                $hour   = $this->weightedHour();
                $minute = rand(0, 59);
                $second = rand(0, 59);
                $visitAt = $date->copy()->setTime($hour, $minute, $second);

                $pagesVisited = rand(1, 4);
                $visitedPaths = array_slice(
                    $this->shufflePages(),
                    0,
                    $pagesVisited
                );

                foreach ($visitedPaths as $i => $page) {
                    // Each subsequent page in session is a few minutes later
                    $pageAt = $visitAt->copy()->addMinutes($i * rand(2, 8));

                    $batch[] = $this->row([
                        'anonymous_id' => $anonymousId,
                        'session_id'   => $sessionId,
                        'event_type'   => 'page_view',
                        'event_name'   => 'Page View',
                        'page_path'    => $page['path'],
                        'page_title'   => $page['title'],
                        'page_url'     => 'http://localhost:3000' . $page['path'],
                        'referrer'     => $i === 0 ? $referrer : '',
                        'occurred_at'  => $pageAt,
                    ]);

                    // Menu page → item views and cart events
                    if ($page['path'] === '/menu') {
                        $itemsViewed = rand(1, 5);
                        for ($m = 0; $m < $itemsViewed; $m++) {
                            $item = $this->menuItems[array_rand($this->menuItems)];
                            $batch[] = $this->row([
                                'anonymous_id' => $anonymousId,
                                'session_id'   => $sessionId,
                                'event_type'   => 'menu_item_viewed',
                                'event_name'   => 'Menu Item Viewed',
                                'page_path'    => '/menu',
                                'properties'   => json_encode(['item' => $item]),
                                'occurred_at'  => $pageAt->copy()->addSeconds(rand(10, 120)),
                            ]);
                        }

                        // 35% add to cart
                        if (rand(1, 100) <= 35) {
                            $cartItem = $this->menuItems[array_rand($this->menuItems)];
                            $batch[] = $this->row([
                                'anonymous_id' => $anonymousId,
                                'session_id'   => $sessionId,
                                'event_type'   => 'add_to_cart',
                                'event_name'   => 'Add to Cart',
                                'page_path'    => '/menu',
                                'properties'   => json_encode(['item' => $cartItem, 'price' => rand(9, 34)]),
                                'occurred_at'  => $pageAt->copy()->addSeconds(rand(30, 180)),
                            ]);

                            // 60% of add-to-cart → order
                            if (rand(1, 100) <= 60) {
                                $orderId = 'ORD-' . strtoupper(substr(md5(uniqid()), 0, 6));
                                $total   = rand(22, 120);
                                $batch[] = $this->row([
                                    'anonymous_id' => $anonymousId,
                                    'session_id'   => $sessionId,
                                    'event_type'   => 'order_created',
                                    'event_name'   => 'Order Created',
                                    'page_path'    => '/menu',
                                    'properties'   => json_encode([
                                        'order_id' => $orderId,
                                        'total'    => $total,
                                        'currency' => 'USD',
                                    ]),
                                    'occurred_at'  => $pageAt->copy()->addSeconds(rand(60, 300)),
                                ]);
                            }
                        }
                    }

                    // Reservations page → funnel
                    if ($page['path'] === '/reservations') {
                        $batch[] = $this->row([
                            'anonymous_id' => $anonymousId,
                            'session_id'   => $sessionId,
                            'event_type'   => 'reservation_page_viewed',
                            'event_name'   => 'Reservation Page Viewed',
                            'page_path'    => '/reservations',
                            'occurred_at'  => $pageAt->copy()->addSeconds(2),
                        ]);

                        // 55% start the form
                        if (rand(1, 100) <= 55) {
                            $batch[] = $this->row([
                                'anonymous_id' => $anonymousId,
                                'session_id'   => $sessionId,
                                'event_type'   => 'reservation_form_started',
                                'event_name'   => 'Reservation Form Started',
                                'page_path'    => '/reservations',
                                'occurred_at'  => $pageAt->copy()->addSeconds(rand(15, 60)),
                            ]);

                            // 65% of starters pick a time
                            if (rand(1, 100) <= 65) {
                                $times = ['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00'];
                                $batch[] = $this->row([
                                    'anonymous_id' => $anonymousId,
                                    'session_id'   => $sessionId,
                                    'event_type'   => 'reservation_time_selected',
                                    'event_name'   => 'Reservation Time Selected',
                                    'page_path'    => '/reservations',
                                    'properties'   => json_encode(['time' => $times[array_rand($times)]]),
                                    'occurred_at'  => $pageAt->copy()->addSeconds(rand(60, 120)),
                                ]);

                                // 70% of time-selectors complete the reservation
                                if (rand(1, 100) <= 70) {
                                    $guests = rand(1, 6);
                                    $batch[] = $this->row([
                                        'anonymous_id' => $anonymousId,
                                        'session_id'   => $sessionId,
                                        'event_type'   => 'reservation_completed',
                                        'event_name'   => 'Reservation Completed',
                                        'page_path'    => '/reservations',
                                        'properties'   => json_encode([
                                            'guests' => $guests,
                                            'date'   => $date->copy()->addDays(rand(1, 14))->format('Y-m-d'),
                                        ]),
                                        'occurred_at'  => $pageAt->copy()->addSeconds(rand(120, 300)),
                                    ]);
                                }
                            }
                        }
                    }
                }

                // Flush in batches of 200 to avoid memory spikes
                if (count($batch) >= 200) {
                    DB::table('events')->insert($batch);
                    $batch = [];
                }
            }
        }

        if (!empty($batch)) {
            DB::table('events')->insert($batch);
        }

        $total = DB::table('events')->count();
        $this->command->info("Seeded {$total} events across 30 days.");
    }

    private function row(array $overrides): array
    {
        return array_merge([
            'anonymous_id' => $this->uuid(),
            'session_id'   => $this->uuid(),
            'user_id'      => null,
            'event_type'   => 'page_view',
            'event_name'   => 'Page View',
            'page_url'     => null,
            'page_path'    => '/',
            'page_title'   => null,
            'referrer'     => '',
            'source'       => 'browser',
            'properties'   => null,
            'device'       => null,
            'ip'           => '127.0.0.1',
            'country'      => null,
            'occurred_at'  => now(),
            'created_at'   => now(),
            'updated_at'   => now(),
        ], $overrides);
    }

    private function uuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    private function weightedHour(): int
    {
        // 65% chance of dinner hours (17–22), rest spread across day
        if (rand(1, 100) <= 65) {
            return rand(17, 22);
        }
        return rand(10, 16);
    }

    private function shufflePages(): array
    {
        $pages = $this->pages;
        shuffle($pages);
        return $pages;
    }
}
