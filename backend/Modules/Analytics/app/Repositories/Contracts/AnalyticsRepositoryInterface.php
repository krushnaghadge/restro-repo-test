<?php

namespace Modules\Analytics\Repositories\Contracts;

interface AnalyticsRepositoryInterface
{
    public function overview(string $start, string $end): array;

    public function pageViews(string $start, string $end): mixed;

    public function topPages(string $start, string $end, int $limit): mixed;

    public function events(string $start, string $end): mixed;

    public function recentEvents(int $perPage, int $page, ?string $eventType): array;

    public function trafficSources(string $start, string $end): mixed;

    public function reservationFunnel(string $start, string $end): array;
}
