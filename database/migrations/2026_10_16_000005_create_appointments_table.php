<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registrant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('center_id')->constrained('registration_centers');
            $table->dateTime('slot_at');
            $table->string('qr_token')->unique();
            $table->string('status')->default('booked');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
