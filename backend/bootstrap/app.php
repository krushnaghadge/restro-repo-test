<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'require.write-key' => \App\Http\Middleware\RequireWriteKey::class,
            'require.read-key'  => \App\Http\Middleware\RequireReadKey::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // API routes always return JSON — never HTML error pages
        $exceptions->shouldRenderJsonWhen(function (\Illuminate\Http\Request $req): bool {
            return $req->is('api/*') || $req->expectsJson();
        });
    })->create();
