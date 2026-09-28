<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add slug to dpa_compensations
        if (!Schema::hasColumn('dpa_compensations', 'slug')) {
            Schema::table('dpa_compensations', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('name');
            });

            // Populate existing compensations
            $compensations = DB::table('dpa_compensations')->get();
            foreach ($compensations as $comp) {
                $baseSlug = Str::slug($comp->name) ?: 'comp-' . $comp->id;
                $slug = $baseSlug;
                $count = 1;
                while (DB::table('dpa_compensations')->where('slug', $slug)->where('id', '!=', $comp->id)->exists()) {
                    $slug = "{$baseSlug}-{$count}";
                    $count++;
                }
                DB::table('dpa_compensations')->where('id', $comp->id)->update(['slug' => $slug]);
            }

            Schema::table('dpa_compensations', function (Blueprint $table) {
                $table->unique('slug');
            });
        }

        // 2. Add slug to exercises
        if (!Schema::hasColumn('exercises', 'slug')) {
            Schema::table('exercises', function (Blueprint $table) {
                $table->string('slug')->nullable()->after('name');
            });

            // Populate existing exercises
            $exercises = DB::table('exercises')->get();
            foreach ($exercises as $ex) {
                $baseSlug = Str::slug($ex->name) ?: 'exercise-' . $ex->id;
                $slug = $baseSlug;
                $count = 1;
                while (DB::table('exercises')->where('slug', $slug)->where('id', '!=', $ex->id)->exists()) {
                    $slug = "{$baseSlug}-{$count}";
                    $count++;
                }
                DB::table('exercises')->where('id', $ex->id)->update(['slug' => $slug]);
            }

            Schema::table('exercises', function (Blueprint $table) {
                $table->unique('slug');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('dpa_compensations', 'slug')) {
            Schema::table('dpa_compensations', function (Blueprint $table) {
                $table->dropColumn('slug');
            });
        }

        if (Schema::hasColumn('exercises', 'slug')) {
            Schema::table('exercises', function (Blueprint $table) {
                $table->dropColumn('slug');
            });
        }
    }
};
