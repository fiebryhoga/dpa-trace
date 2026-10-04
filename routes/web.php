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

    // Postural & Movement Assessment (PMA)
    Route::get('/dpa', [DpaAssessmentController::class, 'index'])->name('dpa.index');
    Route::get('/dpa/athletes/{athlete}', [DpaAssessmentController::class, 'showAthlete'])->name('dpa.athletes.show');
    Route::post('/dpa/athletes/{athlete}', [DpaAssessmentController::class, 'store'])->name('dpa.store');
    Route::put('/dpa/assessments/{dpaAssessment}', [DpaAssessmentController::class, 'update'])->name('dpa.update');
    Route::delete('/dpa/assessments/{dpaAssessment}', [DpaAssessmentController::class, 'destroy'])->name('dpa.destroy');
    Route::post('/dpa/analyze-posture', [\App\Http\Controllers\DpaAiAnalysisController::class, 'analyze'])->name('dpa.analyze-posture');

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

    // Error Page Preview / Testing Route
    Route::get('/error/{status?}', function ($status = 404) {
        $allowed = [400, 401, 403, 404, 405, 419, 429, 500, 502, 503, 504];
        $code = in_array((int)$status, $allowed) ? (int)$status : 404;
        return \Inertia\Inertia::render('Error', [
            'status' => $code,
        ]);
    })->name('error.preview');
});

require __DIR__.'/auth.php';
