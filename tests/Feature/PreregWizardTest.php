<?php

use App\Models\Appointment;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Database\Seeders\IdentriqSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

test('full pre-registration wizard happy path', function () {
    Storage::fake('public');
    $center = RegistrationCenter::create([
        'name' => 'Test Center', 'province' => 'NCD', 'location' => 'Test',
        'daily_capacity' => 10,
    ]);

    $this->get('/prereg/captcha')->assertOk();
    $this->post(route('prereg.language'), ['language' => 'en'])->assertRedirect();

    $this->post(route('prereg.mobile'), [
        'mobile' => '+6757111111',
        'captcha' => session('captcha'),
    ])->assertRedirect();

    $code = Cache::get('otp:+6757111111');
    expect($code)->not->toBeNull();

    $this->post(route('prereg.otp.verify'), ['otp' => $code])->assertRedirect();
    $this->post(route('prereg.consent'), ['accept' => true])->assertRedirect();

    $this->post(route('prereg.demographics'), [
        'full_name' => 'Test Person', 'dob' => '1990-01-01', 'gender' => 'female',
        'nationality' => 'Papua New Guinean', 'province' => 'NCD',
    ])->assertRedirect();

    $this->post(route('prereg.documents'), [
        'category' => 'identity', 'doc_type' => 'passport',
        'file' => UploadedFile::fake()->create('id.pdf', 100, 'application/pdf'),
    ])->assertRedirect();
    $this->post(route('prereg.documents'), [
        'category' => 'address', 'doc_type' => 'utility_bill',
        'file' => UploadedFile::fake()->create('addr.pdf', 100, 'application/pdf'),
    ])->assertRedirect();

    $this->post(route('prereg.confirm'))->assertRedirect();

    $response = $this->post(route('prereg.book'), [
        'center_id' => $center->id,
        'slot_at' => now()->addDay()->setTime(9, 0)->toDateTimeString(),
    ]);
    $response->assertOk();

    $registrant = Registrant::where('mobile', '+6757111111')->first();
    expect($registrant->status)->toBe('booked')
        ->and(Appointment::where('registrant_id', $registrant->id)->count())->toBe(1);
});

test('wizard rejects bad otp and bad captcha', function () {
    $this->get('/prereg/captcha')->assertOk();
    $this->post(route('prereg.mobile'), ['mobile' => '+6757222222', 'captcha' => 'WRONG'])
        ->assertSessionHasErrors('captcha');

    $this->post(route('prereg.mobile'), ['mobile' => '+6757222222', 'captcha' => session('captcha')])
        ->assertRedirect();
    $this->post(route('prereg.otp.verify'), ['otp' => '000000'])
        ->assertSessionHasErrors('otp');
});

test('track lookup finds booking by qr token', function () {
    $this->seed(IdentriqSeeder::class);
    $token = Appointment::first()->qr_token;

    $this->post(route('track.lookup'), ['qr_token' => $token])->assertOk();
    $this->get(route('track.lookup', ['qr_token' => $token]))->assertOk();
    $this->get(route('track.lookup'))->assertRedirect(route('track'));
    $this->post(route('track.lookup'), ['qr_token' => 'nope'])->assertNotFound();
});

test('demographics accepts full personal information fields from design spec', function () {
    $registrant = Registrant::create([
        'language' => 'en',
        'mobile' => '+6757999999',
        'status' => 'consented',
    ]);
    session(['prereg_id' => $registrant->id]);

    $this->post(route('prereg.demographics'), [
        'given_name' => 'John',
        'family_name' => 'Amini',
        'middle_name' => 'Kila',
        'other_names' => 'Johnny',
        'dob' => '1992-05-15',
        'gender' => 'male',
        'nationality' => 'Papua New Guinean',
        'marital_status' => 'Married',
        'mobile' => '+67571234567',
        'email' => 'john.amini@example.com',
        'province' => 'National Capital District',
        'district' => 'Moresby North-East',
        'llg' => 'Urban LLG',
        'ward' => 'Ward 6',
        'residential_address' => 'Section 45, Lot 12, Korobosea',
        'postal_code' => '121',
    ])->assertRedirect(route('prereg', ['step' => 6]));

    $demo = $registrant->fresh()->demographic;
    expect($demo)->not->toBeNull()
        ->and($demo->given_name)->toBe('John')
        ->and($demo->family_name)->toBe('Amini')
        ->and($demo->middle_name)->toBe('Kila')
        ->and($demo->full_name)->toBe('John Kila Amini')
        ->and($demo->marital_status)->toBe('Married')
        ->and($demo->email)->toBe('john.amini@example.com')
        ->and($demo->province)->toBe('National Capital District')
        ->and($demo->district)->toBe('Moresby North-East')
        ->and($demo->llg)->toBe('Urban LLG')
        ->and($demo->ward)->toBe('Ward 6')
        ->and($demo->residential_address)->toBe('Section 45, Lot 12, Korobosea')
        ->and($demo->address_line)->toBe('Section 45, Lot 12, Korobosea')
        ->and($demo->postal_code)->toBe('121');
});

