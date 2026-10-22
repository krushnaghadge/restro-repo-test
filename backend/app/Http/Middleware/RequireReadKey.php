<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireReadKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $configured = env('ANALYTICS_READ_KEY', '');

        if ($configured === '') {
            return $next($request);
        }

        $header   = $request->header('Authorization', '');
        $provided = str_starts_with($header, 'Bearer ') ? substr($header, 7) : '';

        if (!hash_equals($configured, $provided)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
