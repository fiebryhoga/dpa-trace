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
        Schema::create('muscles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->nullable(); // slug mapping to react-muscle-highlighter (e.g. calves, hamstring)
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('injuries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('body_region')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('injuries');
        Schema::dropIfExists('muscles');
    }
};
