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
     * Display a listing of assessments.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = DpaAssessment::query()
            ->with(['athlete', 'assessor', 'details.compensation'])
            ->withCount('details');

        if ($search) {
            $query->whereHas('athlete', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('athlete_code', 'like', "%{$search}%")
                  ->orWhere('sport_category', 'like', "%{$search}%");
            });
        }

        $assessments = $query->orderBy('assessment_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Dpa/Index', [
            'assessments' => $assessments,
            'filters' => [
                'search' => $search ?? '',
            ],
            'totalCount' => DpaAssessment::count(),
        ]);
    }

    /**
     * Show the form for creating a new DPA assessment.
     */
    public function create(Request $request)
    {
        $athleteId = $request->query('athlete_id');
        $selectedAthlete = null;

        if ($athleteId) {
            $selectedAthlete = Athlete::find($athleteId);
        }

        $athletes = Athlete::where('is_active', true)
            ->select('id', 'athlete_code', 'full_name', 'sport_category', 'gender', 'height_cm', 'weight_kg')
            ->orderBy('full_name')
            ->get();

        $compensations = DpaCompensation::all()->groupBy('category');

        return Inertia::render('Dpa/Create', [
            'athletes' => $athletes,
            'selectedAthlete' => $selectedAthlete,
            'compensationsGrouped' => $compensations,
        ]);
    }

    /**
     * Store a newly created DPA assessment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'athlete_id' => 'required|exists:athletes,id',
            'assessment_date' => 'required|date',
            'current_height_cm' => 'nullable|numeric|min:50|max:250',
            'current_weight_kg' => 'nullable|numeric|min:20|max:200',
            'notes' => 'nullable|string',
            'selected_compensations' => 'required|array',
            'selected_compensations.*.id' => 'required|exists:dpa_compensations,id',
            'selected_compensations.*.severity' => 'required|in:Mild,Moderate,Severe',
            'selected_compensations.*.side' => 'required|in:Left,Right,Bilateral',
            'selected_compensations.*.specific_note' => 'nullable|string',
        ]);

        $assessment = DB::transaction(function () use ($validated, $request) {
            $assessment = DpaAssessment::create([
                'athlete_id' => $validated['athlete_id'],
                'assessor_id' => $request->user() ? $request->user()->id : null,
                'assessment_date' => $validated['assessment_date'],
                'current_height_cm' => $validated['current_height_cm'] ?? null,
                'current_weight_kg' => $validated['current_weight_kg'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['selected_compensations'] as $comp) {
                DpaAssessmentDetail::create([
                    'dpa_assessment_id' => $assessment->id,
                    'dpa_compensation_id' => $comp['id'],
                    'severity' => $comp['severity'],
                    'side' => $comp['side'],
                    'specific_note' => $comp['specific_note'] ?? null,
                ]);
            }

            return $assessment;
        });

        return redirect()->route('dpa.show', $assessment->id)
            ->with('success', 'Sesi asesmen DPA berhasil disimpan dan dianalisis.');
    }

    /**
     * Display the specified DPA assessment report.
     */
    public function show(DpaAssessment $dpa)
    {
        $dpa->load([
            'athlete',
            'assessor',
            'details.compensation',
        ]);

        // Biomechanical Muscle & Corrective Aggregation Engine
        $overactiveMuscles = [];
        $underactiveMuscles = [];
        $possibleInjuries = [];
        $exercisesSmr = [];
        $exercisesStretching = [];
        $exercisesIsometrics = [];
        $exercisesIntegrated = [];

        foreach ($dpa->details as $detail) {
            $comp = $detail->compensation;
            if (!$comp) continue;

            $this->parseAndMerge($comp->overactive_muscles, $overactiveMuscles);
            $this->parseAndMerge($comp->underactive_muscles, $underactiveMuscles);
            $this->parseAndMerge($comp->possible_injuries, $possibleInjuries);
            $this->parseAndMerge($comp->exercises_smr, $exercisesSmr);
            $this->parseAndMerge($comp->exercises_stretching, $exercisesStretching);
            $this->parseAndMerge($comp->exercises_isometrics, $exercisesIsometrics);
            $this->parseAndMerge($comp->exercises_integrated, $exercisesIntegrated);
        }

        $totalDeviations = $dpa->details->count();
        $severeCount = $dpa->details->where('severity', 'Severe')->count();

        $riskLevel = 'Low';
        if ($totalDeviations >= 5 || $severeCount >= 2) {
            $riskLevel = 'High';
        } elseif ($totalDeviations >= 3 || $severeCount >= 1) {
            $riskLevel = 'Moderate';
        }

        return Inertia::render('Dpa/Show', [
            'assessment' => $dpa,
            'analytics' => [
                'totalDeviations' => $totalDeviations,
                'riskLevel' => $riskLevel,
                'overactiveMuscles' => array_values(array_unique($overactiveMuscles)),
                'underactiveMuscles' => array_values(array_unique($underactiveMuscles)),
                'possibleInjuries' => array_values(array_unique($possibleInjuries)),
                'correctiveProtocol' => [
                    'smr' => array_values(array_unique($exercisesSmr)),
                    'stretching' => array_values(array_unique($exercisesStretching)),
                    'isometrics' => array_values(array_unique($exercisesIsometrics)),
                    'integrated' => array_values(array_unique($exercisesIntegrated)),
                ],
            ],
        ]);
    }

    /**
     * Remove the specified DPA assessment.
     */
    public function destroy(DpaAssessment $dpa)
    {
        $athleteId = $dpa->athlete_id;
        $dpa->delete();

        return redirect()->route('athletes.show', $athleteId)
            ->with('success', 'Sesi asesmen DPA berhasil dihapus.');
    }

    private function parseAndMerge(?string $text, array &$targetArray): void
    {
        if (!$text) return;
        $lines = preg_split('/[\r\n,]+/', $text);
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (!empty($trimmed) && !in_array($trimmed, $targetArray)) {
                $targetArray[] = $trimmed;
            }
        }
    }
}
