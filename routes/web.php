<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CenterController;
use App\Http\Controllers\PreregController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\TrackController;
use App\Http\Controllers\VerifyController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/centers', [CenterController::class, 'index'])->name('centers');
Route::get('/api/centers', [CenterController::class, 'json'])->name('api.centers');

Route::get('/prereg/{step?}', [PreregController::class, 'show'])->name('prereg')->whereNumber('step');
Route::get('/prereg/captcha', [PreregController::class, 'captcha'])->name('prereg.captcha');
Route::post('/prereg/language', [PreregController::class, 'language'])->name('prereg.language');
Route::post('/prereg/mobile', [PreregController::class, 'mobile'])->name('prereg.mobile');
Route::post('/prereg/otp/resend', [PreregController::class, 'resend'])->name('prereg.otp.resend');
Route::post('/prereg/otp/verify', [PreregController::class, 'verifyOtp'])->name('prereg.otp.verify');
Route::post('/prereg/consent', [PreregController::class, 'consent'])->name('prereg.consent');
Route::post('/prereg/demographics', [PreregController::class, 'demographics'])->name('prereg.demographics');
Route::post('/prereg/documents', [PreregController::class, 'documents'])->name('prereg.documents');
Route::post('/prereg/confirm', [PreregController::class, 'confirm'])->name('prereg.confirm');
Route::post('/prereg/book', [PreregController::class, 'book'])->name('prereg.book');
Route::get('/api/prereg/slots', [PreregController::class, 'slots'])->name('api.prereg.slots');

Route::get('/track', [TrackController::class, 'index'])->name('track');
Route::match(['get', 'post'], '/track/lookup', [TrackController::class, 'lookup'])->name('track.lookup');

Route::inertia('/m', 'm/link')->name('m.link');
Route::inertia('/m/wallet', 'm/wallet')->name('m.wallet');
Route::inertia('/m/verify', 'm/verifier')->name('m.verify');

Route::get('/staff', [StaffController::class, 'queue'])->name('staff.queue');
Route::post('/staff/appointments/{appointment}/checkin', [StaffController::class, 'checkin'])->name('staff.checkin');
Route::post('/staff/walkin', [StaffController::class, 'walkin'])->name('staff.walkin');
Route::get('/staff/capture/{appointment}', [StaffController::class, 'capture'])->name('staff.capture');
Route::post('/staff/capture/{appointment}', [StaffController::class, 'submit'])->name('staff.submit');
Route::get('/staff/setup', [StaffController::class, 'setup'])->name('staff.setup');
Route::put('/staff/setup/{center}', [StaffController::class, 'updateSetup'])->name('staff.setup.update');

Route::get('/admin/validation', [AdminController::class, 'queue'])->name('admin.queue');
Route::get('/admin/validation/{registrant}', [AdminController::class, 'review'])->name('admin.review');
Route::post('/admin/validation/{registrant}/decide', [AdminController::class, 'decide'])->name('admin.decide');
Route::post('/admin/validation/{registrant}/merge', [AdminController::class, 'merge'])->name('admin.merge');
Route::post('/admin/advance', [AdminController::class, 'advance'])->name('admin.advance');
Route::get('/admin/issuance', [AdminController::class, 'issuance'])->name('admin.issuance');
Route::post('/admin/issuance/{identity}/issue', [AdminController::class, 'issue'])->name('admin.issue');
Route::post('/admin/issuance/{identity}/deliver', [AdminController::class, 'deliver'])->name('admin.deliver');
Route::get('/admin/master', [AdminController::class, 'master'])->name('admin.master');
Route::post('/admin/master/centers', [AdminController::class, 'storeCenter'])->name('admin.centers.store');
Route::put('/admin/master/centers/{center}', [AdminController::class, 'updateCenter'])->name('admin.centers.update');
Route::get('/admin/audit', [AdminController::class, 'audit'])->name('admin.audit');
Route::get('/admin/export.csv', [AdminController::class, 'export'])->name('admin.export');

Route::get('/verify/offline', [VerifyController::class, 'offline'])->name('verify.offline');
Route::post('/verify/offline/check', [VerifyController::class, 'check'])->name('verify.check');
Route::post('/verify/outbox/sync', [VerifyController::class, 'syncOutbox'])->name('verify.sync');
Route::get('/verify/snapshot', [VerifyController::class, 'snapshot'])->name('verify.snapshot');
Route::get('/verify/online', [VerifyController::class, 'online'])->name('verify.online');
Route::post('/verify/online/lookup', [VerifyController::class, 'lookup'])->middleware('throttle:10,1')->name('verify.lookup');
Route::post('/verify/online/biometric', [VerifyController::class, 'biometric'])->middleware('throttle:10,1')->name('verify.biometric');
Route::post('/verify/online/consent', [VerifyController::class, 'requestConsent'])->middleware('throttle:10,1')->name('verify.consent.create');
Route::get('/verify/online/consent/{consent}', [VerifyController::class, 'consentStatus'])->name('verify.consent.status');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::post('/demo/reset', function () {
    abort_unless(app()->isLocal(), 403);

    Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);

    return response()->json(['ok' => true]);
})->name('demo.reset');

require __DIR__.'/settings.php';
