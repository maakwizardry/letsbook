<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('booking_series', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained('providers')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('home_type_id')->constrained('home_types')->cascadeOnDelete();
            $table->enum('frequency', ['weekly', 'biweekly', 'monthly']);
            $table->json('days_of_week')->nullable();
            $table->dateTime('starts_at');
            $table->date('ends_on')->nullable();
            $table->unsignedInteger('max_occurrences')->nullable();
            $table->unsignedInteger('occurrences_created')->default(0);
            $table->date('generated_through')->nullable();
            $table->enum('payment_method', ['cash', 'etransfer'])->default('cash');
            $table->unsignedInteger('reminder_minutes_before')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_series');
    }
};
