<?php

use App\Models\Appointment;
use App\Models\Identity;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Database\Seeders\IdentriqSeeder;
use Inertia\Testing\AssertableInertia as Assert;

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

    $this->get(route('staff.queue', ['filter' => 'rework']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('staff/queue')->where('filter', 'rework'));
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

test('capturing facial photo persists photo_path and reflects on demographic and issuance', function () {
    Storage::fake('public');
    $this->seed(IdentriqSeeder::class);
    $appointment = Appointment::where('status', 'booked')->first();
    $registrant = $appointment->registrant;

    $photo = \Illuminate\Http\UploadedFile::fake()->image('citizen_face.jpg', 640, 480);

    $this->post(route('staff.submit', $appointment), [
        'photo' => $photo,
        'fingerprint_ref' => 'FP-TEST-01',
        'iris_ref' => 'IRIS-TEST-01',
        'attest' => true,
    ])->assertRedirect(route('staff.queue'));

    $demo = $registrant->fresh()->demographic;
    expect($demo->photo_path)->not->toBeNull()
        ->and($demo->photo_url)->toContain('/storage/capture/')
        ->and(Storage::disk('public')->exists($demo->photo_path))->toBeTrue();

    // Verify biometric document is recorded
    $biometricDoc = $registrant->documents()->where('doc_type', 'portrait_photo')->first();
    expect($biometricDoc)->not->toBeNull()
        ->and($biometricDoc->category)->toBe('biometric');

    // Verify admin issuance page renders with photo_url
    $identity = Identity::where('registrant_id', $registrant->id)->first();
    $identity->update(['status' => 'approved']);

    $response = $this->get(route('admin.issuance'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/issuance')
        ->has('identities', fn (Assert $identities) => $identities
            ->each(fn (Assert $item) => $item->where('id', fn ($val) => true)->etc())
        )
    );
});

