<?php

use App\Models\Identity;
use App\Models\Registrant;
use Database\Seeders\IdentriqSeeder;

test('approve issue deliver chain completes an identity', function () {
    $this->seed(IdentriqSeeder::class);
    $registrant = Registrant::where('status', 'validating')->first();

    $this->post(route('admin.decide', $registrant), ['decision' => 'approved'])->assertRedirect();
    $identity = Identity::where('registrant_id', $registrant->id)->first();
    expect($identity->status)->toBe('approved');

    $this->post(route('admin.issue', $identity))->assertRedirect();
    expect($identity->fresh()->biosure_id_number)->not->toBeNull()
        ->and($identity->fresh()->card_personalized_at)->not->toBeNull();

    $this->post(route('admin.deliver', $identity), ['channel' => 'Counter pickup'])->assertRedirect();
    expect($identity->fresh()->delivered_at)->not->toBeNull()
        ->and($registrant->fresh()->status)->toBe('delivered');
});

test('advance approves clean cases and skips the rest', function () {
    $this->seed(IdentriqSeeder::class);

    $this->post(route('admin.advance'))->assertRedirect();
    expect(Identity::where('status', 'approved')->count())->toBeGreaterThanOrEqual(1);
});

test('duplicate merge fails the loser', function () {
    $this->seed(IdentriqSeeder::class);
    $winner = Registrant::whereHas('demographic', fn ($q) => $q->where('full_name', 'Mary Kila'))->first();

    $loser = Registrant::create(['mobile' => '+6757888888', 'status' => 'validating']);
    $loser->demographic()->create([
        'full_name' => 'Mary Kila Jr', 'dob' => $winner->demographic->dob,
        'gender' => 'female', 'nationality' => 'Papua New Guinean',
    ]);

    $this->get(route('admin.review', $winner))->assertOk();
    $this->post(route('admin.merge', $winner), ['loser_id' => $loser->id])->assertRedirect();
    expect($loser->fresh()->status)->toBe('failed');
});

test('export returns csv', function () {
    $this->seed(IdentriqSeeder::class);
    $this->get(route('admin.export'))->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});
