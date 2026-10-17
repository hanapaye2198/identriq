<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consent_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('identity_id')->constrained()->cascadeOnDelete();
            $table->string('verifier_name');
            $table->string('purpose');
            $table->json('fields')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consent_requests');
    }
};
