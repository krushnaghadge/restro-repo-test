<?php

use App\Http\Controllers\DemoCheckoutController;
use Illuminate\Support\Facades\Route;

// Routes are registered by Laravel Modules:
//   Modules/Events/routes/api.php    → POST /api/events
//   Modules/Analytics/routes/api.php → GET  /api/analytics/*

// Demo: server-side order confirmation using ServerTracker SDK
Route::post('/demo/checkout', [DemoCheckoutController::class, 'confirm']);
