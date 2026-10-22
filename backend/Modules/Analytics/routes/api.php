<?php

use Modules\Analytics\Http\Controllers\AnalyticsController;
use Illuminate\Support\Facades\Route;

Route::prefix('analytics')->middleware('require.read-key')->group(function () {
    Route::get('/overview',        [AnalyticsController::class, 'overview']);
    Route::get('/page-views',      [AnalyticsController::class, 'pageViews']);
    Route::get('/top-pages',       [AnalyticsController::class, 'topPages']);
    Route::get('/events',          [AnalyticsController::class, 'events']);
    Route::get('/recent-events',   [AnalyticsController::class, 'recentEvents']);
    Route::get('/traffic-sources',     [AnalyticsController::class, 'trafficSources']);
    Route::get('/reservation-funnel',  [AnalyticsController::class, 'reservationFunnel']);
});
