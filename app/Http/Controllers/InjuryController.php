<?php

namespace App\Http\Controllers;

use App\Models\Injury;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InjuryController extends Controller
{
    /**
     * Display a listing of injuries.
     */
    public function index(Request $request)
    {
        $query = Injury::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('body_region', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('region')) {
            $query->where('body_region', $request->region);
        }

        $injuries = $query->orderBy('body_region')->orderBy('name')->paginate(20)->withQueryString();

        $regions = Injury::select('body_region')->whereNotNull('body_region')->distinct()->pluck('body_region');

        return Inertia::render('Injuries/Index', [
            'injuries' => $injuries,
            'regions' => $regions,
            'filters' => $request->only(['search', 'region']),
        ]);
    }

    /**
     * Store a newly created injury.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:injuries,name',
            'body_region' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        Injury::create($validated);

        return redirect()->back()->with('success', 'Master potensi cedera berhasil ditambahkan.');
    }

    /**
     * Update the specified injury.
     */
    public function update(Request $request, Injury $injury)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:injuries,name,' . $injury->id,
            'body_region' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $injury->update($validated);

        return redirect()->back()->with('success', 'Data potensi cedera berhasil diperbarui.');
    }

    /**
     * Remove the specified injury.
     */
    public function destroy(Injury $injury)
    {
        $injury->delete();

        return redirect()->back()->with('success', 'Potensi cedera berhasil dihapus.');
    }
}
