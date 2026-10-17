<?php

use App\Models\Appointment;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Illuminate\Support\Str;

test('track page loads successfully without query', function () {
    $this->get(route('track'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('track')
            ->where('result', null)
        );
});

test('track lookup with unknown credentials returns back with validation error instead of 404', function () {
    $this->from(route('track'))
        ->withHeaders(['X-Inertia' => 'true'])
        ->post(route('track.lookup'), ['mobile' => '00000000'])
        ->assertRedirect(route('track'))
        ->assertSessionHasErrors(['lookup']);
});

test('track lookup matches mobile in national format or 7-digit local format', function () {
    $center = RegistrationCenter::create([
        'name' => 'Waigani Center',
        'code' => 'WAI-01',
        'location' => 'Port Moresby',
        'province' => 'National Capital District',
        'daily_capacity' => 100,
        'is_active' => true,
    ]);

    $registrant = Registrant::create([
        'mobile' => '+67571234567',
        'language' => 'en',
        'status' => 'booked',
    ]);

    $registrant->demographic()->create([
        'full_name' => 'Sarah Kila',
        'gender' => 'female',
        'dob' => '1995-05-15',
    ]);

    $appointment = Appointment::create([
        'registrant_id' => $registrant->id,
        'center_id' => $center->id,
        'slot_at' => now()->addDay(),
        'qr_token' => 'sample-qr-token-12345',
        'status' => 'booked',
    ]);

    // Test with local 7-digit number
    $this->post(route('track.lookup'), ['mobile' => '71234567'])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('track')
            ->where('result.registrant.id', $registrant->id)
        );

    // Test with full +675 number
    $this->post(route('track.lookup'), ['mobile' => '+675 7123 4567'])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('track')
            ->where('result.registrant.id', $registrant->id)
        );

    // Test with QR token
    $this->post(route('track.lookup'), ['qr_token' => 'sample-qr-token-12345'])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('track')
            ->where('result.registrant.id', $registrant->id)
        );

    // Test with formatted IDQ- reference number
    $this->post(route('track.lookup'), ['qr_token' => "IDQ-2026-1018-{$appointment->id}"])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('track')
            ->where('result.registrant.id', $registrant->id)
        );
});

test('visiting /track with active prereg session auto-displays application', function () {
    $center = RegistrationCenter::create([
        'name' => 'Waigani Center 2',
        'code' => 'WAI-02',
        'location' => 'Port Moresby',
        'province' => 'National Capital District',
        'daily_capacity' => 100,
        'is_active' => true,
    ]);

    $registrant = Registrant::create([
        'mobile' => '+67579876543',
        'language' => 'en',
        'status' => 'booked',
    ]);

    Appointment::create([
        'registrant_id' => $registrant->id,
        'center_id' => $center->id,
        'slot_at' => now()->addDay(),
        'qr_token' => Str::random(32),
        'status' => 'booked',
    ]);

    $this->withSession(['prereg_id' => $registrant->id])
        ->get(route('track'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('track')
            ->where('result.registrant.id', $registrant->id)
        );
});
