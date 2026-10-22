<?php

namespace Modules\Analytics\Http\Controllers;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Analytics\Repositories\Contracts\AnalyticsRepositoryInterface;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsRepositoryInterface $analytics) {}

    public function overview(Request $request): JsonResponse
    {
        [$start, $end] = $this->dateRange($request);

        return response()->json($this->analytics->overview($start, $end));
    }

    public function pageViews(Request $request): JsonResponse
    {
        [$start, $end] = $this->dateRange($request);

        return response()->json($this->analytics->pageViews($start, $end));
    }

    public function topPages(Request $request): JsonResponse
    {
        [$start, $end] = $this->dateRange($request);
        $limit = min((int) $request->query('limit', 10), 50);

        return response()->json($this->analytics->topPages($start, $end, $limit));
    }

    public function events(Request $request): JsonResponse
    {
        [$start, $end] = $this->dateRange($request);

        return response()->json($this->analytics->events($start, $end));
    }

    public function recentEvents(Request $request): JsonResponse
    {
        $perPage   = min(max((int) $request->query('per_page', 20), 5), 100);
        $page      = max((int) $request->query('page', 1), 1);
        $eventType = $request->query('event_type') ?: null;

        return response()->json($this->analytics->recentEvents($perPage, $page, $eventType));
    }

    public function trafficSources(Request $request): JsonResponse
    {
        [$start, $end] = $this->dateRange($request);

        return response()->json($this->analytics->trafficSources($start, $end));
    }

    public function reservationFunnel(Request $request): JsonResponse
    {
        [$start, $end] = $this->dateRange($request);

        return response()->json($this->analytics->reservationFunnel($start, $end));
    }

    /**
     * Parse start/end query params into safe, validated date strings.
     *
     * Defaults to the last 30 days.
     * Invalid dates fall back to defaults rather than crashing.
     * Range is capped at 365 days to prevent runaway queries.
     */
    private function dateRange(Request $request): array
    {
        $defaultStart = now()->subDays(29)->startOfDay();
        $defaultEnd   = now()->endOfDay();

        $start = $defaultStart;
        $end   = $defaultEnd;

        try {
            if ($request->query('start')) {
                $start = Carbon::parse($request->query('start'))->startOfDay();
            }
        } catch (\Exception) {
            $start = $defaultStart;
        }

        try {
            if ($request->query('end')) {
                $end = Carbon::parse($request->query('end'))->endOfDay();
            }
        } catch (\Exception) {
            $end = $defaultEnd;
        }

        // Swap if inverted
        if ($start->greaterThan($end)) {
            [$start, $end] = [$end, $start];
        }

        // Cap at 365 days
        if ($start->diffInDays($end) > 365) {
            $start = $end->copy()->subDays(365)->startOfDay();
        }

        return [
            $start->format('Y-m-d H:i:s'),
            $end->format('Y-m-d H:i:s'),
        ];
    }
}
