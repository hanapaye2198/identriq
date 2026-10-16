<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demographics', function (Blueprint $table) {
            $table->string('given_name')->nullable()->after('registrant_id');
            $table->string('family_name')->nullable()->after('given_name');
            $table->string('middle_name')->nullable()->after('family_name');
            $table->string('other_names')->nullable()->after('middle_name');
            $table->string('marital_status')->nullable()->after('nationality');
            $table->string('email')->nullable()->after('marital_status');
            $table->string('mobile')->nullable()->after('email');
            $table->string('llg')->nullable()->after('district');
            $table->string('residential_address')->nullable()->after('ward');
            $table->string('postal_code')->nullable()->after('residential_address');
        });
    }

    public function down(): void
    {
        Schema::table('demographics', function (Blueprint $table) {
            $table->dropColumn([
                'given_name',
                'family_name',
                'middle_name',
                'other_names',
                'marital_status',
                'email',
                'mobile',
                'llg',
                'residential_address',
                'postal_code',
            ]);
        });
    }
};