test('supporting documents batch upload persists ref_number for all uploaded files', function () {
    Storage::fake('public');
    $registrant = Registrant::create([
        'language' => 'en',
        'mobile' => '+6757888888',
        'status' => 'demographics',
    ]);
    session(['prereg_id' => $registrant->id]);

    $response = $this->post(route('prereg.documents'), [
        'batch_mode' => '1',
        'primary_doc_type' => 'passport',
        'primary_ref_number' => 'PNG-P-882910',
        'primary_file' => UploadedFile::fake()->create('primary_passport.pdf', 300, 'application/pdf'),
        'secondary_doc_type' => 'employment_id',
        'secondary_ref_number' => 'EMP-2024-991',
        'secondary_file' => UploadedFile::fake()->create('work_id.png', 200, 'image/png'),
        'address_doc_type' => 'utility_bill',
        'address_ref_number' => 'ED-WATER-4592',
        'address_file' => UploadedFile::fake()->create('water_bill.pdf', 150, 'application/pdf'),
    ]);

    $response->assertRedirect(route('prereg', ['step' => 7]));

    $docs = $registrant->fresh()->documents;
    expect($docs->count())->toBe(3);

    $primary = $docs->where('doc_type', 'passport')->first();
    expect($primary)->not->toBeNull()
        ->and($primary->ref_number)->toBe('PNG-P-882910')
        ->and($primary->category)->toBe('identity');

    $secondary = $docs->where('doc_type', 'employment_id')->first();
    expect($secondary)->not->toBeNull()
        ->and($secondary->ref_number)->toBe('EMP-2024-991')
        ->and($secondary->category)->toBe('identity');

    $address = $docs->where('doc_type', 'utility_bill')->first();
    expect($address)->not->toBeNull()
        ->and($address->ref_number)->toBe('ED-WATER-4592')
        ->and($address->category)->toBe('address');

    // Test updating reference number in batch_mode without re-uploading file
    $this->post(route('prereg.documents'), [
        'batch_mode' => '1',
        'primary_doc_type' => 'passport',
        'primary_ref_number' => 'PNG-P-UPDATED-001',
    ])->assertRedirect(route('prereg', ['step' => 7]));

    expect($primary->fresh()->ref_number)->toBe('PNG-P-UPDATED-001');
});

test('slots endpoint returns live database capacity and slot availability', function () {
    $center = RegistrationCenter::create([
        'name' => 'Capacity Center',
        'province' => 'NCD',
        'location' => 'Port Moresby',
        'daily_capacity' => 48, // slotCapacity = max(2, ceil(48/24)) = 2
        'is_active' => true,
    ]);

    $tomorrow = now()->addDay()->toDateString();
    $slotTime = "{$tomorrow} 09:00:00";

    // 0 bookings initially
    $response = $this->getJson("/api/prereg/slots?center_id={$center->id}&date={$tomorrow}&start_date={$tomorrow}&days=7");
    $response->assertOk();
    $data = $response->json();

    expect($data['daily_capacity'])->toBe(48)
        ->and($data['slot_capacity'])->toBe(2);

    $slot9am = collect($data['slots'])->firstWhere('time24', '09:00');
    expect($slot9am['available'])->toBe(2)
        ->and($slot9am['booked'])->toBe(0)
        ->and($slot9am['isFull'])->toBeFalse();

    // Create 1 booking for 09:00
    $reg1 = Registrant::create(['mobile' => '+6757111222', 'status' => 'reviewed', 'language' => 'en']);
    Appointment::create([
        'registrant_id' => $reg1->id,
        'center_id' => $center->id,
        'slot_at' => $slotTime,
        'qr_token' => 'token-12345678901234567890123456789012',
        'status' => 'booked',
    ]);

    $response2 = $this->getJson("/api/prereg/slots?center_id={$center->id}&date={$tomorrow}&start_date={$tomorrow}&days=7");
    $slot9amUpdated = collect($response2->json()['slots'])->firstWhere('time24', '09:00');
    expect($slot9amUpdated['available'])->toBe(1)
        ->and($slot9amUpdated['booked'])->toBe(1)
        ->and($slot9amUpdated['isFull'])->toBeFalse();

    // Create 2nd booking to fill the slot capacity (capacity is 2)
    $reg2 = Registrant::create(['mobile' => '+6757111333', 'status' => 'reviewed', 'language' => 'en']);
    Appointment::create([
        'registrant_id' => $reg2->id,
        'center_id' => $center->id,
        'slot_at' => $slotTime,
        'qr_token' => 'token-22345678901234567890123456789012',
        'status' => 'booked',
    ]);

    $response3 = $this->getJson("/api/prereg/slots?center_id={$center->id}&date={$tomorrow}&start_date={$tomorrow}&days=7");
    $slot9amFull = collect($response3->json()['slots'])->firstWhere('time24', '09:00');
    expect($slot9amFull['available'])->toBe(0)
        ->and($slot9amFull['booked'])->toBe(2)
        ->and($slot9amFull['isFull'])->toBeTrue();

    // Booking a 3rd time for the full slot must be rejected with 422
    $reg3 = Registrant::create(['mobile' => '+6757111444', 'status' => 'reviewed', 'language' => 'en']);
    session(['prereg_id' => $reg3->id]);

    $failResponse = $this->post(route('prereg.book'), [
        'center_id' => $center->id,
        'slot_at' => $slotTime,
    ]);
    $failResponse->assertStatus(422);

    // But booking an open slot (e.g. 09:20) succeeds
    $successResponse = $this->post(route('prereg.book'), [
        'center_id' => $center->id,
        'slot_at' => "{$tomorrow} 09:20:00",
    ]);
    $successResponse->assertOk();
    expect(Appointment::where('registrant_id', $reg3->id)->count())->toBe(1);
});

