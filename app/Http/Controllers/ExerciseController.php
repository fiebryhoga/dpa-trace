<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExerciseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Exercise::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('instructions', 'like', "%{$search}%");
            });
        }

        $exercises = $query->orderBy('name')->get();

        return Inertia::render('Exercises/Index', [
            'exercises' => $exercises,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Exercises/Form', [
            'exercise' => null,
            'isEdit' => false,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'instructions' => 'nullable|string',
            'video_url' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $data = $validated;
        unset($data['image']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('exercises', 'public');
            $data['image_path'] = $path;
        }

        Exercise::create($data);

        return redirect()->route('exercises.index')->with('success', 'Latihan korektif berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Exercise $exercise)
    {
        return Inertia::render('Exercises/Form', [
            'exercise' => $exercise,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Exercise $exercise)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'instructions' => 'nullable|string',
            'video_url' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'remove_image' => 'nullable|boolean',
        ]);

        $data = $validated;
        unset($data['image'], $data['remove_image']);

        if ($request->boolean('remove_image')) {
            if ($exercise->image_path && Storage::disk('public')->exists($exercise->image_path)) {
                Storage::disk('public')->delete($exercise->image_path);
            }
            $data['image_path'] = null;
        }

        if ($request->hasFile('image')) {
            if ($exercise->image_path && Storage::disk('public')->exists($exercise->image_path)) {
                Storage::disk('public')->delete($exercise->image_path);
            }
            $path = $request->file('image')->store('exercises', 'public');
            $data['image_path'] = $path;
        }

        $exercise->update($data);

        return redirect()->route('exercises.index')->with('success', 'Latihan korektif berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Exercise $exercise)
    {
        if ($exercise->image_path && Storage::disk('public')->exists($exercise->image_path)) {
            Storage::disk('public')->delete($exercise->image_path);
        }

        $exercise->delete();

        return redirect()->route('exercises.index')->with('success', 'Latihan korektif berhasil dihapus.');
    }
}
