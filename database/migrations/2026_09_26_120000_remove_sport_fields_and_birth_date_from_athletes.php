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
        Schema::table('athletes', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('athletes', 'sport_category')) {
                $columnsToDrop[] = 'sport_category';
            }
            if (Schema::hasColumn('athletes', 'position_specialty')) {
                $columnsToDrop[] = 'position_specialty';
            }
            if (Schema::hasColumn('athletes', 'club_institution')) {
                $columnsToDrop[] = 'club_institution';
            }
            if (Schema::hasColumn('athletes', 'birth_date')) {
                $columnsToDrop[] = 'birth_date';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('athletes', function (Blueprint $table) {
            $table->string('sport_category')->nullable()->after('weight_kg');
            $table->string('position_specialty')->nullable()->after('sport_category');
            $table->string('club_institution')->nullable()->after('position_specialty');
            $table->date('birth_date')->nullable()->after('gender');
        });
    }
};
