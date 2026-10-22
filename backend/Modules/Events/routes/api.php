<?php

use Modules\Events\Http\Controllers\EventsController;
use Illuminate\Support\Facades\Route;

Route::post('/events', [EventsController::class, 'ingest'])
    ->middleware(['throttle:events', 'require.write-key']);
