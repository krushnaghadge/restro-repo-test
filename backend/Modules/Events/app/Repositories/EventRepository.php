<?php

namespace Modules\Events\Repositories;

use Illuminate\Support\Facades\DB;
use Modules\Events\Models\Event;
use Modules\Events\Repositories\Contracts\EventRepositoryInterface;

class EventRepository implements EventRepositoryInterface
{
    public function __construct(private readonly Event $model) {}

    public function create(array $data): Event
    {
        return $this->model->create($data);
    }

    public function createMany(array $rows): int
    {
        if (empty($rows)) {
            return 0;
        }

        $now = now();

        $records = array_map(fn(array $r) => array_merge($r, [
            'created_at' => $now,
            'updated_at' => $now,
        ]), $rows);

        DB::table('events')->insert($records);

        return count($records);
    }
}
