<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // 300 event-ingestion requests per minute per IP (batch of 50 = 15,000 events/min)
        RateLimiter::for('events', function (Request $request) {
            return Limit::perMinute(300)->by($request->ip());
        });
    }
}
