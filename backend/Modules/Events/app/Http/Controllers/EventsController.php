<?php

namespace Modules\Events\Http\Controllers;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Modules\Events\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventsController extends Controller
{
    public function __construct(private readonly EventRepositoryInterface $events) {}

    public function ingest(Request $request): JsonResponse
    {
        $body   = $request->json()->all();
        $events = isset($body[0]) ? $body : [$body];

        if (count($events) > 50) {
            return response()->json(['error' => 'Batch limit is 50 events'], 422);
        }

        $valid  = [];
        $errors = [];
        $ip     = $this->getClientIp($request);

        foreach ($events as $idx => $payload) {
            $v = Validator::make($payload, [
                'anonymous_id' => 'required|string|max:64',
                'session_id'   => 'required|string|max:64',
                'user_id'      => 'nullable|string|max:255',
                'event_type'   => 'required|string|max:64',
                'event_name'   => 'required|string|max:128',
                'page_url'     => 'nullable|url|max:2048',
                'page_path'    => 'nullable|string|max:512',
                'page_title'   => 'nullable|string|max:255',
                'referrer'     => 'nullable|string|max:2048',
                'source'       => 'nullable|in:browser,server',
                'properties'   => 'nullable|array',
                'device'       => 'nullable|array',
                'occurred_at'  => 'nullable|date',
            ]);

            if ($v->fails()) {
                $errors[$idx] = $v->errors();
                continue;
            }

            $data                = $v->validated();
            $data['source']      = $data['source'] ?? 'browser';
            // Normalise to MySQL DATETIME — accepts ISO 8601, Unix ts, or any Carbon-parseable string
            $data['occurred_at'] = isset($data['occurred_at'])
                ? Carbon::parse($data['occurred_at'])->format('Y-m-d H:i:s')
                : now()->format('Y-m-d H:i:s');
            $data['ip']          = $ip;
            $data['properties']  = isset($data['properties']) ? json_encode($data['properties']) : null;
            $data['device']      = isset($data['device'])     ? json_encode($data['device'])     : null;

            $valid[] = $data;
        }

        if (!empty($errors) && empty($valid)) {
            return response()->json(['errors' => $errors], 422);
        }

        $saved = $this->events->createMany($valid);

        return response()->json([
            'accepted' => $saved,
            'rejected' => count($errors),
        ], 201);
    }

    private function getClientIp(Request $request): string
    {
        $ip = $request->header('X-Forwarded-For')
            ? explode(',', $request->header('X-Forwarded-For'))[0]
            : $request->ip();

        return filter_var(trim($ip), FILTER_VALIDATE_IP) ? trim($ip) : $request->ip();
    }
}
