<?php

namespace Tests\Feature;

use Modules\Events\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventIngestionTest extends TestCase
{
    use RefreshDatabase;

    private array $valid = [
        'anonymous_id' => 'anon-123',
        'session_id'   => 'sess-456',
        'event_type'   => 'page_view',
        'event_name'   => 'Page View',
        'page_path'    => '/menu',
        'source'       => 'browser',
    ];

    private function withWriteKey(array $headers = []): array
    {
        return array_merge(['X-Analytics-Key' => 'test-write-key'], $headers);
    }

    public function test_ingest_single_event(): void
    {
        $response = $this->postJson('/api/events', $this->valid, $this->withWriteKey());

        $response->assertStatus(201)
                 ->assertJson(['accepted' => 1, 'rejected' => 0]);

        $this->assertDatabaseHas('events', [
            'anonymous_id' => 'anon-123',
            'event_type'   => 'page_view',
        ]);
    }

    public function test_ingest_batch(): void
    {
        $batch = array_fill(0, 5, $this->valid);

        $response = $this->postJson('/api/events', $batch, $this->withWriteKey());

        $response->assertStatus(201)
                 ->assertJson(['accepted' => 5, 'rejected' => 0]);

        $this->assertDatabaseCount('events', 5);
    }

    public function test_batch_limit_enforced(): void
    {
        $batch = array_fill(0, 51, $this->valid);

        $this->postJson('/api/events', $batch, $this->withWriteKey())->assertStatus(422);
    }

    public function test_missing_required_fields_are_rejected(): void
    {
        $response = $this->postJson('/api/events', [
            'anonymous_id' => 'anon-123',
            // missing session_id, event_type, event_name
        ], $this->withWriteKey());

        $response->assertStatus(422);
        $this->assertDatabaseCount('events', 0);
    }

    public function test_partial_batch_saves_valid_events(): void
    {
        $batch = [
            $this->valid,
            ['anonymous_id' => 'bad'],  // invalid — missing required fields
        ];

        $response = $this->postJson('/api/events', $batch, $this->withWriteKey());

        $response->assertStatus(201)
                 ->assertJson(['accepted' => 1, 'rejected' => 1]);

        $this->assertDatabaseCount('events', 1);
    }

    public function test_optional_fields_are_stored(): void
    {
        $payload = array_merge($this->valid, [
            'user_id'    => 'user-999',
            'properties' => ['item' => 'Tiramisu', 'price' => 10.0],
        ]);

        $this->postJson('/api/events', $payload, $this->withWriteKey())->assertStatus(201);

        $event = Event::first();
        $this->assertEquals('user-999', $event->user_id);
        $this->assertEquals('Tiramisu', $event->properties['item']);
    }

    public function test_source_defaults_to_browser(): void
    {
        $payload = $this->valid;
        unset($payload['source']);

        $this->postJson('/api/events', $payload, $this->withWriteKey())->assertStatus(201);

        $this->assertDatabaseHas('events', ['source' => 'browser']);
    }

    public function test_invalid_source_is_rejected(): void
    {
        $payload = array_merge($this->valid, ['source' => 'unknown']);

        $response = $this->postJson('/api/events', $payload, $this->withWriteKey());

        $response->assertStatus(422);
    }
}
