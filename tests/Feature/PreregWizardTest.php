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

