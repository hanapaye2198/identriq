<?php

use Database\Seeders\CitizenSeeder;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('identriq:reset-citizens', function () {
    $this->info('Resetting citizen database records to standard demo seeds...');
    $this->call(CitizenSeeder::class);
    $this->info('✓ Citizen database seeds reset successfully. Users and registration centers preserved.');
})->purpose('Reset and re-seed only the citizen records (preserving users and centers)');

Artisan::command('identriq:clear-citizens', function () {
    $this->info('Clearing all citizen and registrant data from the database...');

    Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();

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
        Illuminate\Support\Facades\DB::table($table)->delete();

        if (Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
            try {
                Illuminate\Support\Facades\DB::statement("DELETE FROM sqlite_sequence WHERE name = '{$table}'");
            } catch (\Throwable $e) {
                // Ignore if sqlite_sequence does not exist
            }
        }
    }

    Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

    $this->info('✓ All citizen records, appointments, and identities cleared successfully!');
    $this->comment('Your database is now completely clean. You can pre-register your own citizens at /prereg.');
})->purpose('Wipe all citizen, appointment, and identity data for a clean webapp (preserves users and centers)');

