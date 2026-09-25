<?php

use App\Http\Controllers\AthleteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DpaAssessmentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Athlete Management
    Route::resource('athletes', AthleteController::class);

    // Dynamic Posture Assessment (DPA)
    Route::resource('dpa', DpaAssessmentController::class)->except(['edit', 'update']);

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
