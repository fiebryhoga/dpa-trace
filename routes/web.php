<?php

use App\Http\Controllers\AthleteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DpaAssessmentController;
use App\Http\Controllers\DpaCompensationController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\InjuryController;
use App\Http\Controllers\MuscleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Athlete Management & Gallery
    Route::resource('athletes', AthleteController::class);
    Route::post('/athletes/{athlete}/gallery', [AthleteController::class, 'storeGallery'])->name('athletes.gallery.store');
    Route::post('/athletes/gallery/{gallery}', [AthleteController::class, 'updateGallery'])->name('athletes.gallery.update');
    Route::delete('/athletes/gallery/{gallery}', [AthleteController::class, 'destroyGallery'])->name('athletes.gallery.destroy');

    // Dynamic Posture Assessment (DPA)
    Route::get('/dpa', [DpaAssessmentController::class, 'index'])->name('dpa.index');
    Route::get('/dpa/athletes/{athlete}', [DpaAssessmentController::class, 'showAthlete'])->name('dpa.athletes.show');
    Route::post('/dpa/athletes/{athlete}', [DpaAssessmentController::class, 'store'])->name('dpa.store');
    Route::put('/dpa/assessments/{dpaAssessment}', [DpaAssessmentController::class, 'update'])->name('dpa.update');
    Route::delete('/dpa/assessments/{dpaAssessment}', [DpaAssessmentController::class, 'destroy'])->name('dpa.destroy');
    Route::post('/dpa/athletes/{athlete}/export-pdf', [DpaAssessmentController::class, 'exportPdf'])->name('dpa.export-pdf');

    // Master Data & Konfigurasi (DPA Compensations, Exercise Library, Muscles, Injuries, Admin Users)
    Route::resource('dpa-compensations', DpaCompensationController::class);
    Route::resource('exercises', ExerciseController::class);
    Route::resource('muscles', MuscleController::class);
    Route::resource('injuries', InjuryController::class);
    Route::resource('users', UserController::class);

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
