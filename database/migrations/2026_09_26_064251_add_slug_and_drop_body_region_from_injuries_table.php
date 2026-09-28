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
        Schema::table('injuries', function (Blueprint $table) {
            if (!Schema::hasColumn('injuries', 'slug')) {
                $table->string('slug')->nullable()->after('name');
            }
            if (Schema::hasColumn('injuries', 'body_region')) {
                $table->dropColumn('body_region');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('injuries', function (Blueprint $table) {
            $table->string('body_region')->nullable();
            $table->dropColumn('slug');
        });
    }
};
