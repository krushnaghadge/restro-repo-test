<?php

namespace Modules\Analytics\Repositories;

use Illuminate\Support\Facades\DB;
use Modules\Analytics\Repositories\Contracts\AnalyticsRepositoryInterface;
use Modules\Events\Models\Event;

class AnalyticsRepository implements AnalyticsRepositoryInterface
{
    public function overview(string $start, string $end): array
    {
        $base = Event::whereBetween('occurred_at', [$start, $end]);

        // Use '|' separator to prevent CONCAT collision (e.g. "ab" + "cd" ≠ "a" + "bcd")
        $sessions = (clone $base)
            ->select(DB::raw("COUNT(DISTINCT CONCAT(anonymous_id, '|', session_id)) as cnt"))
            ->value('cnt') ?? 0;

        return [
            'page_views'      => (clone $base)->where('event_type', 'page_view')->count(),
            'unique_visitors' => (clone $base)->where('event_type', 'page_view')
                ->distinct('anonymous_id')->count('anonymous_id'),
            'sessions'        => (int) $sessions,
            'total_events'    => (clone $base)->count(),
            'orders'          => (clone $base)->where('event_type', 'order_created')->count(),
            'start'           => $start,
            'end'             => $end,
        ];
    }

    public function pageViews(string $start, string $end): mixed
    {
        // GROUP BY the expression, NOT the alias — avoids ONLY_FULL_GROUP_BY violations
        return Event::where('event_type', 'page_view')
            ->whereBetween('occurred_at', [$start, $end])
            ->select(
                DB::raw('DATE(occurred_at) as date'),
                DB::raw('COUNT(*) as views'),
                DB::raw('COUNT(DISTINCT anonymous_id) as unique_visitors')
            )
            ->groupBy(DB::raw('DATE(occurred_at)'))
            ->orderBy(DB::raw('DATE(occurred_at)'))
            ->get();
    }

    public function topPages(string $start, string $end, int $limit): mixed
    {
        return Event::where('event_type', 'page_view')
            ->whereBetween('occurred_at', [$start, $end])
            ->whereNotNull('page_path')
            ->select(
                'page_path',
                'page_title',
                DB::raw('COUNT(*) as views'),
                DB::raw('COUNT(DISTINCT anonymous_id) as unique_visitors')
            )
            ->groupBy('page_path', 'page_title')
            ->orderByDesc('views')
            ->limit($limit)
            ->get();
    }

    public function events(string $start, string $end): mixed
    {
        return Event::whereBetween('occurred_at', [$start, $end])
            ->select(
                'event_type',
                'event_name',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('event_type', 'event_name')
            ->orderByDesc('count')
            ->get();
    }

    public function recentEvents(int $perPage, int $page, ?string $eventType): array
    {
        $query = Event::select(
            'id', 'event_type', 'event_name',
            'page_path', 'anonymous_id', 'source', 'occurred_at'
        )->orderByDesc('occurred_at');

        if ($eventType) {
            $query->where('event_type', $eventType);
        }

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return [
            'data'         => $paginated->items(),
            'total'        => $paginated->total(),
            'per_page'     => $paginated->perPage(),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
        ];
    }

    public function trafficSources(string $start, string $end): mixed
    {
        // Subquery normalises referrer → source label first; outer query then
        // groups by the alias — avoiding ONLY_FULL_GROUP_BY violations and
        // correctly merging NULL / empty-string referrers into 'Direct'.
        $inner = Event::where('event_type', 'page_view')
            ->whereBetween('occurred_at', [$start, $end])
            ->select(
                'anonymous_id',
                DB::raw("COALESCE(NULLIF(TRIM(referrer), ''), 'Direct') AS source")
            )
            ->getQuery();

        return DB::table($inner, 'sub')
            ->select(
                'source',
                DB::raw('COUNT(*) as views'),
                DB::raw('COUNT(DISTINCT anonymous_id) as visitors')
            )
            ->groupBy('source')
            ->orderByDesc('views')
            ->limit(10)
            ->get();
    }

    public function reservationFunnel(string $start, string $end): array
    {
        $count = fn(string $type) => Event::whereBetween('occurred_at', [$start, $end])
            ->where('event_type', $type)
            ->distinct('anonymous_id')
            ->count('anonymous_id');

        $viewed       = $count('reservation_page_viewed');
        $started      = $count('reservation_form_started');
        $timeSelected = $count('reservation_time_selected');
        $completed    = $count('reservation_completed');

        return [
            ['step' => 'Page Viewed',    'event_type' => 'reservation_page_viewed',    'visitors' => $viewed],
            ['step' => 'Form Started',   'event_type' => 'reservation_form_started',   'visitors' => $started],
            ['step' => 'Time Selected',  'event_type' => 'reservation_time_selected',  'visitors' => $timeSelected],
            ['step' => 'Completed',      'event_type' => 'reservation_completed',      'visitors' => $completed],
        ];
    }
}
