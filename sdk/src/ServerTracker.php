<?php

namespace RestroAnalytics;

/**
 * Server-side event tracker.
 *
 * Usage:
 *   $tracker = new ServerTracker('http://localhost:8000/api/events');
 *   $tracker->track('order_created', 'Order Created', [
 *       'order_id' => 'ORD-001',
 *       'total'    => 42.50,
 *   ], anonymousId: $cookieValue, userId: $userId);
 */
class ServerTracker
{
    private string $endpoint;
    private string $writeKey;
    private int    $timeout;

    public function __construct(string $endpoint, string $writeKey = '', int $timeoutSeconds = 3)
    {
        $this->endpoint = $endpoint;
        $this->writeKey = $writeKey;
        $this->timeout  = $timeoutSeconds;
    }

    /**
     * @param string      $eventType   Snake-case identifier, e.g. "order_created"
     * @param string      $eventName   Human label, e.g. "Order Created"
     * @param array       $properties  Arbitrary payload
     * @param string|null $anonymousId Browser anonymous_id cookie (if available)
     * @param string|null $sessionId   Browser session_id cookie (if available)
     * @param string|null $userId      Authenticated user ID
     * @param string|null $pagePath    Page that triggered the server action
     * @param string|null $ip          Client IP address
     */
    public function track(
        string  $eventType,
        string  $eventName,
        array   $properties  = [],
        ?string $anonymousId = null,
        ?string $sessionId   = null,
        ?string $userId      = null,
        ?string $pagePath    = null,
        ?string $ip          = null,
    ): bool {
        $payload = [
            'anonymous_id' => $anonymousId ?? ('srv-' . bin2hex(random_bytes(16))),
            'session_id'   => $sessionId   ?? ('srv-sess-' . bin2hex(random_bytes(8))),
            'user_id'      => $userId,
            'event_type'   => $eventType,
            'event_name'   => $eventName,
            'page_path'    => $pagePath,
            'source'       => 'server',
            'properties'   => $properties,
            'ip'           => $ip,
            'occurred_at'  => (new \DateTimeImmutable())->format('c'),
        ];

        return $this->send($payload);
    }

    private function send(array $payload): bool
    {
        $json = json_encode($payload);

        $headers = "Content-Type: application/json\r\nContent-Length: " . strlen($json);
        if ($this->writeKey !== '') {
            $headers .= "\r\nX-Analytics-Key: {$this->writeKey}";
        }

        $ctx = stream_context_create([
            'http' => [
                'method'        => 'POST',
                'header'        => $headers,
                'content'       => $json,
                'timeout'       => $this->timeout,
                'ignore_errors' => true,
            ],
        ]);

        $result = @file_get_contents($this->endpoint, false, $ctx);

        return $result !== false;
    }
}
