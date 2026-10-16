<?php

use App\Http\Controllers\MobileController;
use Illuminate\Support\Facades\Route;

Route::post('/mobile/link', [MobileController::class, 'link']);
Route::post('/mobile/otp', [MobileController::class, 'otp']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me/identity', [MobileController::class, 'identity']);
    Route::get('/me/qr-payload', [MobileController::class, 'qrPayload']);
    Route::get('/me/qr-svg', [MobileController::class, 'qrSvg']);
    Route::get('/me/timeline', [MobileController::class, 'timeline']);
});
