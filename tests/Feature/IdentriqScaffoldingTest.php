<?php

use App\Models\Identity;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Database\Seeders\IdentriqSeeder;

test('demo seeder plants the phase 0 dataset', function () {
    $this->seed(IdentriqSeeder::class);

    expect(RegistrationCenter::count())->toBeGreaterThanOrEqual(2)
        ->and(Registrant::count())->toBe(13) // 12 lifecycle citizens + 1 revoked-compromise demo credential
        ->and(Identity::where('status', 'approved')->count())->toBeGreaterThanOrEqual(1)
        ->and(Identity::where('status', 'failed')->count())->toBe(1)
        ->and(Identity::whereNotNull('revoked_at')->count())->toBe(1)
        ->and(Identity::whereNotNull('delivered_at')->count())->toBe(1);
});

test('demo reset is forbidden outside local', function () {
    $this->postJson(route('demo.reset'))->assertForbidden();
});

test('home page loads', function () {
    $this->get('/')->assertOk();
});
