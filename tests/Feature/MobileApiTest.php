<?php

use App\Models\Registrant;
use Database\Seeders\IdentriqSeeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(function () {
    // The route-level `throttle:10,1` keys off sha1(domain|ip); reset it so
    // attempts from one test never leak into the next.
    RateLimiter::clear(sha1('|127.0.0.1'));
});

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

test('qr svg renders for linked wallet', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::whereHas('appointments')->first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    $this->getJson('/api/me/qr-svg', ['Authorization' => "Bearer {$token}"])
        ->assertOk()->assertJsonStructure(['svg']);
});

test('mobile web routes load', function () {
    foreach (['/m', '/m/wallet', '/m/verify'] as $url) {
        $this->get($url)->assertOk();
    }
});

test('unlink revokes the wallet token', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    $this->postJson('/api/mobile/unlink', [], ['Authorization' => "Bearer {$token}"])
        ->assertOk()->assertJson(['revoked' => true]);

    $this->getJson('/api/me/identity', ['Authorization' => "Bearer {$token}"])
        ->assertUnauthorized();
});

test('otp is single-use', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));

    $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])
        ->assertOk();

    $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])
        ->assertStatus(422);
});

test('mobile otp endpoint throttles repeated attempts', function () {
    for ($i = 0; $i < 10; $i++) {
        $this->postJson('/api/mobile/otp', ['mobile' => '+6750000000'])->assertStatus(404);
    }

    $this->postJson('/api/mobile/otp', ['mobile' => '+6750000000'])->assertStatus(429);
});

test('report lost suspends the credential', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::whereHas('identity', fn ($q) => $q->whereNotNull('biosure_id_number'))->first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    $this->postJson('/api/mobile/report-lost', [], ['Authorization' => "Bearer {$token}"])
        ->assertOk()->assertJson(['state' => 'suspended']);

    expect($registrant->identity->fresh()->suspended_at)->not->toBeNull();

    $this->getJson('/api/me/identity', ['Authorization' => "Bearer {$token}"])
        ->assertOk()->assertJson(['credential_state' => 'suspended']);
});
