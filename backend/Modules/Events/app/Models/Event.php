<?php

namespace Modules\Events\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'anonymous_id',
        'session_id',
        'user_id',
        'event_type',
        'event_name',
        'page_url',
        'page_path',
        'page_title',
        'referrer',
        'source',
        'properties',
        'device',
        'ip',
        'country',
        'occurred_at',
    ];

    protected $casts = [
        'properties'  => 'array',
        'device'      => 'array',
        'occurred_at' => 'datetime',
    ];
}
