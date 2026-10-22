<?php

namespace Tests\Feature;

use Modules\Events\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsQueryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed three page views across two visitors
        foreach (['anon-1', 'anon-1', 'anon-2'] as $i => $anon) {
            Event::create([
                'anonymous_id' => $anon,
                'session_id'   => "sess-$i",
                'event_type'   => 'page_view',
                'event_name'   => 'Page View',
                'page_path'    => $i === 1 ? '/menu' : '/',
                'source'       => 'browser',
                'occurred_at'  => now()->subDays(1),
            ]);
        }

        // One order
        Event::create([
            'anonymous_id' => 'anon-1',
            'session_id'   => 'sess-order',
            'event_type'   => 'order_created',
            'event_name'   => 'Order Created',
            'source'       => 'server',
            'occurred_at'  => now()->subDays(1),
            'properties'   => ['order_id' => 'ORD-001', 'total' => 42.50],
        ]);
    }

    private function withReadKey(array $headers = []): array
    {
        return array_merge(['Authorization' => 'Bearer test-read-key'], $headers);
    }

    public function test_overview_returns_correct_counts(): void
    {
        $this->getJson('/api/analytics/overview', $this->withReadKey())
             ->assertStatus(200)
             ->assertJson([
                 'page_views'      => 3,
                 'unique_visitors' => 2,
                 'orders'          => 1,
             ]);
    }

    public function test_page_views_time_series(): void
    {
        $response = $this->getJson('/api/analytics/page-views', $this->withReadKey());
        $response->assertStatus(200);
        $data = $response->json();

        $this->assertNotEmpty($data);
        $this->assertArrayHasKey('date',            $data[0]);
        $this->assertArrayHasKey('views',           $data[0]);
        $this->assertArrayHasKey('unique_visitors', $data[0]);
    }

    public function test_top_pages(): void
    {
        $response = $this->getJson('/api/analytics/top-pages', $this->withReadKey());
        $response->assertStatus(200);
        $data = $response->json();

        $this->assertCount(2, $data); // '/' and '/menu'
        $this->assertEquals('/', $data[0]['page_path']); // most viewed
    }

    public function test_event_breakdown(): void
    {
        $response = $this->getJson('/api/analytics/events', $this->withReadKey());
        $response->assertStatus(200);
        $data = $response->json();

        $types = array_column($data, 'event_type');
        $this->assertContains('page_view',     $types);
        $this->assertContains('order_created', $types);
    }

    public function test_recent_events_returns_paginated_data(): void
    {
        $response = $this->getJson('/api/analytics/recent-events', $this->withReadKey());
        $response->assertStatus(200)
                 ->assertJsonStructure(['data', 'total', 'per_page', 'current_page', 'last_page'])
                 ->assertJsonPath('total', 4);

        $first = $response->json('data.0');
        $this->assertArrayHasKey('event_name',   $first);
        $this->assertArrayHasKey('occurred_at',  $first);
        $this->assertArrayHasKey('anonymous_id', $first);
    }

    public function test_date_range_filter(): void
    {
        // Create an event 60 days ago that should be excluded from last-30-day range
        Event::create([
            'anonymous_id' => 'anon-old',
            'session_id'   => 'sess-old',
            'event_type'   => 'page_view',
            'event_name'   => 'Page View',
            'source'       => 'browser',
            'occurred_at'  => now()->subDays(60),
        ]);

        $start = now()->subDays(30)->format('Y-m-d');
        $end   = now()->format('Y-m-d');

        $response = $this->getJson("/api/analytics/overview?start=$start&end=$end", $this->withReadKey());
        $response->assertStatus(200);

        // The 60-day-old event must not be counted
        $this->assertEquals(3, $response->json('page_views'));
    }
}
