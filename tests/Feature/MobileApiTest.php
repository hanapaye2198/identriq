<?php

use App\Models\Appointment;
use App\Models\AuthEvent;
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

test('mobile link can be resolved by appointment token', function () {
    $this->seed(IdentriqSeeder::class);
    $appointment = Appointment::with('registrant')->first();

    // Unknown tokens 404, like unknown mobile numbers.
    $this->postJson('/api/mobile/otp', ['token' => 'not-a-real-token'])->assertStatus(404);

    // A known token sends the code to the registrant's registered mobile…
    $this->postJson('/api/mobile/otp', ['token' => $appointment->qr_token])
        ->assertOk()
        ->assertJson(['sent' => true])
        ->assertJsonStructure(['mobile_hint']);

    Cache::put("otp:{$appointment->registrant->mobile}", '123456', now()->addMinutes(5));

    // …and the same token exchanges the OTP for a wallet token.
    $this->postJson('/api/mobile/link', ['token' => $appointment->qr_token, 'otp' => '123456'])
        ->assertOk()->assertJsonStructure(['token', 'registrant_id']);
});

test('mobile link accepts a pasted appointment QR url', function () {
    $this->seed(IdentriqSeeder::class);
    $appointment = Appointment::with('registrant')->first();
    Cache::put("otp:{$appointment->registrant->mobile}", '123456', now()->addMinutes(5));

    $pasted = url('/verify/offline?token='.$appointment->qr_token.'&share=name,over18');

    $this->postJson('/api/mobile/link', ['token' => $pasted, 'otp' => '123456'])
        ->assertOk()->assertJsonStructure(['token', 'registrant_id']);
});

test('authenticated wallet fetches card payload', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::whereHas('identity', fn ($q) => $q->whereNotNull('biosure_id_number'))->first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    $this->getJson('/api/me/identity', ['Authorization' => "Bearer {$token}"])
        ->assertOk()->assertJsonStructure([
            'full_name',
            'biosure_id_number',
            'status',
            'qr_token',
            'province',
            'photo_url',
            'appointment' => [
                'center',
                'center_location',
                'center_province',
                'slot_at',
                'reference',
                'status',
            ],
        ]);
});

test('qr payload verifies offline with app key', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::whereHas('identity', fn ($q) => $q->whereNotNull('biosure_id_number'))->first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    $payload = $this->getJson('/api/me/qr-payload', ['Authorization' => "Bearer {$token}"])
        ->assertOk()->json();

    // Signature covers token | issued_at | share scope (empty when unscoped).
    $expected = hash_hmac('sha256', $payload['token'].'|'.$payload['issued_at'].'|', config('app.key'));
    expect($payload['share'])->toBeNull()
        ->and($payload['sig'])->toBe($expected);
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

test('qr payload carries an optional share scope', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::whereHas('identity', fn ($q) => $q->whereNotNull('biosure_id_number'))->first();
    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    $payload = $this->getJson('/api/me/qr-payload?fields=name,id_masked,over18', ['Authorization' => "Bearer {$token}"])
        ->assertOk()->json();

    $expected = hash_hmac('sha256', $payload['token'].'|'.$payload['issued_at'].'|name,id_masked,over18', config('app.key'));
    expect($payload['share'])->toBe(['name', 'id_masked', 'over18'])
        ->and($payload['sig'])->toBe($expected);

    $this->getJson('/api/me/qr-svg?fields=bogus', ['Authorization' => "Bearer {$token}"])
        ->assertStatus(422);
});

