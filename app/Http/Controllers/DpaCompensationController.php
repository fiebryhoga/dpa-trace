<?php

namespace App\Http\Controllers;

use App\Models\DpaCompensation;
use App\Models\Exercise;
use App\Models\Injury;
use App\Models\Muscle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DpaCompensationController extends Controller
{
    /**
     * Display a listing of compensations.
     */
    public function index()
    {
        $compensations = DpaCompensation::with('exercises')
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        $exercises = Exercise::where('is_active', true)
            ->orderBy('name')
            ->get();

        $muscles = Muscle::orderBy('name')->get();

        $injuries = Injury::orderBy('name')->get();

        return Inertia::render('Dpa/Compensations/Index', [
            'compensations' => $compensations,
            'allExercises' => $exercises,
            'allMuscles' => $muscles,
            'allInjuries' => $injuries,
        ]);
    }

    /**
     * Show the form for creating a new compensation.
     */
    public function create()
    {
        $exercises = Exercise::where('is_active', true)
            ->orderBy('name')
            ->get();

        $muscles = Muscle::orderBy('name')->get();

        $injuries = Injury::orderBy('name')->get();

        return Inertia::render('Dpa/Compensations/Form', [
            'compensation' => null,
            'allExercises' => $exercises,
            'allMuscles' => $muscles,
            'allInjuries' => $injuries,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created compensation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:Posterior View,Lateral View,Anterior View,Single Leg',
            'name' => 'required|string|max:255',
            'checkpoint' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:5120',
            'overactive_muscles' => 'nullable|string',
            'underactive_muscles' => 'nullable|string',
            'possible_injuries' => 'nullable|string',
            'exercise_ids_inhibit' => 'nullable|array',
            'exercise_ids_inhibit.*' => 'integer|exists:exercises,id',
            'exercise_ids_lengthen' => 'nullable|array',
            'exercise_ids_lengthen.*' => 'integer|exists:exercises,id',
            'exercise_ids_activate' => 'nullable|array',
            'exercise_ids_activate.*' => 'integer|exists:exercises,id',
            'exercise_ids_integrate' => 'nullable|array',
            'exercise_ids_integrate.*' => 'integer|exists:exercises,id',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('dpa_images', 'public');
        }

        // Build exercise names for legacy text fields
        $inhibitIds = $request->input('exercise_ids_inhibit', []);
        $lengthenIds = $request->input('exercise_ids_lengthen', []);
        $activateIds = $request->input('exercise_ids_activate', []);
        $integrateIds = $request->input('exercise_ids_integrate', []);

        $allIds = array_unique(array_merge($inhibitIds, $lengthenIds, $activateIds, $integrateIds));
        $exerciseMap = Exercise::whereIn('id', $allIds)->pluck('name', 'id');

        $validated['exercises_smr'] = implode("\n", array_map(fn($id) => $exerciseMap[$id] ?? '', $inhibitIds));
        $validated['exercises_stretching'] = implode("\n", array_map(fn($id) => $exerciseMap[$id] ?? '', $lengthenIds));
        $validated['exercises_isometrics'] = implode("\n", array_map(fn($id) => $exerciseMap[$id] ?? '', $activateIds));
        $validated['exercises_integrated'] = implode("\n", array_map(fn($id) => $exerciseMap[$id] ?? '', $integrateIds));

        $compensation = DpaCompensation::create($validated);

        // Sync linked exercises into pivot
        $syncData = [];
        foreach ($inhibitIds as $idx => $id) {
            $syncData[$id] = ['phase' => 'Inhibit', 'sort_order' => $idx];
        }
        foreach ($lengthenIds as $idx => $id) {
            $syncData[$id] = ['phase' => 'Lengthen', 'sort_order' => $idx];
        }
        foreach ($activateIds as $idx => $id) {
            $syncData[$id] = ['phase' => 'Activate', 'sort_order' => $idx];
        }
        foreach ($integrateIds as $idx => $id) {
            $syncData[$id] = ['phase' => 'Integrate', 'sort_order' => $idx];
        }
        $compensation->exercises()->sync($syncData);

        return redirect()->route('dpa-compensations.index')
            ->with('success', 'Master data kompensasi DPA berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified compensation.
     */
    public function edit(DpaCompensation $dpaCompensation)
    {
        $dpaCompensation->load('exercises');

        $exercises = Exercise::where('is_active', true)
            ->orderBy('name')
            ->get();

        $muscles = Muscle::orderBy('name')->get();

        $injuries = Injury::orderBy('name')->get();

        return Inertia::render('Dpa/Compensations/Form', [
            'compensation' => $dpaCompensation,
            'allExercises' => $exercises,
            'allMuscles' => $muscles,
            'allInjuries' => $injuries,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified compensation.
     */
    public function update(Request $request, DpaCompensation $dpaCompensation)
    {
        $validated = $request->validate([
            'category' => 'required|string|in:Posterior View,Lateral View,Anterior View,Single Leg',
            'name' => 'required|string|max:255',
            'checkpoint' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:5120',
            'remove_image' => 'nullable|boolean',
            'overactive_muscles' => 'nullable|string',
            'underactive_muscles' => 'nullable|string',
            'possible_injuries' => 'nullable|string',
            'exercise_ids_inhibit' => 'nullable|array',
            'exercise_ids_inhibit.*' => 'integer|exists:exercises,id',
            'exercise_ids_lengthen' => 'nullable|array',
            'exercise_ids_lengthen.*' => 'integer|exists:exercises,id',
            'exercise_ids_activate' => 'nullable|array',
            'exercise_ids_activate.*' => 'integer|exists:exercises,id',
            'exercise_ids_integrate' => 'nullable|array',
            'exercise_ids_integrate.*' => 'integer|exists:exercises,id',
        ]);

        if ($request->boolean('remove_image')) {
            if ($dpaCompensation->image_path) {
                Storage::disk('public')->delete($dpaCompensation->image_path);
            }
            $validated['image_path'] = null;
        } elseif ($request->hasFile('image')) {
            if ($dpaCompensation->image_path) {
                Storage::disk('public')->delete($dpaCompensation->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('dpa_images', 'public');
        }

        // Build exercise names for legacy text fields
        $inhibitIds = $request->input('exercise_ids_inhibit', []);
        $lengthenIds = $request->input('exercise_ids_lengthen', []);
        $activateIds = $request->input('exercise_ids_activate', []);
        $integrateIds = $request->input('exercise_ids_integrate', []);

        $allIds = array_unique(array_merge($inhibitIds, $lengthenIds, $activateIds, $integrateIds));
        $exerciseMap = Exercise::whereIn('id', $allIds)->pluck('name', 'id');

        $validated['exercises_smr'] = implode("\n", array_map(fn($id) => $exerciseMap[$id] ?? '', $inhibitIds));
        $validated['exercises_stretching'] = implode("\n", array_map(fn($id) => $exerciseMap[$id] ?? '', $lengthenIds));
        $validated['exercises_isometrics'] = implode("\n", array_map(fn($id) => $exerciseMap[$id] ?? '', $activateIds));
        $validated['exercises_integrated'] = implode("\n", array_map(fn($id) => $exerciseMap[$id] ?? '', $integrateIds));

        $dpaCompensation->update($validated);

        // Sync linked exercises into pivot
        $syncData = [];
        foreach ($inhibitIds as $idx => $id) {
            $syncData[$id] = ['phase' => 'Inhibit', 'sort_order' => $idx];
        }
        foreach ($lengthenIds as $idx => $id) {
            $syncData[$id] = ['phase' => 'Lengthen', 'sort_order' => $idx];
        }
        foreach ($activateIds as $idx => $id) {
            $syncData[$id] = ['phase' => 'Activate', 'sort_order' => $idx];
        }
        foreach ($integrateIds as $idx => $id) {
            $syncData[$id] = ['phase' => 'Integrate', 'sort_order' => $idx];
        }
        $dpaCompensation->exercises()->sync($syncData);

        return redirect()->route('dpa-compensations.index')
            ->with('success', 'Master data kompensasi DPA berhasil diperbarui.');
    }

    /**
     * Remove the specified compensation.
     */
    public function destroy(DpaCompensation $dpaCompensation)
    {
        if ($dpaCompensation->image_path) {
            Storage::disk('public')->delete($dpaCompensation->image_path);
        }

        $dpaCompensation->delete();

        return redirect()->back()
            ->with('success', 'Master data kompensasi DPA berhasil dihapus.');
    }
}
