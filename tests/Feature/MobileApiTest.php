<?php

use App\Models\Registrant;
use Database\Seeders\IdentriqSeeder;
use Illuminate\Support\Facades\Cache;

test('mobile link exchanges otp stub for token', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));

    $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])
        ->assertOk()->assertJsonStructure(['token', 'registrant_id']);
});

test('mobile link rejects bad otp', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::first();

    $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '000000'])
        ->assertStatus(422);
});

test('authenticated wallet fetches card payload', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::whereHas('identity', fn ($q) => $q->whereNotNull('biosure_id_number'))->first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    $this->getJson('/api/me/identity', ['Authorization' => "Bearer {$token}"])
        ->assertOk()->assertJsonStructure(['full_name', 'biosure_id_number', 'status', 'qr_token']);
});

test('qr payload verifies offline with app key', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::whereHas('identity', fn ($q) => $q->whereNotNull('biosure_id_number'))->first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    $payload = $this->getJson('/api/me/qr-payload', ['Authorization' => "Bearer {$token}"])
        ->assertOk()->json();

    $expected = hash_hmac('sha256', $payload['token'].'|'.$payload['issued_at'], config('app.key'));
    expect($payload['sig'])->toBe($expected);
});

test('wallet timeline mirrors track', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    $this->getJson('/api/me/timeline', ['Authorization' => "Bearer {$token}"])
        ->assertOk()->assertJsonStructure(['timeline', 'notifications']);
});
