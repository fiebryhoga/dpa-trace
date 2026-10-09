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
        Schema::create('training_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('athlete_id')->nullable()->constrained('athletes')->nullOnDelete();
            $table->foreignId('dpa_assessment_id')->nullable()->constrained('dpa_assessments')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('active'); // draft, active, completed
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedTinyInteger('frequency_per_week')->default(3);
            $table->unsignedTinyInteger('duration_weeks')->default(4);
            $table->text('description')->nullable();
            $table->json('target_compensations')->nullable();
            $table->json('target_muscles_overactive')->nullable();
            $table->json('target_muscles_underactive')->nullable();
            $table->timestamps();
        });

        Schema::create('training_program_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_program_id')->constrained('training_programs')->cascadeOnDelete();
            $table->foreignId('exercise_id')->nullable()->constrained('exercises')->nullOnDelete();
            $table->string('phase'); // inhibit, lengthen, activate, integrate
            $table->string('exercise_name');
            $table->string('target_muscle')->nullable();
            $table->unsignedTinyInteger('sets')->default(2);
            $table->string('reps')->nullable(); // e.g. "10-15 reps" or "12"
            $table->unsignedSmallInteger('duration_seconds')->nullable(); // e.g. 30, 60
            $table->unsignedSmallInteger('hold_seconds')->nullable(); // e.g. 20-30s static hold
            $table->string('tempo')->nullable(); // e.g. "4-2-1", "Slow & Controlled"
            $table->unsignedSmallInteger('rest_seconds')->nullable();
            $table->string('frequency')->nullable(); // e.g. "Setiap Hari", "1-2x / hari"
            $table->string('intensity')->nullable(); // e.g. "RPE 6-7", "Static Comfort"
            $table->text('coaching_cues')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_program_items');
        Schema::dropIfExists('training_programs');
    }
};
