<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireWriteKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $configured = env('ANALYTICS_WRITE_KEY', '');

        // Unconfigured → skip check (local dev / test without key set)
        if ($configured === '') {
            return $next($request);
        }

        // Browser SDK sends X-Analytics-Key header on fetch().
        // sendBeacon() cannot set headers, so it appends ?key= to the URL.
        $provided = $request->header('X-Analytics-Key')
            ?? $request->query('key', '');

        if (!hash_equals($configured, (string) $provided)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
