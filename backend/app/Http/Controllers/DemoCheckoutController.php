<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\Events\Repositories\Contracts\EventRepositoryInterface;

/**
 * Simulates the restaurant's order-management system.
 *
 * The browser SDK fires `order_created` from the client side.
 * This endpoint represents the server-side system independently
 * recording `order_confirmed` — demonstrating server-side business
 * event tracking originating from within a PHP application.
 *
 * Note: for tracking from a *separate* PHP service (POS, payment
 * gateway, kitchen system), use sdk/src/ServerTracker.php directly.
 * See sdk/examples/demo_server_events.php for a runnable example.
 */
class DemoCheckoutController extends Controller
{
    public function __construct(private readonly EventRepositoryInterface $events) {}

    public function confirm(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'order_id'     => 'required|string|max:64',
            'items'        => 'required|array|min:1',
            'total'        => 'required|numeric|min:0',
            'anonymous_id' => 'nullable|string|max:64',
            'session_id'   => 'nullable|string|max:64',
            'user_id'      => 'nullable|string|max:255',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $data = $v->validated();

        // Fire a server-side analytics event directly via the repository.
        // Source is 'server' — distinguishing it from browser-side events
        // in the Live Event Feed and event breakdown charts.
        $this->events->create([
            'anonymous_id' => $data['anonymous_id'] ?? ('srv-' . bin2hex(random_bytes(8))),
            'session_id'   => $data['session_id']   ?? ('srv-sess-' . bin2hex(random_bytes(4))),
            'user_id'      => $data['user_id']       ?? null,
            'event_type'   => 'order_confirmed',
            'event_name'   => 'Order Confirmed',
            'page_path'    => '/checkout',
            'source'       => 'server',
            'properties'   => [
                'order_id' => $data['order_id'],
                'items'    => $data['items'],
                'total'    => $data['total'],
                'currency' => 'USD',
            ],
            'ip'           => $request->ip(),
            'occurred_at'  => now(),
        ]);

        return response()->json([
            'order_id' => $data['order_id'],
            'status'   => 'confirmed',
        ]);
    }
}
