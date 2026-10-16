<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_centers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('province');
            $table->string('location');
            $table->json('opening_hours')->nullable();
            $table->unsignedInteger('daily_capacity')->default(50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_centers');
    }
};
