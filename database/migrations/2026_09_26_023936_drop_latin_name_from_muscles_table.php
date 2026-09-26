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
        Schema::table('muscles', function (Blueprint $table) {
            if (Schema::hasColumn('muscles', 'latin_name')) {
                $table->dropColumn('latin_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('muscles', function (Blueprint $table) {
            $table->string('latin_name')->nullable()->after('name');
        });
    }
};
