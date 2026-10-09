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
        Schema::table('training_programs', function (Blueprint $table) {
            $table->json('scheduled_days')->nullable()->after('duration_weeks');
            $table->json('schedule_dates')->nullable()->after('scheduled_days');
            $table->json('completed_dates')->nullable()->after('schedule_dates');
            $table->json('session_notes')->nullable()->after('completed_dates');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('training_programs', function (Blueprint $table) {
            $table->dropColumn(['scheduled_days', 'schedule_dates', 'completed_dates', 'session_notes']);
        });
    }
};
