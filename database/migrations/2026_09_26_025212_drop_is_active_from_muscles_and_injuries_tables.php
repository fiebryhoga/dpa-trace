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
            if (Schema::hasColumn('muscles', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });

        Schema::table('injuries', function (Blueprint $table) {
            if (Schema::hasColumn('injuries', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('muscles', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
        });

        Schema::table('injuries', function (Blueprint $table) {
            $table->boolean('is_active')->default(true);
        });
    }
};
