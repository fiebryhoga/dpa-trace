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
            if (Schema::hasColumn('muscles', 'body_region')) {
                $table->dropColumn('body_region');
            }
            if (Schema::hasColumn('muscles', 'view_side')) {
                $table->dropColumn('view_side');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('muscles', function (Blueprint $table) {
            $table->string('body_region')->default('Foot & Ankle');
            $table->string('view_side')->default('Both');
        });
    }
};
