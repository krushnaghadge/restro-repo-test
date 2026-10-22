<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    private array $valid = [
        'anonymous_id' => 'anon-sec',
        'session_id'   => 'sess-sec',
        'event_type'   => 'page_view',
        'event_name'   => 'Page View',
        'source'       => 'browser',
    ];

    // ── Write key (ingest) ────────────────────────────────────────────────────

    public function test_ingest_without_key_returns_401(): void
    {
        $this->postJson('/api/events', $this->valid)
             ->assertStatus(401)
             ->assertJson(['error' => 'Unauthorized']);
    }

    public function test_ingest_with_wrong_key_returns_401(): void
    {
        $this->postJson('/api/events', $this->valid, ['X-Analytics-Key' => 'wrong-key'])
             ->assertStatus(401);
    }

    public function test_ingest_with_correct_header_key_succeeds(): void
    {
        $this->postJson('/api/events', $this->valid, ['X-Analytics-Key' => 'test-write-key'])
             ->assertStatus(201)
             ->assertJson(['accepted' => 1]);
    }

    public function test_ingest_with_key_as_query_param_succeeds(): void
    {
        // sendBeacon cannot set headers — it appends ?key= to the URL instead
        $this->postJson('/api/events?key=test-write-key', $this->valid)
             ->assertStatus(201)
             ->assertJson(['accepted' => 1]);
    }

    // ── Read key (analytics) ─────────────────────────────────────────────────

    public function test_analytics_without_key_returns_401(): void
    {
        $this->getJson('/api/analytics/overview')
             ->assertStatus(401)
             ->assertJson(['error' => 'Unauthorized']);
    }

    public function test_analytics_with_wrong_key_returns_401(): void
    {
        $this->getJson('/api/analytics/overview', ['Authorization' => 'Bearer wrong-key'])
             ->assertStatus(401);
    }

    public function test_analytics_with_malformed_authorization_returns_401(): void
    {
        // Missing "Bearer " prefix
        $this->getJson('/api/analytics/overview', ['Authorization' => 'test-read-key'])
             ->assertStatus(401);
    }

    public function test_analytics_with_correct_key_succeeds(): void
    {
        $this->getJson('/api/analytics/overview', ['Authorization' => 'Bearer test-read-key'])
             ->assertStatus(200);
    }

    public function test_all_analytics_endpoints_require_read_key(): void
    {
        $endpoints = [
            '/api/analytics/overview',
            '/api/analytics/page-views',
            '/api/analytics/top-pages',
            '/api/analytics/events',
            '/api/analytics/recent-events',
            '/api/analytics/traffic-sources',
            '/api/analytics/reservation-funnel',
        ];

        foreach ($endpoints as $endpoint) {
            $this->getJson($endpoint)
                 ->assertStatus(401, "Expected 401 for $endpoint without key");
        }
    }
}
