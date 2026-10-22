<?php

namespace Modules\Events\Repositories\Contracts;

use Modules\Events\Models\Event;

interface EventRepositoryInterface
{
    public function create(array $data): Event;

    /** Bulk-insert multiple events in a single query. */
    public function createMany(array $rows): int;
}
