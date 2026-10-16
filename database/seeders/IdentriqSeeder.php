<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\AuthEvent;
use App\Models\Demographic;
use App\Models\Identity;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class IdentriqSeeder extends Seeder
{
    public function run(): void
    {
        $waigani = RegistrationCenter::create([
            'name' => 'Waigani National Capital District Registration Center',
            'province' => 'National Capital District',
            'location' => 'Level 1, PNG Statistics Haus, Waigani, NCD',
            'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 5:00 PM', 'lunch' => 'No lunch break', 'mon_fri' => '08:00-17:00'],
            'daily_capacity' => 100,
            'latitude' => -9.4438,
            'longitude' => 147.1803,
        ]);

        $moresby = RegistrationCenter::create([
            'name' => 'Boroko Registration Center',
            'province' => 'National Capital District',
            'location' => 'Section 487, Boroko, NCD',
            'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 4:30 PM', 'lunch' => 'Lunch: 12:00 PM - 1:00 PM', 'mon_fri' => '08:00-16:30', 'sat' => '09:00-12:00'],
            'daily_capacity' => 60,
            'latitude' => -9.4699,
            'longitude' => 147.1490,
        ]);

        $lae = RegistrationCenter::create([
            'name' => 'Lae Registration Center',
            'province' => 'Morobe',
            'location' => 'PNG Ports Building, Malahang Road, Lae, Morobe Province',
            'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 4:30 PM', 'lunch' => 'Lunch: 12:00 PM - 1:00 PM', 'mon_fri' => '08:00-16:30'],
            'daily_capacity' => 80,
            'latitude' => -6.7244,
            'longitude' => 147.0000,
        ]);

        $hagen = RegistrationCenter::create([
            'name' => 'Mt. Hagen Registration Center',
            'province' => 'Western Highlands',
            'location' => 'Western Highlands Provincial Government Complex, Mt. Hagen',
            'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 4:30 PM', 'lunch' => 'Lunch: 12:00 PM - 1:00 PM', 'mon_fri' => '08:00-16:30'],
            'daily_capacity' => 50,
            'latitude' => -5.8570,
            'longitude' => 144.2180,
        ]);

        $kimbe = RegistrationCenter::create([
            'name' => 'Kimbe Registration Center',
            'province' => 'West New Britain',
            'location' => 'West New Britain Provincial Administration, Kimbe, WNB',
            'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 4:30 PM', 'lunch' => 'Lunch: 12:00 PM - 1:00 PM', 'mon_fri' => '08:00-16:30'],
            'daily_capacity' => 40,
            'latitude' => -5.5500,
            'longitude' => 150.1400,
        ]);

        $people = [
            ['Mary Kila', '1990-04-12', 'female', 'NCD', 'Boroko', '+6757000001', 'approved'],
            ['John Wama', '1985-09-03', 'male', 'NCD', 'Gerehu', '+6757000002', 'validating'],
            ['Ruth Aua', '1998-01-22', 'female', 'Western Highlands', 'Mt Hagen', '+6757000003', 'failed'],
            ['Peter Noki', '1976-06-30', 'male', 'Western Highlands', 'Banz', '+6757000004', 'delivered'],
            ['Anna Marai', '2001-11-15', 'female', 'NCD', 'Hohola', '+6757000005', 'booked'],
            ['David Kuri', '1993-02-08', 'male', 'NCD', 'Tokarara', '+6757000006', 'booked'],
            ['Esther Waeda', '1989-07-19', 'female', 'Western Highlands', 'Tambul', '+6757000007', 'checked-in'],
            ['Samuel Gima', '1995-12-01', 'male', 'NCD', 'Waigani', '+6757000008', 'booked'],
            ['Grace Pidi', '1982-05-27', 'female', 'Western Highlands', 'Dei', '+6757000009', 'booked'],
            ['Paul Tape', '1991-08-14', 'male', 'NCD', 'Morata', '+6757000010', 'checked-in'],
            ['Miriam Soso', '1999-03-09', 'female', 'NCD', '9-Mile', '+6757000011', 'booked'],
            ['James Heni', '1987-10-25', 'male', 'Western Highlands', 'Mul', '+6757000012', 'booked'],
        ];

        foreach ($people as $i => [$name, $dob, $gender, $province, $area, $mobile, $stage]) {
            $center = $i % 3 === 0 ? $hagen : $moresby;

            $registrant = Registrant::create([
                'language' => 'en',
                'mobile' => $mobile,
                'mobile_verified_at' => now(),
                'consent_version' => 'v1',
                'consent_accepted_at' => now(),
                'status' => $stage,
            ]);

            Demographic::create([
                'registrant_id' => $registrant->id,
                'full_name' => $name,
                'dob' => $dob,
                'gender' => $gender,
                'nationality' => 'Papua New Guinean',
                'province' => $province,
                'village' => $area,
            ]);

            $registrant->documents()->createMany([
                ['category' => 'identity', 'doc_type' => 'birth_certificate', 'path' => "demo/{$registrant->id}-birth.pdf", 'verified_status' => 'accepted'],
                ['category' => 'address', 'doc_type' => 'ward_councillor_letter', 'path' => "demo/{$registrant->id}-address.pdf", 'verified_status' => 'pending'],
            ]);

            Appointment::create([
                'registrant_id' => $registrant->id,
                'center_id' => $center->id,
                'slot_at' => now()->addDays($i % 4)->setTime(9 + ($i % 6), 0),
                'qr_token' => Str::random(32),
                'status' => in_array($stage, ['checked-in', 'validating', 'approved', 'failed', 'delivered'], true) ? 'completed' : 'booked',
            ]);

            match ($stage) {
                'validating' => Identity::create(['registrant_id' => $registrant->id, 'status' => 'pending']),
                'approved' => Identity::create([
                    'registrant_id' => $registrant->id,
                    'biosure_id_number' => 'PNG-2026-'.str_pad((string) $registrant->id, 6, '0', STR_PAD_LEFT),
                    'status' => 'approved',
                    'card_personalized_at' => now(),
                ]),
                'failed' => Identity::create([
                    'registrant_id' => $registrant->id,
                    'status' => 'failed',
                    'failure_reason' => 'Duplicate candidate match requires adjudication.',
                ]),
                'delivered' => tap(Identity::create([
                    'registrant_id' => $registrant->id,
                    'biosure_id_number' => 'PNG-2026-'.str_pad((string) $registrant->id, 6, '0', STR_PAD_LEFT),
                    'status' => 'approved',
                    'card_personalized_at' => now()->subDays(5),
                    'delivered_at' => now()->subDays(2),
                    'delivered_channel' => 'Boroko counter pickup',
                ]), function (Identity $identity) {
                    AuthEvent::create([
                        'identity_id' => $identity->id,
                        'mode' => 'offline_qr',
                        'result' => 'valid',
                        'verifier_ref' => 'demo-bank-teller-01',
                    ]);
                }),
                default => null,
            };

            $registrant->notifications()->create([
                'channel' => 'sms',
                'title' => 'Registration update',
                'body' => "Your IDENTRIQ registration is now: {$stage}.",
                'sent_at' => now(),
            ]);
        }
    }
}
