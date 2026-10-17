<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\AuthEvent;
use App\Models\Demographic;
use App\Models\Identity;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CitizenSeeder extends Seeder
{
    /**
     * Reset and re-seed only citizen-related domain records.
     * Leaves users and registration centers completely untouched.
     */
    public function run(): void
    {
        // 1. Clear citizen tables in reverse dependency order
        Schema::disableForeignKeyConstraints();

        $citizenTables = [
            'auth_events',
            'identities',
            'appointments',
            'documents',
            'demographics',
            'notifications',
            'registrants',
        ];

        foreach ($citizenTables as $table) {
            DB::table($table)->delete();

            // Reset auto-increment counter on SQLite
            if (DB::getDriverName() === 'sqlite') {
                try {
                    DB::statement("DELETE FROM sqlite_sequence WHERE name = '{$table}'");
                } catch (\Throwable $e) {
                    // Ignore if sqlite_sequence does not exist
                }
            }
        }

        Schema::enableForeignKeyConstraints();

        // 2. Ensure registration centers exist
        $waigani = RegistrationCenter::firstOrCreate(
            ['name' => 'Waigani National Capital District Registration Center'],
            [
                'province' => 'National Capital District',
                'location' => 'Level 1, PNG Statistics Haus, Waigani, NCD',
                'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 5:00 PM', 'lunch' => 'No lunch break', 'mon_fri' => '08:00-17:00'],
                'daily_capacity' => 100,
                'latitude' => -9.4438,
                'longitude' => 147.1803,
            ]
        );

        $boroko = RegistrationCenter::firstOrCreate(
            ['name' => 'Boroko Registration Center'],
            [
                'province' => 'National Capital District',
                'location' => 'Section 487, Boroko, NCD',
                'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 4:30 PM', 'lunch' => 'Lunch: 12:00 PM - 1:00 PM', 'mon_fri' => '08:00-16:30', 'sat' => '09:00-12:00'],
                'daily_capacity' => 60,
                'latitude' => -9.4699,
                'longitude' => 147.1490,
            ]
        );

        $hagen = RegistrationCenter::firstOrCreate(
            ['name' => 'Mt. Hagen Registration Center'],
            [
                'province' => 'Western Highlands',
                'location' => 'Western Highlands Provincial Government Complex, Mt. Hagen',
                'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 4:30 PM', 'lunch' => 'Lunch: 12:00 PM - 1:00 PM', 'mon_fri' => '08:00-16:30'],
                'daily_capacity' => 50,
                'latitude' => -5.8570,
                'longitude' => 144.2180,
            ]
        );

        // 3. Exactly 13 Official Citizens (12 lifecycle citizens + 1 revoked-compromise
        //    demo credential so the verifier story can show INVALID / Revoked out of the box)
        $citizens = [
            [
                'full_name' => 'Mary Kila',
                'given_name' => 'Mary',
                'family_name' => 'Kila',
                'middle_name' => null,
                'dob' => '1990-04-12',
                'gender' => 'female',
                'province' => 'NCD',
                'village' => 'Boroko',
                'residential_address' => 'Section 24, Boroko East, Port Moresby, NCD',
                'mobile' => '+6757000001',
                'stage' => 'approved',
                'id_number' => 'PNG-2026-000001',
                'center' => $boroko,
            ],
            [
                'full_name' => 'John Wama',
                'given_name' => 'John',
                'family_name' => 'Wama',
                'middle_name' => null,
                'dob' => '1985-09-03',
                'gender' => 'male',
                'province' => 'NCD',
                'village' => 'Gerehu',
                'residential_address' => 'Stage 3B, Gerehu, Port Moresby, NCD',
                'mobile' => '+6757000002',
                'stage' => 'validating',
                'center' => $boroko,
            ],
            [
                'full_name' => 'Ruth Aua',
                'given_name' => 'Ruth',
                'family_name' => 'Aua',
                'middle_name' => null,
                'dob' => '1998-01-22',
                'gender' => 'female',
                'province' => 'Western Highlands',
                'village' => 'Mt Hagen',
                'residential_address' => 'Kagamuga Settlement, Mt Hagen, Western Highlands',
                'mobile' => '+6757000003',
                'stage' => 'failed',
                'center' => $hagen,
            ],
            [
                'full_name' => 'KUMAL, JOHN A.',
                'given_name' => 'John',
                'family_name' => 'Kumal',
                'middle_name' => 'A.',
                'dob' => '1988-04-14',
                'gender' => 'male',
                'province' => 'Central Province',
                'village' => 'Kairuku',
                'residential_address' => 'Section 14, Allotment 8, Kairuku Station, Central Province',
                'mobile' => '+6757000004',
                'stage' => 'delivered',
                'id_number' => '785-3049-921-A',
                'center' => $waigani,
            ],
            [
                'full_name' => 'Anna Marai',
                'given_name' => 'Anna',
                'family_name' => 'Marai',
                'middle_name' => null,
                'dob' => '2001-11-15',
                'gender' => 'female',
                'province' => 'NCD',
                'village' => 'Hohola',
                'residential_address' => 'Section 12, Hohola 2, NCD',
                'mobile' => '+6757000005',
                'stage' => 'booked',
                'center' => $boroko,
            ],
            [
                'full_name' => 'David Kuri',
                'given_name' => 'David',
                'family_name' => 'Kuri',
                'middle_name' => null,
                'dob' => '1993-02-08',
                'gender' => 'male',
                'province' => 'NCD',
                'village' => 'Tokarara',
                'residential_address' => 'Kouba Street, Tokarara, Port Moresby',
                'mobile' => '+6757000006',
                'stage' => 'booked',
                'center' => $boroko,
            ],
            [
                'full_name' => 'Esther Waeda',
                'given_name' => 'Esther',
                'family_name' => 'Waeda',
                'middle_name' => null,
                'dob' => '1989-07-19',
                'gender' => 'female',
                'province' => 'Western Highlands',
                'village' => 'Tambul',
                'residential_address' => 'Tambul Station, Western Highlands Province',
                'mobile' => '+6757000007',
                'stage' => 'checked-in',
                'center' => $hagen,
            ],
            [
                'full_name' => 'Samuel Gima',
                'given_name' => 'Samuel',
                'family_name' => 'Gima',
                'middle_name' => null,
                'dob' => '1995-12-01',
                'gender' => 'male',
                'province' => 'NCD',
                'village' => 'Waigani',
                'residential_address' => 'Morata Road, Waigani North, NCD',
                'mobile' => '+6757000008',
                'stage' => 'booked',
                'center' => $waigani,
            ],
            [
                'full_name' => 'Grace Pidi',
                'given_name' => 'Grace',
                'family_name' => 'Pidi',
                'middle_name' => null,
                'dob' => '1982-05-27',
                'gender' => 'female',
                'province' => 'Western Highlands',
                'village' => 'Dei',
                'residential_address' => 'Dei Council Chamber Road, Western Highlands',
                'mobile' => '+6757000009',
                'stage' => 'booked',
                'center' => $hagen,
            ],
            [
                'full_name' => 'Paul Tape',
                'given_name' => 'Paul',
                'family_name' => 'Tape',
                'middle_name' => null,
                'dob' => '1991-08-14',
                'gender' => 'male',
                'province' => 'NCD',
                'village' => 'Morata',
                'residential_address' => 'Block 4, Morata 1, Port Moresby, NCD',
                'mobile' => '+6757000010',
                'stage' => 'checked-in',
                'center' => $boroko,
            ],
            [
                'full_name' => 'Miriam Soso',
                'given_name' => 'Miriam',
                'family_name' => 'Soso',
                'middle_name' => null,
                'dob' => '1999-03-09',
                'gender' => 'female',
                'province' => 'NCD',
                'village' => '9-Mile',
                'residential_address' => 'Moitaka Compound, 9-Mile, Port Moresby',
                'mobile' => '+6757000011',
                'stage' => 'booked',
                'center' => $boroko,
            ],
            [
                'full_name' => 'James Heni',
                'given_name' => 'James',
                'family_name' => 'Heni',
                'middle_name' => null,
                'dob' => '1987-10-25',
                'gender' => 'male',
                'province' => 'Western Highlands',
                'village' => 'Mul',
                'residential_address' => 'Mul-Baiyer District Administration, WHP',
                'mobile' => '+6757000012',
                'stage' => 'booked',
                'center' => $hagen,
            ],
            [
                'full_name' => 'Thomas Bani',
                'given_name' => 'Thomas',
                'family_name' => 'Bani',
                'middle_name' => null,
                'dob' => '1979-06-30',
                'gender' => 'male',
                'province' => 'NCD',
                'village' => 'Gerehu',
                'residential_address' => 'Stage 2, Gerehu, Port Moresby, NCD',
                'mobile' => '+6757000013',
                'stage' => 'approved',
                'id_number' => 'PNG-2026-000013',
                'center' => $boroko,
                'revoked' => true,
            ],
        ];

        // 4. Create all citizen entities and relational graphs
        foreach ($citizens as $i => $item) {
            $stage = $item['stage'];
            $center = $item['center'];

            $registrant = Registrant::create([
                'language' => 'en',
                'mobile' => $item['mobile'],
                'mobile_verified_at' => now(),
                'consent_version' => 'v1',
                'consent_accepted_at' => now(),
                'status' => $stage,
            ]);

            Demographic::create([
                'registrant_id' => $registrant->id,
                'given_name' => $item['given_name'],
                'family_name' => $item['family_name'],
                'middle_name' => $item['middle_name'],
                'full_name' => $item['full_name'],
                'dob' => $item['dob'],
                'gender' => $item['gender'],
                'nationality' => 'Papua New Guinea',
                'province' => $item['province'],
                'village' => $item['village'],
                'residential_address' => $item['residential_address'],
                'mobile' => $item['mobile'],
                'email' => strtolower($item['given_name']).'.'.strtolower($item['family_name']).'@example.pg',
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

            $identity = match ($stage) {
                'validating' => Identity::create([
                    'registrant_id' => $registrant->id,
                    'status' => 'pending',
                ]),
                'approved' => Identity::create([
                    'registrant_id' => $registrant->id,
                    'biosure_id_number' => $item['id_number'] ?? ('PNG-2026-'.str_pad((string) $registrant->id, 6, '0', STR_PAD_LEFT)),
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
                    'biosure_id_number' => $item['id_number'] ?? ('PNG-2026-'.str_pad((string) $registrant->id, 6, '0', STR_PAD_LEFT)),
                    'status' => 'approved',
                    'card_personalized_at' => now()->subDays(10),
                    'delivered_at' => now()->subDays(5),
                    'delivered_channel' => $center->name,
                ]), function (Identity $identity) {
                    AuthEvent::create([
                        'identity_id' => $identity->id,
                        'mode' => 'offline_qr',
                        'result' => 'valid',
                        'verifier_ref' => 'demo-bsp-bank-teller-01',
                    ]);
                }),
                default => null,
            };

            if ($identity && ($item['revoked'] ?? false)) {
                // Pre-made revocation event (§5.3): scanned before the demo, the
                // credential shows INVALID / Revoked on a freshly synced device.
                $identity->update(['revoked_at' => now()->subDays(2)]);

                $registrant->notifications()->create([
                    'channel' => 'sms',
                    'title' => 'Credential revoked',
                    'body' => 'Your IDENTRIQ credential was revoked following a reported compromise. Contact a registration center.',
                    'sent_at' => now(),
                ]);
            }

            $registrant->notifications()->create([
                'channel' => 'sms',
                'title' => 'Registration update',
                'body' => "Your IDENTRIQ registration is now: {$stage}.",
                'sent_at' => now(),
            ]);
        }
    }
}
