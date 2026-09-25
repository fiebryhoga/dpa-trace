<?php

namespace App\Http\Controllers;

use App\Models\Athlete;
use App\Models\DpaAssessment;
use App\Models\DpaAssessmentDetail;
use App\Models\DpaCompensation;
use Barryvdh\DomPDF\Facade\Pdf;
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
                $q->latest('assessment_date')->limit(1);
            }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('athlete_code', 'like', "%{$search}%")
                  ->orWhere('nickname', 'like', "%{$search}%")
                  ->orWhere('sport_category', 'like', "%{$search}%")
                  ->orWhere('position_specialty', 'like', "%{$search}%");
            });
        }

        if ($sport && $sport !== 'all') {
            $query->where('sport_category', $sport);
        }

        if ($sortBy === 'name_desc') {
            $query->orderBy('full_name', 'desc');
        } elseif ($sortBy === 'records_desc') {
            $query->orderBy('total_records', 'desc');
        } else {
            $query->orderBy('full_name', 'asc');
        }

        $athletes = $query->get();
        $sportsList = Athlete::select('sport_category')->distinct()->pluck('sport_category')->filter()->values();

        return Inertia::render('Dpa/Index', [
            'athletes' => $athletes,
            'sportsList' => $sportsList,
            'filters' => [
                'search' => $search ?? '',
                'sport' => $sport ?? 'all',
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
        });

        return redirect()->back()->with('success', 'Data evaluasi DPA berhasil disimpan.');
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
        ]);

        DB::transaction(function () use ($validated, $dpaAssessment) {
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
        });

        return redirect()->back()->with('success', 'Data evaluasi DPA berhasil diperbarui.');
    }

    /**
     * Remove the specified DPA assessment.
     */
    public function destroy(DpaAssessment $dpaAssessment)
    {
        $dpaAssessment->delete();
        return redirect()->back()->with('success', 'Data evaluasi DPA berhasil dihapus.');
    }

    /**
     * Export DPA assessment report to PDF.
     */
    public function exportPdf(Request $request, Athlete $athlete)
    {
        ini_set('memory_limit', '512M');
        ini_set('max_execution_time', '300');

        $exportData = json_decode($request->input('table_data', '[]'), true);
        $customTitle = trim($request->input('title', ''));
        $note = $request->input('note');

        $defaultTitle = "DPA ASSESSMENT REPORT - " . strtoupper($athlete->full_name);
        $title = !empty($customTitle) ? $customTitle : $defaultTitle;

        $latest = $exportData['latest'] ?? null;
        if (!$latest) {
            $latestAssessment = $athlete->dpaAssessments()->with(['details.compensation'])->latest('assessment_date')->first();
            if ($latestAssessment) {
                $latest = $latestAssessment->toArray();
            }
        }

        $analysis = [
            'overactive' => [],
            'underactive' => [],
            'injuries' => [],
            'smr' => [],
            'stretching' => [],
            'isometrics' => [],
            'integrated' => [],
        ];

        if ($latest && isset($latest['details'])) {
            $addItems = function ($sourceStr, &$targetArray) {
                if (!$sourceStr) return;
                $items = array_filter(array_map('trim', preg_split('/[\n,]/', $sourceStr)));
                foreach ($items as $item) {
                    $clean = ltrim($item, '- ');
                    if (!in_array($clean, $targetArray)) {
                        $targetArray[] = $clean;
                    }
                }
            };

            foreach ($latest['details'] as $detail) {
                if (isset($detail['compensation'])) {
                    $c = $detail['compensation'];
                    $addItems($c['overactive_muscles'] ?? '', $analysis['overactive']);
                    $addItems($c['underactive_muscles'] ?? '', $analysis['underactive']);
                    $addItems($c['possible_injuries'] ?? '', $analysis['injuries']);
                    $addItems($c['exercises_smr'] ?? '', $analysis['smr']);
                    $addItems($c['exercises_stretching'] ?? '', $analysis['stretching']);
                    $addItems($c['exercises_isometrics'] ?? '', $analysis['isometrics']);
                    $addItems($c['exercises_integrated'] ?? '', $analysis['integrated']);
                }
            }
        }

        $pdf = Pdf::loadView('exports.dpa_pdf', [
            'athlete' => $athlete,
            'latest' => $latest,
            'analysis' => $analysis,
            'title' => $title,
            'note' => $note,
        ])->setPaper('a4', 'portrait');

        $cleanName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $athlete->full_name);
        $filename = 'DPA_Report_' . $cleanName . '_' . date('Ymd') . '.pdf';

        return $pdf->download($filename);
    }
}
