<?php

namespace App\Http\Controllers;

use App\Models\Muscle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MuscleController extends Controller
{
    /**
     * Display a listing of muscles.
     */
    public function index(Request $request)
    {
        $query = Muscle::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $muscles = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('Muscles/Index', [
            'muscles' => $muscles,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created muscle.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:muscles,name',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        Muscle::create($validated);

        return redirect()->back()->with('success', 'Master otot berhasil ditambahkan.');
    }

    /**
     * Update the specified muscle.
     */
    public function update(Request $request, Muscle $muscle)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:muscles,name,' . $muscle->id,
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $muscle->update($validated);

        return redirect()->back()->with('success', 'Data master otot berhasil diperbarui.');
    }

    /**
     * Remove the specified muscle.
     */
    public function destroy(Muscle $muscle)
    {
        $muscle->delete();

        return redirect()->back()->with('success', 'Master otot berhasil dihapus.');
    }
}