test('wallet consent request can be allowed and shows in activity', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::whereHas('identity', fn ($q) => $q->whereNotNull('biosure_id_number'))->first();
    $identity = $registrant->identity;

    // The public verifier page opens the request…
    $created = $this->postJson('/verify/online/consent', [
        'query' => $identity->biosure_id_number,
        'verifier_name' => 'Demo Bank eKYC',
        'purpose' => 'Account opening',
        'fields' => 'name,photo,over18',
    ])->assertOk()->assertJsonPath('status', 'pending')->json();

    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    // …the wallet sees it pending…
    $this->getJson('/api/mobile/consent/pending', ['Authorization' => "Bearer {$token}"])
        ->assertOk()
        ->assertJsonPath('request.verifier_name', 'Demo Bank eKYC')
        ->assertJsonPath('request.fields', ['name', 'photo', 'over18']);

    // …approves it…
    $this->postJson("/api/mobile/consent/{$created['id']}/decide", ['allow' => true], ['Authorization' => "Bearer {$token}"])
        ->assertOk()->assertJsonPath('status', 'allowed');

    // …the verifier page's poll sees the decision…
    $this->getJson("/verify/online/consent/{$created['id']}")
        ->assertOk()->assertJsonPath('status', 'allowed');

    // …and the decision is on the wallet activity feed.
    $this->getJson('/api/mobile/activity', ['Authorization' => "Bearer {$token}"])
        ->assertOk()
        ->assertJsonPath('events.0.mode', 'consent')
        ->assertJsonPath('events.0.result', 'allowed')
        ->assertJsonPath('events.0.verifier', 'Demo Bank eKYC')
        ->assertJsonPath('events.0.fields', ['name', 'photo', 'over18']);
});

test('wallet consent deny and expiry are honored', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::whereHas('identity', fn ($q) => $q->whereNotNull('biosure_id_number'))->first();
    $identity = $registrant->identity;

    $created = $this->postJson('/verify/online/consent', [
        'query' => $identity->biosure_id_number,
        'verifier_name' => 'Demo Police vetting',
        'purpose' => 'Police check',
    ])->assertOk()->json();

    Cache::put("otp:{$registrant->mobile}", '123456', now()->addMinutes(5));
    $token = $this->postJson('/api/mobile/link', ['mobile' => $registrant->mobile, 'otp' => '123456'])->json('token');

    // Default scope when the verifier omits fields.
    $this->getJson('/api/mobile/consent/pending', ['Authorization' => "Bearer {$token}"])
        ->assertJsonPath('request.fields', ['name', 'photo', 'over18']);

    $this->postJson("/api/mobile/consent/{$created['id']}/decide", ['allow' => false], ['Authorization' => "Bearer {$token}"])
        ->assertOk()->assertJsonPath('status', 'denied');

    expect(AuthEvent::where('identity_id', $identity->id)->where('mode', 'consent')->where('result', 'denied')->exists())->toBeTrue();

    // An expired request drops out of the pending slot and cannot be decided.
    $stale = $identity->consentRequests()->create([
        'verifier_name' => 'Demo Telco',
        'purpose' => 'SIM registration',
        'fields' => ['name'],
        'status' => 'pending',
        'expires_at' => now()->subMinute(),
    ]);

    $this->getJson('/api/mobile/consent/pending', ['Authorization' => "Bearer {$token}"])
        ->assertJsonPath('request', null);

    $this->postJson("/api/mobile/consent/{$stale->id}/decide", ['allow' => true], ['Authorization' => "Bearer {$token}"])
        ->assertStatus(422);
});

test('wallet lists and removes linked devices', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::first();
    $first = $registrant->createToken('wallet')->plainTextToken;
    $registrant->createToken('wallet');

    $devices = $this->getJson('/api/mobile/devices', ['Authorization' => "Bearer {$first}"])
        ->assertOk()->json('devices');

    expect($devices)->toHaveCount(2);

    $current = collect($devices)->firstWhere('current', true);
    $other = collect($devices)->firstWhere('current', false);
    expect($current)->not->toBeNull()
        ->and($other)->not->toBeNull();

    $this->deleteJson("/api/mobile/devices/{$other['id']}", [], ['Authorization' => "Bearer {$first}"])
        ->assertOk()->assertJson(['removed' => true, 'current' => false]);

    $this->getJson('/api/mobile/devices', ['Authorization' => "Bearer {$first}"])
        ->assertOk()->assertJsonCount(1, 'devices');

    // Removing the device you are on behaves like unlink.
    $this->deleteJson("/api/mobile/devices/{$current['id']}", [], ['Authorization' => "Bearer {$first}"])
        ->assertOk()->assertJson(['current' => true]);

    $this->getJson('/api/me/identity', ['Authorization' => "Bearer {$first}"])
        ->assertUnauthorized();
});
