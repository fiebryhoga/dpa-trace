<?php

namespace App\Http\Controllers;

use App\Models\Athlete;
use App\Models\DpaAssessment;
use App\Models\DpaAssessmentDetail;
use App\Models\DpaCompensation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DpaAssessmentController extends Controller
{
    /**
     * Display a listing of athletes for DPA evaluation.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $sport = $request->query('sport');
        $sortBy = $request->query('sort', 'name_asc');

        $query = Athlete::query()
            ->withCount('dpaAssessments as total_records')
            ->with(['dpaAssessments' => function ($q) {
                $q->with('details.compensation')->latest('assessment_date')->limit(1);
            }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('athlete_code', 'like', "%{$search}%");
            });
        }

        if ($sortBy === 'name_desc') {
            $query->orderBy('full_name', 'desc');
        } elseif ($sortBy === 'records_desc') {
            $query->orderBy('total_records', 'desc');
        } else {
            $query->orderBy('full_name', 'asc');
        }

        $athletes = $query->get();

        return Inertia::render('Dpa/Index', [
            'athletes' => $athletes,
            'filters' => [
                'search' => $search ?? '',
                'sort' => $sortBy,
            ],
            'totalCount' => Athlete::count(),
            'testedCount' => Athlete::has('dpaAssessments')->count(),
        ]);
    }

    /**
     * Display the specified athlete's DPA dashboard & assessments.
     */
    public function showAthlete(Athlete $athlete)
    {
        $assessments = $athlete->dpaAssessments()
            ->with(['details.compensation', 'assessor'])
            ->orderBy('assessment_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $compensations = DpaCompensation::orderBy('category')->orderBy('name')->get();
        $galleries = $athlete->galleries()->latest()->get();

        return Inertia::render('Dpa/Show', [
            'athlete' => $athlete,
            'assessments' => $assessments,
            'compensations' => $compensations,
            'galleries' => $galleries,
        ]);
    }

    /**
     * Store a newly created DPA assessment.
     */
    public function store(Request $request, Athlete $athlete)
    {
        $validated = $request->validate([
            'assessment_date' => 'required|date',
            'notes' => 'nullable|string',
            'current_height_cm' => 'nullable|numeric|min:50|max:250',
            'current_weight_kg' => 'nullable|numeric|min:20|max:200',
            'compensations' => 'array',
            'compensations.*' => 'exists:dpa_compensations,id',
            'step_photos' => 'nullable|array',
            'step_photos.*' => 'nullable|image|max:10240',
            'step_annotated_photos' => 'nullable|array',
            'step_annotated_photos.*' => 'nullable|image|max:10240',
            'step_metadata' => 'nullable',
        ]);

        DB::transaction(function () use ($validated, $athlete, $request) {
            $assessment = $athlete->dpaAssessments()->create([
                'assessor_id' => $request->user()?->id,
                'assessment_date' => $validated['assessment_date'],
                'current_height_cm' => $validated['current_height_cm'] ?? $athlete->height_cm,
                'current_weight_kg' => $validated['current_weight_kg'] ?? $athlete->weight_kg,
                'notes' => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['compensations'])) {
                foreach ($validated['compensations'] as $compId) {
                    $assessment->details()->create([
                        'dpa_compensation_id' => $compId,
                    ]);
                }
            }

            // Save test photos (both raw and annotated versions) + metadata to AthleteGallery
            $stepMetadata = [];
            if ($request->filled('step_metadata')) {
                $metaInput = $request->input('step_metadata');
                $stepMetadata = is_string($metaInput) ? json_decode($metaInput, true) : (array)$metaInput;
            }

            $allViews = ['Anterior View', 'Lateral View', 'Posterior View', 'Single Leg'];
            $rawFiles = $request->file('step_photos', []);
            $annotatedFiles = $request->file('step_annotated_photos', []);

            foreach ($allViews as $viewKey) {
                $rawFile = $rawFiles[$viewKey] ?? null;
                $annotatedFile = $annotatedFiles[$viewKey] ?? null;
                $viewMeta = $stepMetadata[$viewKey] ?? null;

                if ($rawFile && $rawFile->isValid()) {
                    $rawStored = $rawFile->store('athletes/' . $athlete->id . '/postures', 'public');
                    $rawPath = '/storage/' . $rawStored;
                    $annotatedPath = $rawPath;

                    if ($annotatedFile && $annotatedFile->isValid()) {
                        $annotatedStored = $annotatedFile->store('athletes/' . $athlete->id . '/postures', 'public');
                        $annotatedPath = '/storage/' . $annotatedStored;
                    }

                    $galleryMeta = [
                        'view_category' => $viewKey,
                        'assessment_id' => $assessment->id,
                        'has_annotations' => true,
                        'landmarks' => $viewMeta['landmarks'] ?? [],
                        'show_goniometer' => $viewMeta['showGoniometer'] ?? true,
                        'detected_compensations' => $viewMeta['detectedCompensations'] ?? [],
                    ];

                    \App\Models\AthleteGallery::create([
                        'athlete_id' => $athlete->id,
                        'image_path' => $annotatedPath,
                        'original_image_path' => $rawPath,
                        'annotations' => $viewMeta['landmarks'] ?? null,
                        'meta' => $galleryMeta,
                        'notes' => "Hasil Analisis Postur DPA ({$viewKey}) - " . \Carbon\Carbon::parse($assessment->assessment_date)->isoFormat('D MMMM Y'),
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Data evaluasi DPA, visualisasi garis postur, dan metadata koordinat berhasil disimpan.');
    }

    /**
     * Update the specified DPA assessment.
     */
    public function update(Request $request, DpaAssessment $dpaAssessment)
    {
        $validated = $request->validate([
            'assessment_date' => 'required|date',
            'notes' => 'nullable|string',
            'current_height_cm' => 'nullable|numeric|min:50|max:250',
            'current_weight_kg' => 'nullable|numeric|min:20|max:200',
            'compensations' => 'array',
            'compensations.*' => 'exists:dpa_compensations,id',
            'step_photos' => 'nullable|array',
            'step_photos.*' => 'nullable|image|max:10240',
            'step_annotated_photos' => 'nullable|array',
            'step_annotated_photos.*' => 'nullable|image|max:10240',
            'step_metadata' => 'nullable',
        ]);

        DB::transaction(function () use ($validated, $dpaAssessment, $request) {
            $dpaAssessment->update([
                'assessment_date' => $validated['assessment_date'],
                'current_height_cm' => $validated['current_height_cm'] ?? $dpaAssessment->current_height_cm,
                'current_weight_kg' => $validated['current_weight_kg'] ?? $dpaAssessment->current_weight_kg,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Sync details
            $dpaAssessment->details()->delete();

            if (!empty($validated['compensations'])) {
                foreach ($validated['compensations'] as $compId) {
                    $dpaAssessment->details()->create([
                        'dpa_compensation_id' => $compId,
                    ]);
                }
            }

            // Sync/Update posture gallery photos & landmarks
            $athlete = $dpaAssessment->athlete;
            $stepMetadata = [];
            if ($request->filled('step_metadata')) {
                $metaInput = $request->input('step_metadata');
                $stepMetadata = is_string($metaInput) ? json_decode($metaInput, true) : (array)$metaInput;
            }

            $allViews = ['Anterior View', 'Lateral View', 'Posterior View', 'Single Leg'];
            $rawFiles = $request->file('step_photos', []);
            $annotatedFiles = $request->file('step_annotated_photos', []);

            foreach ($allViews as $viewKey) {
                $rawFile = $rawFiles[$viewKey] ?? null;
                $annotatedFile = $annotatedFiles[$viewKey] ?? null;
                $viewMeta = $stepMetadata[$viewKey] ?? null;

                $existingGallery = \App\Models\AthleteGallery::where('athlete_id', $athlete->id)
                    ->where('meta->assessment_id', $dpaAssessment->id)
                    ->where('meta->view_category', $viewKey)
                    ->first();

                if ($rawFile && $rawFile->isValid()) {
                    $rawStored = $rawFile->store('athletes/' . $athlete->id . '/postures', 'public');
                    $rawPath = '/storage/' . $rawStored;
                    $annotatedPath = $rawPath;

                    if ($annotatedFile && $annotatedFile->isValid()) {
                        $annotatedStored = $annotatedFile->store('athletes/' . $athlete->id . '/postures', 'public');
                        $annotatedPath = '/storage/' . $annotatedStored;
                    }

                    $galleryMeta = [
                        'view_category' => $viewKey,
                        'assessment_id' => $dpaAssessment->id,
                        'has_annotations' => true,
                        'landmarks' => $viewMeta['landmarks'] ?? [],
                        'show_goniometer' => $viewMeta['showGoniometer'] ?? true,
                        'detected_compensations' => $viewMeta['detectedCompensations'] ?? [],
                    ];

                    if ($existingGallery) {
                        $existingGallery->update([
                            'image_path' => $annotatedPath,
                            'original_image_path' => $rawPath,
                            'annotations' => $viewMeta['landmarks'] ?? null,
                            'meta' => $galleryMeta,
                        ]);
                    } else {
                        \App\Models\AthleteGallery::create([
                            'athlete_id' => $athlete->id,
                            'image_path' => $annotatedPath,
                            'original_image_path' => $rawPath,
                            'annotations' => $viewMeta['landmarks'] ?? null,
                            'meta' => $galleryMeta,
                            'notes' => "Hasil Analisis Postur DPA ({$viewKey}) - " . \Carbon\Carbon::parse($dpaAssessment->assessment_date)->isoFormat('D MMMM Y'),
                        ]);
                    }
                } elseif ($annotatedFile && $annotatedFile->isValid() && $existingGallery) {
                    $annotatedStored = $annotatedFile->store('athletes/' . $athlete->id . '/postures', 'public');
                    $annotatedPath = '/storage/' . $annotatedStored;

                    $galleryMeta = array_merge($existingGallery->meta ?? [], [
                        'landmarks' => $viewMeta['landmarks'] ?? ($existingGallery->meta['landmarks'] ?? []),
                        'show_goniometer' => $viewMeta['showGoniometer'] ?? ($existingGallery->meta['show_goniometer'] ?? true),
                    ]);

                    $existingGallery->update([
                        'image_path' => $annotatedPath,
                        'annotations' => $viewMeta['landmarks'] ?? $existingGallery->annotations,
                        'meta' => $galleryMeta,
                    ]);
                } elseif ($viewMeta && $existingGallery) {
                    $galleryMeta = array_merge($existingGallery->meta ?? [], [
                        'landmarks' => $viewMeta['landmarks'] ?? ($existingGallery->meta['landmarks'] ?? []),
                        'show_goniometer' => $viewMeta['showGoniometer'] ?? ($existingGallery->meta['show_goniometer'] ?? true),
                    ]);

                    $existingGallery->update([
                        'annotations' => $viewMeta['landmarks'] ?? $existingGallery->annotations,
                        'meta' => $galleryMeta,
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Data evaluasi DPA dan garis visualisasi postur berhasil diperbarui.');
    }

    /**
     * Remove the specified DPA assessment.
     */
    public function destroy(DpaAssessment $dpaAssessment)
    {
        $dpaAssessment->delete();
        return redirect()->back()->with('success', 'Data evaluasi DPA berhasil dihapus.');
    }
}
