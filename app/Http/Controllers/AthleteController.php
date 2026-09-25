<?php

namespace App\Http\Controllers;

use App\Models\Athlete;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AthleteController extends Controller
{
    /**
     * Display a listing of athletes.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $sport = $request->query('sport');

        $query = Athlete::query()
            ->withCount('dpaAssessments')
            ->with(['dpaAssessments' => function ($q) {
                $q->latest('assessment_date')->limit(1);
            }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('athlete_code', 'like', "%{$search}%")
                  ->orWhere('nickname', 'like', "%{$search}%")
                  ->orWhere('position_specialty', 'like', "%{$search}%");
            });
        }

        if ($sport && $sport !== 'all') {
            $query->where('sport_category', $sport);
        }

        $athletes = $query->orderBy('created_at', 'desc')->paginate(12)->withQueryString();

        $sportsList = Athlete::select('sport_category')->distinct()->pluck('sport_category')->filter()->values();

        return Inertia::render('Athletes/Index', [
            'athletes' => $athletes,
            'filters' => [
                'search' => $search ?? '',
                'sport' => $sport ?? 'all',
            ],
            'sportsList' => $sportsList,
            'totalCount' => Athlete::count(),
            'activeCount' => Athlete::where('is_active', true)->count(),
        ]);
    }

    /**
     * Show the form for creating a new athlete.
     */
    public function create()
    {
        return Inertia::render('Athletes/Create');
    }

    /**
     * Store a newly created athlete in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'athlete_code' => 'required|string|unique:athletes,athlete_code|max:50',
            'full_name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:100',
            'gender' => 'required|in:L,P',
            'birth_date' => 'nullable|date',
            'height_cm' => 'nullable|numeric|min:50|max:250',
            'weight_kg' => 'nullable|numeric|min:20|max:200',
            'sport_category' => 'required|string|max:100',
            'position_specialty' => 'nullable|string|max:100',
            'club_institution' => 'nullable|string|max:150',
            'dominant_side' => 'required|in:R,L,Bilateral',
            'injury_history' => 'nullable|string',
            'phone_number' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ]);

        $athlete = Athlete::create($validated);

        return redirect()->route('athletes.show', $athlete->id)
            ->with('success', 'Data atlet berhasil ditambahkan.');
    }

    /**
     * Display the specified athlete.
     */
    public function show(Athlete $athlete)
    {
        $athlete->load([
            'dpaAssessments.details.compensation',
            'dpaAssessments.assessor',
        ]);

        return Inertia::render('Athletes/Show', [
            'athlete' => $athlete,
        ]);
    }

    /**
     * Show the form for editing the specified athlete.
     */
    public function edit(Athlete $athlete)
    {
        return Inertia::render('Athletes/Edit', [
            'athlete' => $athlete,
        ]);
    }

    /**
     * Update the specified athlete in storage.
     */
    public function update(Request $request, Athlete $athlete)
    {
        $validated = $request->validate([
            'athlete_code' => 'required|string|max:50|unique:athletes,athlete_code,' . $athlete->id,
            'full_name' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:100',
            'gender' => 'required|in:L,P',
            'birth_date' => 'nullable|date',
            'height_cm' => 'nullable|numeric|min:50|max:250',
            'weight_kg' => 'nullable|numeric|min:20|max:200',
            'sport_category' => 'required|string|max:100',
            'position_specialty' => 'nullable|string|max:100',
            'club_institution' => 'nullable|string|max:150',
            'dominant_side' => 'required|in:R,L,Bilateral',
            'injury_history' => 'nullable|string',
            'phone_number' => 'nullable|string|max:30',
            'is_active' => 'boolean',
        ]);

        $athlete->update($validated);

        return redirect()->route('athletes.show', $athlete->id)
            ->with('success', 'Data biodata atlet berhasil diperbarui.');
    }

    /**
     * Remove the specified athlete from storage.
     */
    public function destroy(Athlete $athlete)
    {
        $athlete->delete();

        return redirect()->route('athletes.index')
            ->with('success', 'Data atlet berhasil dihapus.');
    }
}
