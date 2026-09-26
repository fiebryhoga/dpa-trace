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
        Schema::create('dpa_compensation_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dpa_compensation_id')->constrained('dpa_compensations')->onDelete('cascade');
            $table->foreignId('exercise_id')->constrained('exercises')->onDelete('cascade');
            $table->enum('phase', ['Inhibit', 'Lengthen', 'Activate', 'Integrate']);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dpa_compensation_exercises');
    }
};
