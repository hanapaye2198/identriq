<?php

namespace Database\Seeders;

use App\Models\RegistrationCenter;
use Illuminate\Database\Seeder;

class IdentriqSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure all 5 provincial registration centers exist (idempotent)
        RegistrationCenter::firstOrCreate(
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

        RegistrationCenter::firstOrCreate(
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

        RegistrationCenter::firstOrCreate(
            ['name' => 'Lae Registration Center'],
            [
                'province' => 'Morobe',
                'location' => 'PNG Ports Building, Malahang Road, Lae, Morobe Province',
                'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 4:30 PM', 'lunch' => 'Lunch: 12:00 PM - 1:00 PM', 'mon_fri' => '08:00-16:30'],
                'daily_capacity' => 80,
                'latitude' => -6.7244,
                'longitude' => 147.0000,
            ]
        );

        RegistrationCenter::firstOrCreate(
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

        RegistrationCenter::firstOrCreate(
            ['name' => 'Kimbe Registration Center'],
            [
                'province' => 'West New Britain',
                'location' => 'West New Britain Provincial Administration, Kimbe, WNB',
                'opening_hours' => ['schedule' => 'Mon - Fri: 8:00 AM - 4:30 PM', 'lunch' => 'Lunch: 12:00 PM - 1:00 PM', 'mon_fri' => '08:00-16:30'],
                'daily_capacity' => 40,
                'latitude' => -5.5500,
                'longitude' => 150.1400,
            ]
        );

        // 2. Delegate to CitizenSeeder to seed all citizen entities
        $this->call(CitizenSeeder::class);
    }
}
