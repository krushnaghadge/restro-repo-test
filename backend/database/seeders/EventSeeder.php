<?php

namespace Database\Seeders;

use Modules\Events\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    private array $pages = [
        ['/', 'Home – Bistro Table'],
        ['/menu', 'Menu – Bistro Table'],
        ['/menu/starters', 'Starters – Bistro Table'],
        ['/menu/mains', 'Main Course – Bistro Table'],
        ['/menu/desserts', 'Desserts – Bistro Table'],
        ['/reservations', 'Reservations – Bistro Table'],
        ['/about', 'About Us – Bistro Table'],
        ['/contact', 'Contact – Bistro Table'],
    ];

    private array $referrers = [
        '',           // direct
        '',
        '',
        'https://www.google.com/search?q=bistro+table',
        'https://www.instagram.com/',
        'https://www.facebook.com/',
        'https://maps.google.com/',
    ];

    public function run(): void
    {
        $now = now();

        for ($i = 0; $i < 300; $i++) {
            $anonId   = 'seed-' . fake()->uuid();
            $sessionId = 'sess-' . fake()->uuid();
            $userId   = fake()->optional(0.3)->numerify('user-###');
            $occurredAt = $now->copy()->subDays(rand(0, 29))->subHours(rand(0, 23))->subMinutes(rand(0, 59));

            [$path, $title] = fake()->randomElement($this->pages);
            $referrer = fake()->randomElement($this->referrers);

            // Page view
            Event::create([
                'anonymous_id' => $anonId,
                'session_id'   => $sessionId,
                'user_id'      => $userId,
                'event_type'   => 'page_view',
                'event_name'   => 'Page View',
                'page_url'     => 'http://localhost:3000' . $path,
                'page_path'    => $path,
                'page_title'   => $title,
                'referrer'     => $referrer,
                'source'       => 'browser',
                'device'       => ['ua' => fake()->userAgent(), 'language' => 'en-US'],
                'ip'           => fake()->ipv4(),
                'occurred_at'  => $occurredAt,
            ]);

            // 40% chance of a custom event on the same session
            if (rand(1, 10) <= 4) {
                $customEvents = [
                    ['menu_item_viewed',  'Menu Item Viewed',  ['item' => fake()->word()]],
                    ['add_to_cart',       'Add to Cart',       ['item' => fake()->word(), 'price' => fake()->randomFloat(2, 5, 40)]],
                    ['reservation_started','Reservation Started', []],
                ];
                [$type, $name, $props] = fake()->randomElement($customEvents);

                Event::create([
                    'anonymous_id' => $anonId,
                    'session_id'   => $sessionId,
                    'user_id'      => $userId,
                    'event_type'   => $type,
                    'event_name'   => $name,
                    'page_path'    => $path,
                    'source'       => 'browser',
                    'properties'   => $props,
                    'ip'           => fake()->ipv4(),
                    'occurred_at'  => $occurredAt->copy()->addSeconds(rand(5, 120)),
                ]);
            }

            // 10% chance of an order
            if (rand(1, 10) === 1) {
                $items = array_map(fn() => [
                    'name'     => fake()->randomElement(['Margherita Pizza', 'Grilled Salmon', 'Caesar Salad', 'Tiramisu', 'Pasta Carbonara']),
                    'quantity' => rand(1, 3),
                    'price'    => fake()->randomFloat(2, 8, 35),
                ], range(1, rand(1, 4)));

                $total = array_sum(array_column($items, 'price'));

                Event::create([
                    'anonymous_id' => $anonId,
                    'session_id'   => $sessionId,
                    'user_id'      => $userId,
                    'event_type'   => 'order_created',
                    'event_name'   => 'Order Created',
                    'page_path'    => '/checkout',
                    'source'       => fake()->randomElement(['browser', 'server']),
                    'properties'   => [
                        'order_id'    => 'ORD-' . strtoupper(fake()->bothify('####??')),
                        'items'       => $items,
                        'total'       => round($total, 2),
                        'currency'    => 'USD',
                    ],
                    'ip'           => fake()->ipv4(),
                    'occurred_at'  => $occurredAt->copy()->addMinutes(rand(5, 30)),
                ]);
            }
        }
    }
}
