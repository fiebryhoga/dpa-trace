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

    /**
     * Store photo gallery for the athlete.
     */
    public function storeGallery(Request $request, Athlete $athlete)
    {
        $request->validate([
            'photos' => 'nullable|array',
            'photos.*.file' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'photos.*.notes' => 'nullable|string',
            'photos.*.created_at' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'original_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'original_image_path' => 'nullable|string',
            'annotations' => 'nullable',
            'meta' => 'nullable',
            'notes' => 'nullable|string',
            'created_at' => 'nullable|date',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('athlete_galleries', 'public');
            
            $originalPath = null;
            if ($request->hasFile('original_image')) {
                $origStored = $request->file('original_image')->store('athlete_galleries', 'public');
                $originalPath = '/storage/' . $origStored;
            } elseif ($request->filled('original_image_path')) {
                $originalPath = $request->original_image_path;
            } else {
                $originalPath = '/storage/' . $path;
            }

            $annotations = $request->annotations;
            if (is_string($annotations)) {
                $annotations = json_decode($annotations, true);
            }

            $meta = $request->meta;
            if (is_string($meta)) {
                $meta = json_decode($meta, true);
            }

            $gallery = new \App\Models\AthleteGallery([
                'athlete_id' => $athlete->id,
                'image_path' => '/storage/' . $path,
                'original_image_path' => $originalPath,
                'annotations' => $annotations,
                'meta' => $meta,
                'notes' => $request->notes ?? null,
            ]);

            if ($request->filled('created_at')) {
                $gallery->created_at = \Carbon\Carbon::parse($request->created_at);
            }
            $gallery->save();
        }

        if ($request->photos && is_array($request->photos)) {
            foreach ($request->photos as $photoData) {
                if (isset($photoData['file'])) {
                    $path = $photoData['file']->store('athlete_galleries', 'public');
                    $fullPath = '/storage/' . $path;
                    
                    $gallery = new \App\Models\AthleteGallery([
                        'athlete_id' => $athlete->id,
                        'image_path' => $fullPath,
                        'original_image_path' => $fullPath,
                        'notes' => $photoData['notes'] ?? null,
                    ]);
                    if (!empty($photoData['created_at'])) {
                        $gallery->created_at = \Carbon\Carbon::parse($photoData['created_at']);
                    }
                    $gallery->save();
                }
            }
        }

        return redirect()->back()->with('success', 'Foto dokumentasi postur berhasil ditambahkan.');
    }

    /**
     * Update photo gallery notes / annotations.
     */
    public function updateGallery(Request $request, \App\Models\AthleteGallery $gallery)
    {
        $request->validate([
            'notes' => 'nullable|string',
            'created_at' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            'original_image_path' => 'nullable|string',
            'annotations' => 'nullable',
            'meta' => 'nullable',
        ]);

        $gallery->notes = $request->notes;

        if ($request->filled('created_at')) {
            $gallery->created_at = \Carbon\Carbon::parse($request->created_at);
        }

        if ($request->has('annotations')) {
            $annotations = $request->annotations;
            $gallery->annotations = is_string($annotations) ? json_decode($annotations, true) : $annotations;
        }

        if ($request->has('meta')) {
            $meta = $request->meta;
            $gallery->meta = is_string($meta) ? json_decode($meta, true) : $meta;
        }

        if ($request->filled('original_image_path')) {
            $gallery->original_image_path = $request->original_image_path;
        } elseif (!$gallery->original_image_path) {
            $gallery->original_image_path = $gallery->image_path;
        }

        if ($request->hasFile('image')) {
            $oldPath = str_replace('/storage/', '', $gallery->image_path);
            $origRelPath = $gallery->original_image_path ? str_replace('/storage/', '', $gallery->original_image_path) : null;
            if ($oldPath && $oldPath !== $origRelPath) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('athlete_galleries', 'public');
            $gallery->image_path = '/storage/' . $path;
        }

        $gallery->save();

        return redirect()->back()->with('success', 'Foto dan catatan evaluasi berhasil diperbarui.');
    }

    /**
     * Delete photo from gallery.
     */
    public function destroyGallery(\App\Models\AthleteGallery $gallery)
    {
        $path = str_replace('/storage/', '', $gallery->image_path);
        \Illuminate\Support\Facades\Storage::disk('public')->delete($path);

        if ($gallery->original_image_path && $gallery->original_image_path !== $gallery->image_path) {
            $origPath = str_replace('/storage/', '', $gallery->original_image_path);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($origPath);
        }

        $gallery->delete();

        return redirect()->back()->with('success', 'Foto berhasil dihapus.');
    }
}
