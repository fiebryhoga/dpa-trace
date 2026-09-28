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
        Schema::create('athletes', function (Blueprint $table) {
            $table->id();
            $table->string('athlete_code')->unique();
            $table->string('full_name');
            $table->enum('gender', ['L', 'P']);
            $table->date('birth_date')->nullable();
            $table->integer('age')->nullable();
            $table->float('height_cm')->nullable();
            $table->float('weight_kg')->nullable();
            $table->string('sport_category'); // Bola Voli, Futsal, Atletik, Basket, dll
            $table->string('position_specialty')->nullable(); // Spiker, Setter, Striker, dll
            $table->string('club_institution')->nullable();
            $table->enum('dominant_side', ['R', 'L', 'Bilateral'])->default('R');
            $table->text('injury_history')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('photo_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('athletes');
    }
};
