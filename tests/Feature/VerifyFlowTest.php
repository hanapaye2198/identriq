<?php

use App\Models\Appointment;
use App\Models\AuthEvent;
use App\Models\Identity;
use Database\Seeders\IdentriqSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('offline check returns verdict and logs event', function () {
    $this->seed(IdentriqSeeder::class);
    $identity = Identity::whereNotNull('biosure_id_number')->first();
    $token = Appointment::where('registrant_id', $identity->registrant_id)->first()->qr_token;

    $this->postJson(route('verify.check'), ['token' => $token])
        ->assertOk()->assertJson(['valid' => true]);
    expect(AuthEvent::where('identity_id', $identity->id)->where('mode', 'offline_qr')->exists())->toBeTrue();

    $this->postJson(route('verify.check'), ['token' => 'bogus'])->assertOk()
        ->assertJson(['valid' => false]);
});

test('outbox sync logs queued events', function () {
    $this->seed(IdentriqSeeder::class);
    $token = Appointment::first()->qr_token;

    $this->postJson(route('verify.sync'), ['events' => [
        ['token' => $token, 'result' => 'valid', 'at' => now()->toISOString()],
        ['token' => 'bogus', 'result' => 'invalid'],
    ]])->assertOk()->assertJson(['synced' => 1]);
});

test('online lookup is masked, logged and throttled', function () {
    $this->seed(IdentriqSeeder::class);
    $identity = Identity::whereNotNull('biosure_id_number')->first();

    $this->postJson(route('verify.lookup'), ['query' => $identity->biosure_id_number, 'purpose' => 'Test'])
        ->assertOk()->assertJsonStructure(['name_masked', 'biosure', 'status']);
    expect(AuthEvent::where('identity_id', $identity->id)->where('mode', 'online_ekyc')->exists())->toBeTrue();

    foreach (range(1, 11) as $i) {
        $response = $this->postJson(route('verify.lookup'), ['query' => 'x', 'purpose' => 'Test']);
    }
    $response->assertStatus(429);
});

test('biometric match is deterministic and logged', function () {
    Storage::fake('public');
    $this->seed(IdentriqSeeder::class);
    $identity = Identity::first();

    $payload = ['identity_id' => $identity->id, 'photo' => UploadedFile::fake()->image('live.jpg')];
    $first = $this->post(route('verify.biometric'), $payload)->assertOk()->json();
    $second = $this->post(route('verify.biometric'), $payload)->assertOk()->json();

    expect($first['score'])->toBe($second['score'])
        ->and(AuthEvent::where('identity_id', $identity->id)->where('mode', 'online_biometric')->count())->toBe(2);
});
