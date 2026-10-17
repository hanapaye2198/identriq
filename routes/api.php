<?php

use App\Http\Controllers\MobileController;
use Illuminate\Support\Facades\Route;

Route::post('/mobile/link', [MobileController::class, 'link'])->middleware('throttle:10,1');
Route::post('/mobile/otp', [MobileController::class, 'otp'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/mobile/unlink', [MobileController::class, 'unlink']);
    Route::post('/mobile/report-lost', [MobileController::class, 'reportLost']);
    Route::get('/mobile/consent/pending', [MobileController::class, 'consentPending']);
    Route::post('/mobile/consent/{consent}/decide', [MobileController::class, 'consentDecide']);
    Route::get('/mobile/activity', [MobileController::class, 'activity']);
    Route::get('/mobile/devices', [MobileController::class, 'devices']);
    Route::delete('/mobile/devices/{device}', [MobileController::class, 'deviceRemove']);
    Route::get('/me/identity', [MobileController::class, 'identity']);
    Route::get('/me/qr-payload', [MobileController::class, 'qrPayload']);
    Route::get('/me/qr-svg', [MobileController::class, 'qrSvg']);
    Route::get('/me/timeline', [MobileController::class, 'timeline']);
});
