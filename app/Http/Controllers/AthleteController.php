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

        $query = Athlete::query()
            ->withCount('dpaAssessments')
            ->with(['dpaAssessments' => function ($q) {
                $q->latest('assessment_date')->limit(1);
            }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('athlete_code', 'like', "%{$search}%");
            });
        }

        $athletes = $query->orderBy('created_at', 'desc')->paginate(12)->withQueryString();

        return Inertia::render('Athletes/Index', [
            'athletes' => $athletes,
            'filters' => [
                'search' => $search ?? '',
            ],
            'totalCount' => Athlete::count(),
            'activeCount' => Athlete::where('is_active', true)->count(),
        ]);
    }

    /**
     * Show the form for creating a new athlete.
     */
    public function create()
    {
        return redirect()->route('athletes.index');
    }

    /**
     * Store a newly created athlete in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'athlete_code' => 'required|string|unique:athletes,athlete_code|max:50',
            'full_name' => 'required|string|max:255',
            'gender' => 'required|in:L,P',
            'age' => 'required|integer|min:5|max:120',
            'height_cm' => 'nullable|numeric|min:50|max:250',
            'weight_kg' => 'nullable|numeric|min:20|max:200',
            'dominant_side' => 'required|in:R,L,Bilateral',
            'injury_history' => 'nullable|string',
            'phone_number' => 'nullable|string|max:30',
            'is_active' => 'boolean',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $this->processAndStorePhoto($request->file('photo'));
        }

        unset($validated['photo']);

        $athlete = Athlete::create($validated);

        return redirect()->route('athletes.index')
            ->with('success', 'Data atlet "' . $athlete->full_name . '" berhasil ditambahkan.');
    }

    /**
     * Display the specified athlete.
     */
    public function show(Athlete $athlete)
    {
        $athlete->load([
            'dpaAssessments.details.compensation',
            'dpaAssessments.assessor',
            'trainingPrograms.items.exercise',
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
        return redirect()->route('athletes.index');
    }

    /**
     * Update the specified athlete in storage.
     */
    public function update(Request $request, Athlete $athlete)
    {
        $validated = $request->validate([
            'athlete_code' => 'required|string|max:50|unique:athletes,athlete_code,' . $athlete->id,
            'full_name' => 'required|string|max:255',
            'gender' => 'required|in:L,P',
            'age' => 'required|integer|min:5|max:120',
            'height_cm' => 'nullable|numeric|min:50|max:250',
            'weight_kg' => 'nullable|numeric|min:20|max:200',
            'dominant_side' => 'required|in:R,L,Bilateral',
            'injury_history' => 'nullable|string',
            'phone_number' => 'nullable|string|max:30',
            'is_active' => 'boolean',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'remove_photo' => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_photo')) {
            if ($athlete->photo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($athlete->photo_path)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($athlete->photo_path);
            }
            $validated['photo_path'] = null;
        } elseif ($request->hasFile('photo')) {
            if ($athlete->photo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($athlete->photo_path)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($athlete->photo_path);
            }
            $validated['photo_path'] = $this->processAndStorePhoto($request->file('photo'));
        }

        unset($validated['photo'], $validated['remove_photo']);

        $athlete->update($validated);

        return redirect()->route('athletes.index')
            ->with('success', 'Data biodata atlet "' . $athlete->full_name . '" berhasil diperbarui.');
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

    /**
     * Convert and store uploaded photo as WebP.
     */
    private function processAndStorePhoto($file): ?string
    {
        if (!$file || !$file->isValid()) {
            return null;
        }

        $filename = 'athlete_' . uniqid() . '_' . time() . '.webp';
        $directory = storage_path('app/public/athletes');

        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }

        $destinationPath = $directory . '/' . $filename;

        try {
            $imageData = file_get_contents($file->getRealPath());
            $srcImage = @imagecreatefromstring($imageData);

            if ($srcImage !== false) {
                if (!imageistruecolor($srcImage)) {
                    $width = imagesx($srcImage);
                    $height = imagesy($srcImage);
                    $trueColor = imagecreatetruecolor($width, $height);
                    imagealphablending($trueColor, false);
                    imagesavealpha($trueColor, true);
                    imagecopy($trueColor, $srcImage, 0, 0, 0, 0, $width, $height);
                    imagedestroy($srcImage);
                    $srcImage = $trueColor;
                } else {
                    imagealphablending($srcImage, false);
                    imagesavealpha($srcImage, true);
                }

                imagewebp($srcImage, $destinationPath, 85);
                imagedestroy($srcImage);

                return 'athletes/' . $filename;
            }
        } catch (\Throwable $e) {
            // Fallback to default storage
        }

        return $file->store('athletes', 'public');
    }
}
