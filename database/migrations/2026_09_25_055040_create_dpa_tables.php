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
        Schema::create('dpa_compensations', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // Anterior View, Lateral View, Posterior View, Single Leg
            $table->string('name');
            $table->string('checkpoint')->nullable(); // Foot/Ankle, Knee, LPHC, Shoulders, Head/Upper Body
            $table->string('image_path')->nullable();
            
            // Biomechanics Muscle & Injury Mapping (OTS Standard)
            $table->text('overactive_muscles')->nullable();
            $table->text('underactive_muscles')->nullable();
            $table->text('possible_injuries')->nullable();
            
            // 4-Phase Corrective Exercise Protocol (OTS / NASM standard)
            $table->text('exercises_smr')->nullable();
            $table->string('image_smr')->nullable();
            $table->text('exercises_stretching')->nullable();
            $table->string('image_stretching')->nullable();
            $table->text('exercises_isometrics')->nullable();
            $table->string('image_isometrics')->nullable();
            $table->text('exercises_integrated')->nullable();
            $table->string('image_integrated')->nullable();
            
            $table->timestamps();
        });

        Schema::create('dpa_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('athlete_id')->constrained('athletes')->onDelete('cascade');
            $table->foreignId('assessor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('assessment_date');
            $table->float('current_height_cm')->nullable();
            $table->float('current_weight_kg')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('dpa_assessment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dpa_assessment_id')->constrained('dpa_assessments')->onDelete('cascade');
            $table->foreignId('dpa_compensation_id')->constrained('dpa_compensations')->onDelete('cascade');
            $table->enum('severity', ['Mild', 'Moderate', 'Severe'])->default('Moderate');
            $table->enum('side', ['Left', 'Right', 'Bilateral'])->default('Bilateral');
            $table->text('specific_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dpa_assessment_details');
        Schema::dropIfExists('dpa_assessments');
        Schema::dropIfExists('dpa_compensations');
    }
};
