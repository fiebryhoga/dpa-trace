<?php

namespace App\Http\Controllers;

use App\Models\Athlete;
use App\Models\DpaAssessment;
use App\Models\DpaCompensation;
use App\Models\Exercise;
use App\Models\TrainingProgram;
use App\Models\TrainingProgramItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TrainingProgramController extends Controller
{
    /**
     * Display a listing of athletes for training programs.
     */
    public function index(Request $request)
    {
        $query = Athlete::query()
            ->withCount(['trainingPrograms as total_programs_count'])
            ->withCount(['trainingPrograms as completed_programs_count' => function ($q) {
                $q->where('status', 'completed');
            }])
            ->with(['trainingPrograms' => function ($q) {
                $q->latest('start_date')->select('id', 'athlete_id', 'name', 'slug', 'status', 'start_date');
            }]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('athlete_code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('gender') && in_array($request->input('gender'), ['L', 'P'])) {
            $query->where('gender', $request->input('gender'));
        }

        $athletes = $query->orderBy('full_name')->paginate(12)->withQueryString();

        return Inertia::render('TrainingPrograms/Index', [
            'athletes' => $athletes,
            'filters' => [
                'search' => $request->input('search', ''),
                'gender' => $request->input('gender', 'all'),
            ],
        ]);
    }

    /**
     * Display the athlete's training calendar and all their scheduled routines.
     */
    public function athleteCalendar(Athlete $athlete)
    {
        $athlete->load([
            'trainingPrograms.items.exercise',
            'trainingPrograms.assessment',
            'trainingPrograms.creator',
        ]);

        return Inertia::render('TrainingPrograms/AthleteCalendar', [
            'athlete' => $athlete,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $athletes = Athlete::orderBy('full_name')->get(['id', 'full_name', 'gender', 'height_cm', 'weight_kg', 'photo_path']);
        $exercises = Exercise::where('is_active', true)->orderBy('name')->get();

        $selectedAthleteId = $request->input('athlete_id');
        $assessmentId = $request->input('assessment_id');
        $selectedDate = $request->input('date', date('Y-m-d'));

        $initialData = [
            'name' => '',
            'athlete_id' => $selectedAthleteId ? (int)$selectedAthleteId : '',
            'dpa_assessment_id' => $assessmentId ? (int)$assessmentId : null,
            'status' => 'active',
            'start_date' => $selectedDate,
            'end_date' => null,
            'frequency_per_week' => 1,
            'duration_weeks' => 1,
            'scheduled_days' => [],
            'schedule_dates' => [$selectedDate],
            'completed_dates' => [],
            'session_notes' => [],
            'description' => '',
            'target_compensations' => [],
            'target_muscles_overactive' => [],
            'target_muscles_underactive' => [],
            'items' => [],
        ];

        // If generated from DPA Assessment
        if ($assessmentId || $selectedAthleteId) {
            $assessment = null;
            if ($assessmentId) {
                $assessment = DpaAssessment::with('details.compensation.exercises')->find($assessmentId);
            } elseif ($selectedAthleteId) {
                $assessment = DpaAssessment::with('details.compensation.exercises')
                    ->where('athlete_id', $selectedAthleteId)
                    ->latest()
                    ->first();
            }

            if ($assessment) {
                $initialData['dpa_assessment_id'] = $assessment->id;
                $athlete = $assessment->athlete ?? Athlete::find($selectedAthleteId);

                $initialData['name'] = "Program Korektif Postur • " . ($athlete ? $athlete->full_name : 'Atlet') . " (" . date('M Y') . ")";
                $initialData['athlete_id'] = $assessment->athlete_id;

                $compensations = $assessment->details->pluck('compensation')->filter();
                $targetCompNames = [];
                $overactiveMuscles = [];
                $underactiveMuscles = [];
                $generatedItems = [];
                $sortOrder = 0;

                foreach ($compensations as $comp) {
                    $targetCompNames[] = $comp->name;

                    // Parse overactive & underactive muscles
                    if ($comp->overactive_muscles) {
                        $parsed = array_map('trim', explode(',', str_replace(["\n", "\r", '-'], ',', $comp->overactive_muscles)));
                        $overactiveMuscles = array_merge($overactiveMuscles, array_filter($parsed));
                    }
                    if ($comp->underactive_muscles) {
                        $parsed = array_map('trim', explode(',', str_replace(["\n", "\r", '-'], ',', $comp->underactive_muscles)));
                        $underactiveMuscles = array_merge($underactiveMuscles, array_filter($parsed));
                    }

                    // 1. Pull linked exercises from pivot relation
                    $linkedExercises = $comp->exercises;
                    $phaseKeys = ['inhibit', 'lengthen', 'activate', 'integrate'];

                    foreach ($phaseKeys as $phaseKey) {
                        $phaseExercises = $linkedExercises->filter(function ($ex) use ($phaseKey) {
                            return $ex->pivot && strtolower($ex->pivot->phase) === strtolower($phaseKey);
                        });

                        if ($phaseExercises->isNotEmpty()) {
                            foreach ($phaseExercises as $ex) {
                                $alreadyAdded = collect($generatedItems)->contains(fn($item) => $item['phase'] === $phaseKey && $item['exercise_id'] === $ex->id);
                                if (!$alreadyAdded) {
                                    $generatedItems[] = [
                                        'id' => 'temp_' . uniqid(),
                                        'phase' => $phaseKey,
                                        'exercise_id' => $ex->id,
                                        'exercise_name' => $ex->name,
                                        'target_muscle' => $phaseKey === 'inhibit' || $phaseKey === 'lengthen'
                                            ? ($comp->overactive_muscles ? trim(explode(',', str_replace(["\n", "\r", '-'], ',', $comp->overactive_muscles))[0]) : 'Otot Overactive')
                                            : ($comp->underactive_muscles ? trim(explode(',', str_replace(["\n", "\r", '-'], ',', $comp->underactive_muscles))[0]) : 'Otot Underactive'),
                                        'sets' => '',
                                        'reps' => '',
                                        'duration_seconds' => null,
                                        'hold_seconds' => null,
                                        'tempo' => null,
                                        'rest_seconds' => null,
                                        'frequency' => null,
                                        'intensity' => null,
                                        'coaching_cues' => "Jaga postur dan alignment tubuh selama melakukan gerakan {$ex->name}.",
                                        'sort_order' => $sortOrder++,
                                    ];
                                }
                            }
                        }
                    }

                    // 2. Also extract text-based protocol fields from the compensation
                    $phaseMap = [
                        'inhibit' => $comp->exercises_smr,
                        'lengthen' => $comp->exercises_stretching,
                        'activate' => $comp->exercises_isometrics,
                        'integrate' => $comp->exercises_integrated,
                    ];

                    foreach ($phaseMap as $phaseKey => $rawText) {
                        if (empty($rawText)) continue;
                        $lines = array_filter(array_map('trim', preg_split('/[\r\n,]+/', $rawText)));
                        foreach ($lines as $line) {
                            $cleanName = trim(preg_replace('/^[•\-\*\d\.\)]+\s*/', '', $line));
                            if (empty($cleanName)) continue;

                            // Check if already in generatedItems
                            $alreadyAdded = collect($generatedItems)->contains(function ($item) use ($phaseKey, $cleanName) {
                                return $item['phase'] === $phaseKey && (
                                    stripos($item['exercise_name'], $cleanName) !== false ||
                                    stripos($cleanName, $item['exercise_name']) !== false
                                );
                            });

                            if ($alreadyAdded) continue;

                            // Find in exercises library
                            $matchedEx = $exercises->first(function ($e) use ($cleanName) {
                                return stripos($e->name, $cleanName) !== false || stripos($cleanName, $e->name) !== false;
                            });

                            $targetMuscle = '';
                            if ($phaseKey === 'inhibit' || $phaseKey === 'lengthen') {
                                $targetMuscle = $comp->overactive_muscles ? trim(explode(',', str_replace(["\n", "\r", '-'], ',', $comp->overactive_muscles))[0]) : 'Otot Overactive';
                            } else {
                                $targetMuscle = $comp->underactive_muscles ? trim(explode(',', str_replace(["\n", "\r", '-'], ',', $comp->underactive_muscles))[0]) : 'Otot Underactive';
                            }

                            $generatedItems[] = [
                                'id' => 'temp_' . uniqid(),
                                'phase' => $phaseKey,
                                'exercise_id' => $matchedEx ? $matchedEx->id : null,
                                'exercise_name' => $matchedEx ? $matchedEx->name : $cleanName,
                                'target_muscle' => $targetMuscle,
                                'sets' => '',
                                'reps' => '',
                                'duration_seconds' => null,
                                'hold_seconds' => null,
                                'tempo' => null,
                                'rest_seconds' => null,
                                'frequency' => null,
                                'intensity' => null,
                                'coaching_cues' => "Jaga postur dan alignment tubuh selama gerakan {$cleanName}.",
                                'sort_order' => $sortOrder++,
                            ];
                        }
                    }
                }

                $initialData['target_compensations'] = array_values(array_unique($targetCompNames));
                $initialData['target_muscles_overactive'] = array_values(array_unique($overactiveMuscles));
                $initialData['target_muscles_underactive'] = array_values(array_unique($underactiveMuscles));
                $initialData['items'] = $generatedItems;
                $initialData['description'] = "Program latihan korektif postur disusun berdasarkan temuan asesmen DPA (" . count($targetCompNames) . " kompensasi). Memuat " . count($generatedItems) . " gerakan terstruktur dalam 4 fase NASM.";
            }
        }

        return Inertia::render('TrainingPrograms/Form', [
            'program' => null,
            'initialData' => $initialData,
            'athletes' => $athletes,
            'exercises' => $exercises,
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
            'athlete_id' => 'required|exists:athletes,id',
            'dpa_assessment_id' => 'nullable|exists:dpa_assessments,id',
            'status' => 'required|in:draft,active,completed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'frequency_per_week' => 'nullable|integer|min:1|max:7',
            'duration_weeks' => 'nullable|integer|min:1|max:52',
            'scheduled_days' => 'nullable|array',
            'schedule_dates' => 'nullable|array',
            'completed_dates' => 'nullable|array',
            'session_notes' => 'nullable|array',
            'description' => 'nullable|string',
            'target_compensations' => 'nullable|array',
            'target_muscles_overactive' => 'nullable|array',
            'target_muscles_underactive' => 'nullable|array',
            'items' => 'required|array|min:1',
            'items.*.phase' => 'required|in:inhibit,lengthen,activate,integrate',
            'items.*.exercise_name' => 'required|string|max:255',
            'items.*.exercise_id' => 'nullable|exists:exercises,id',
            'items.*.target_muscle' => 'nullable|string|max:255',
            'items.*.sets' => 'required|integer|min:1|max:20',
            'items.*.reps' => 'nullable|string|max:50',
            'items.*.duration_seconds' => 'nullable|integer',
            'items.*.hold_seconds' => 'nullable|integer',
            'items.*.tempo' => 'nullable|string|max:50',
            'items.*.rest_seconds' => 'nullable|integer',
            'items.*.frequency' => 'nullable|string|max:100',
            'items.*.intensity' => 'nullable|string|max:100',
            'items.*.coaching_cues' => 'nullable|string',
            'items.*.sort_order' => 'nullable|integer',
        ]);

        DB::beginTransaction();
        try {
            $program = TrainingProgram::create([
                'athlete_id' => $validated['athlete_id'],
                'dpa_assessment_id' => $validated['dpa_assessment_id'] ?? null,
                'user_id' => auth()->id(),
                'name' => $validated['name'],
                'status' => $validated['status'],
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'frequency_per_week' => $validated['frequency_per_week'] ?? 3,
                'duration_weeks' => $validated['duration_weeks'] ?? 4,
                'scheduled_days' => $validated['scheduled_days'] ?? ['mon', 'wed', 'fri'],
                'schedule_dates' => $validated['schedule_dates'] ?? [],
                'completed_dates' => $validated['completed_dates'] ?? [],
                'session_notes' => $validated['session_notes'] ?? [],
                'description' => $validated['description'] ?? null,
                'target_compensations' => $validated['target_compensations'] ?? [],
                'target_muscles_overactive' => $validated['target_muscles_overactive'] ?? [],
                'target_muscles_underactive' => $validated['target_muscles_underactive'] ?? [],
            ]);

            foreach ($validated['items'] as $index => $itemData) {
                TrainingProgramItem::create([
                    'training_program_id' => $program->id,
                    'exercise_id' => $itemData['exercise_id'] ?? null,
                    'phase' => $itemData['phase'],
                    'exercise_name' => $itemData['exercise_name'],
                    'target_muscle' => $itemData['target_muscle'] ?? null,
                    'sets' => $itemData['sets'],
                    'reps' => $itemData['reps'],
                    'duration_seconds' => $itemData['duration_seconds'] ?? null,
                    'hold_seconds' => $itemData['hold_seconds'] ?? null,
                    'tempo' => $itemData['tempo'] ?? null,
                    'rest_seconds' => $itemData['rest_seconds'] ?? null,
                    'frequency' => $itemData['frequency'] ?? null,
                    'intensity' => $itemData['intensity'] ?? null,
                    'coaching_cues' => $itemData['coaching_cues'] ?? null,
                    'sort_order' => $itemData['sort_order'] ?? $index,
                ]);
            }

            DB::commit();

            return redirect()->route('training-programs.show', $program->slug)
                ->with('success', 'Program latihan korektif berhasil dibuat.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Gagal membuat program latihan: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(TrainingProgram $trainingProgram)
    {
        $trainingProgram->load([
            'athlete.trainingPrograms.items.exercise',
            'assessment.details.compensation',
            'creator',
            'items.exercise',
        ]);

        return Inertia::render('TrainingPrograms/Show', [
            'program' => $trainingProgram,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TrainingProgram $trainingProgram)
    {
        $trainingProgram->load(['items.exercise', 'athlete']);
        $athletes = Athlete::orderBy('full_name')->get(['id', 'full_name', 'gender', 'height_cm', 'weight_kg', 'photo_path']);
        $exercises = Exercise::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('TrainingPrograms/Form', [
            'program' => $trainingProgram,
            'initialData' => [
                'id' => $trainingProgram->id,
                'name' => $trainingProgram->name,
                'athlete_id' => $trainingProgram->athlete_id,
                'dpa_assessment_id' => $trainingProgram->dpa_assessment_id,
                'status' => $trainingProgram->status,
                'start_date' => $trainingProgram->start_date ? $trainingProgram->start_date->format('Y-m-d') : '',
                'end_date' => $trainingProgram->end_date ? $trainingProgram->end_date->format('Y-m-d') : '',
                'frequency_per_week' => $trainingProgram->frequency_per_week ?? 3,
                'duration_weeks' => $trainingProgram->duration_weeks ?? 4,
                'scheduled_days' => $trainingProgram->scheduled_days ?? ['mon', 'wed', 'fri'],
                'schedule_dates' => $trainingProgram->schedule_dates ?? [],
                'completed_dates' => $trainingProgram->completed_dates ?? [],
                'session_notes' => $trainingProgram->session_notes ?? [],
                'description' => $trainingProgram->description ?? '',
                'target_compensations' => $trainingProgram->target_compensations ?? [],
                'target_muscles_overactive' => $trainingProgram->target_muscles_overactive ?? [],
                'target_muscles_underactive' => $trainingProgram->target_muscles_underactive ?? [],
                'items' => $trainingProgram->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'phase' => $item->phase,
                        'exercise_id' => $item->exercise_id,
                        'exercise_name' => $item->exercise_name,
                        'target_muscle' => $item->target_muscle,
                        'sets' => $item->sets,
                        'reps' => $item->reps,
                        'duration_seconds' => $item->duration_seconds,
                        'hold_seconds' => $item->hold_seconds,
                        'tempo' => $item->tempo,
                        'rest_seconds' => $item->rest_seconds,
                        'frequency' => $item->frequency,
                        'intensity' => $item->intensity,
                        'coaching_cues' => $item->coaching_cues,
                        'sort_order' => $item->sort_order,
                    ];
                })->toArray(),
            ],
            'athletes' => $athletes,
            'exercises' => $exercises,
            'isEdit' => true,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TrainingProgram $trainingProgram)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'athlete_id' => 'required|exists:athletes,id',
            'status' => 'required|in:draft,active,completed',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'frequency_per_week' => 'nullable|integer|min:1|max:7',
            'duration_weeks' => 'nullable|integer|min:1|max:52',
            'scheduled_days' => 'nullable|array',
            'schedule_dates' => 'nullable|array',
            'completed_dates' => 'nullable|array',
            'session_notes' => 'nullable|array',
            'description' => 'nullable|string',
            'target_compensations' => 'nullable|array',
            'target_muscles_overactive' => 'nullable|array',
            'target_muscles_underactive' => 'nullable|array',
            'items' => 'required|array|min:1',
            'items.*.phase' => 'required|in:inhibit,lengthen,activate,integrate',
            'items.*.exercise_name' => 'required|string|max:255',
            'items.*.exercise_id' => 'nullable|exists:exercises,id',
            'items.*.target_muscle' => 'nullable|string|max:255',
            'items.*.sets' => 'required|integer|min:1|max:20',
            'items.*.reps' => 'nullable|string|max:50',
            'items.*.duration_seconds' => 'nullable|integer',
            'items.*.hold_seconds' => 'nullable|integer',
            'items.*.tempo' => 'nullable|string|max:50',
            'items.*.rest_seconds' => 'nullable|integer',
            'items.*.frequency' => 'nullable|string|max:100',
            'items.*.intensity' => 'nullable|string|max:100',
            'items.*.coaching_cues' => 'nullable|string',
            'items.*.sort_order' => 'nullable|integer',
        ]);

        DB::beginTransaction();
        try {
            $trainingProgram->update([
                'athlete_id' => $validated['athlete_id'],
                'name' => $validated['name'],
                'status' => $validated['status'],
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'frequency_per_week' => $validated['frequency_per_week'] ?? 3,
                'duration_weeks' => $validated['duration_weeks'] ?? 4,
                'scheduled_days' => $validated['scheduled_days'] ?? ['mon', 'wed', 'fri'],
                'schedule_dates' => $validated['schedule_dates'] ?? [],
                'completed_dates' => $validated['completed_dates'] ?? [],
                'session_notes' => $validated['session_notes'] ?? [],
                'description' => $validated['description'] ?? null,
                'target_compensations' => $validated['target_compensations'] ?? [],
                'target_muscles_overactive' => $validated['target_muscles_overactive'] ?? [],
                'target_muscles_underactive' => $validated['target_muscles_underactive'] ?? [],
            ]);

            // Replace items
            $trainingProgram->items()->delete();

            foreach ($validated['items'] as $index => $itemData) {
                TrainingProgramItem::create([
                    'training_program_id' => $trainingProgram->id,
                    'exercise_id' => $itemData['exercise_id'] ?? null,
                    'phase' => $itemData['phase'],
                    'exercise_name' => $itemData['exercise_name'],
                    'target_muscle' => $itemData['target_muscle'] ?? null,
                    'sets' => $itemData['sets'],
                    'reps' => $itemData['reps'],
                    'duration_seconds' => $itemData['duration_seconds'] ?? null,
                    'hold_seconds' => $itemData['hold_seconds'] ?? null,
                    'tempo' => $itemData['tempo'] ?? null,
                    'rest_seconds' => $itemData['rest_seconds'] ?? null,
                    'frequency' => $itemData['frequency'] ?? null,
                    'intensity' => $itemData['intensity'] ?? null,
                    'coaching_cues' => $itemData['coaching_cues'] ?? null,
                    'sort_order' => $itemData['sort_order'] ?? $index,
                ]);
            }

            DB::commit();

            return redirect()->route('training-programs.show', $trainingProgram->slug)
                ->with('success', 'Program latihan berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Gagal memperbarui program latihan: ' . $e->getMessage());
        }
    }

    /**
     * Toggle session completion or note on a specific calendar date.
     */
    public function toggleSession(Request $request, TrainingProgram $trainingProgram)
    {
        $validated = $request->validate([
            'date' => 'required|date_format:Y-m-d',
            'completed' => 'nullable|boolean',
            'note' => 'nullable|string',
        ]);

        $date = $validated['date'];
        $completedDates = $trainingProgram->completed_dates ?? [];
        $sessionNotes = $trainingProgram->session_notes ?? [];

        if (isset($validated['completed'])) {
            if ($validated['completed']) {
                if (!in_array($date, $completedDates)) {
                    $completedDates[] = $date;
                }
            } else {
                $completedDates = array_values(array_filter($completedDates, fn($d) => $d !== $date));
            }
        } else {
            // Toggle
            if (in_array($date, $completedDates)) {
                $completedDates = array_values(array_filter($completedDates, fn($d) => $d !== $date));
            } else {
                $completedDates[] = $date;
            }
        }

        if (isset($validated['note'])) {
            if (empty(trim($validated['note']))) {
                unset($sessionNotes[$date]);
            } else {
                $sessionNotes[$date] = trim($validated['note']);
            }
        }

        $trainingProgram->update([
            'completed_dates' => $completedDates,
            'session_notes' => $sessionNotes,
        ]);

        return back()->with('success', 'Status sesi kalender berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TrainingProgram $trainingProgram)
    {
        $trainingProgram->delete();

        return redirect()->route('training-programs.index')
            ->with('success', 'Program latihan berhasil dihapus.');
    }
}
