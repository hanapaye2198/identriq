<?php

use App\Models\Appointment;
use App\Models\Identity;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Database\Seeders\IdentriqSeeder;

test('checkin capture submit moves registrant to validating', function () {
    $this->seed(IdentriqSeeder::class);
    $appointment = Appointment::where('status', 'booked')->first();

    $this->post(route('staff.checkin', $appointment))->assertRedirect();
    expect($appointment->fresh()->status)->toBe('checked-in');

    $this->get(route('staff.capture', $appointment))->assertOk();

    $docs = [];
    foreach ($appointment->registrant->documents as $doc) {
        $docs[$doc->id] = ['status' => 'accepted', 'note' => ''];
    }
    $this->post(route('staff.submit', $appointment), [
        'fingerprint_ref' => 'FP-1', 'iris_ref' => 'IRIS-1',
        'documents' => $docs, 'attest' => true,
    ])->assertRedirect(route('staff.queue'));

    expect($appointment->fresh()->status)->toBe('completed')
        ->and($appointment->registrant->fresh()->status)->toBe('validating')
        ->and(Identity::where('registrant_id', $appointment->registrant_id)->where('status', 'pending')->exists())->toBeTrue();
});

test('rejected document routes to rework queue', function () {
    $this->seed(IdentriqSeeder::class);
    $appointment = Appointment::where('status', 'booked')->first();
    $docId = $appointment->registrant->documents->first()->id;

    $this->post(route('staff.submit', $appointment), [
        'documents' => [$docId => ['status' => 'rejected', 'note' => 'Unreadable']],
        'attest' => true,
    ])->assertRedirect(route('staff.queue'));

    expect($appointment->fresh()->status)->toBe('rework');
    $this->get(route('staff.rework'))->assertOk();
});

test('setup capacity is enforced at booking', function () {
    $this->seed(IdentriqSeeder::class);
    $center = RegistrationCenter::first();
    $center->update(['daily_capacity' => 0]);

    $registrant = Registrant::create(['mobile' => '+6757999999', 'status' => 'reviewed']);
    $this->withSession(['prereg_id' => $registrant->id])
        ->post(route('prereg.book'), ['center_id' => $center->id, 'slot_at' => now()->addDay()->toDateTimeString()])
        ->assertStatus(422);
});
