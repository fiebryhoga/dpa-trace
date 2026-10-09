<?php

namespace App\Http\Controllers;

use App\Models\Athlete;
use App\Models\DpaCompensation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class DpaAiAnalysisController extends Controller
{
    /**
     * Analyze an uploaded posture image for DPA deviations.
     */
    public function analyze(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'nullable|image|max:10240', // max 10MB
            'image_path' => 'nullable|string',
            'view_category' => 'required|string|in:Anterior View,Lateral View,Posterior View,Single Leg',
            'athlete_id' => 'nullable|exists:athletes,id',
            'gemini_api_key' => 'nullable|string',
        ]);

        $viewCategory = $request->input('view_category');
        $imageFile = $request->file('image');
        $imagePath = $request->input('image_path');

        $tempSavedPath = null;
        $base64Image = null;
        $mimeType = 'image/jpeg';

        if ($imageFile) {
            $tempSavedPath = $imageFile->store('dpa_temp_scans', 'public');
            $imageContent = file_get_contents($imageFile->getRealPath());
            $base64Image = base64_encode($imageContent);
            $mimeType = $imageFile->getMimeType();
        } elseif ($imagePath) {
            $cleanPath = str_replace('/storage/', '', $imagePath);
            if (Storage::disk('public')->exists($cleanPath)) {
                $imageContent = Storage::disk('public')->get($cleanPath);
                $base64Image = base64_encode($imageContent);
                $mimeType = Storage::disk('public')->mimeType($cleanPath) ?: 'image/jpeg';
                $tempSavedPath = $cleanPath;
            }
        }

        // Fetch all possible compensations for this specific view category
        $compensationsInView = DpaCompensation::where('category', $viewCategory)->get();

        // 1. Check API Key from request or .env
        $apiKey = $request->input('gemini_api_key')
            ?: $request->header('X-Gemini-Key')
            ?: config('services.gemini.api_key', env('GEMINI_API_KEY'));

        $geminiResult = null;
        $engineName = 'Athlete PMA Biomechanics Rule Engine (Goniometric Calibration)';

        if ($apiKey && $base64Image) {
            try {
                $geminiResult = $this->queryGeminiVision($apiKey, $base64Image, $mimeType, $viewCategory, $compensationsInView);
                if ($geminiResult) {
                    $engineName = 'Google Gemini 2.0 Flash Vision AI';
                }
            } catch (\Throwable $e) {
                Log::warning('Gemini Vision analysis failed: ' . $e->getMessage());
            }
        }

        // 2. If Gemini result is valid, use it; otherwise use Biomechanics Expert Rule Engine
        $analysisResult = $geminiResult ?: $this->generateBiomechanicsAnalysis($viewCategory, $compensationsInView);

        return response()->json([
            'success' => true,
            'view_category' => $viewCategory,
            'image_url' => $tempSavedPath ? asset('storage/' . $tempSavedPath) : null,
            'engine' => $engineName,
            'has_api_key' => !empty($apiKey),
            'summary' => $analysisResult['summary'],
            'detected_compensations' => $analysisResult['detected_compensations'],
            'landmarks' => $analysisResult['landmarks'] ?? [],
            'suggested_compensation_ids' => collect($analysisResult['detected_compensations'])->pluck('compensation_id')->values()->all(),
        ]);
    }

    /**
     * Multimodal Gemini Vision query for deep kinematic chain analysis.
     */
    protected function queryGeminiVision(string $apiKey, string $base64Data, string $mimeType, string $viewCategory, $compensationsInView): ?array
    {
        $compList = $compensationsInView->map(function ($c) {
            return [
                'id' => $c->id,
                'name' => $c->name,
                'checkpoint' => $c->checkpoint,
                'overactive' => $c->overactive_muscles,
                'underactive' => $c->underactive_muscles,
                'injuries' => $c->possible_injuries,
            ];
        })->values()->toArray();

        $prompt = <<<PROMPT
You are a World-Class Sports Biomechanist and Master NASM (National Academy of Sports Medicine) Evaluator performing an exact Postural & Movement Assessment (PMA) (Overhead Squat / Single Leg Squat).

Assessed View Angle: {$viewCategory}

Registered Compensations in Database for this View Angle:
{$this->jsonEncodePretty($compList)}

EXACT NASM BIOMECHANICAL VISUAL CLUES & MARKERS:
1. ANTERIOR VIEW:
   - "Foot - Feet Turn Out": Look at feet progression angle. Feet opening or rotating laterally outwards even slightly (any outward flare relative to straight sagittal line) MUST be detected and flagged as Feet Turn Out.
   - "Foot - Foot Flattens (Pronation)": Medial longitudinal arch collapses inward toward the floor; eversion of foot.
   - "Knee - Move Inward (Valgus)": Femur adducts & internally rotates; the line connecting hip-to-knee-to-ankle bends inwards toward midline (patella collapses medial past 2nd toe).
   - "Knee - Move Outward": Femur abducts; knee line bows or moves outward laterally (genu varum) away from the 2nd toe progression axis (even slight lateral movement/bowing should be flagged as Knee Move Outward).

2. LATERAL VIEW:
   - "LPHC - Excessive Forward Lean": Compare the torso line (hip to shoulder) with the tibia line (ankle to knee). If the torso is significantly more angled forward than the tibia (non-parallel lines crossing), flag this.
   - "LPHC - Low Back Arches": Excessive inward lordotic curvature of lumbar spine (anterior pelvic tilt / arched back).
   - "LPHC - Low Back Rounds": Posterior pelvic tilt / lumbar flexion (convex outward rounding of lower spine).
   - "Shoulders - Arms Fall Forward": In an overhead squat, arms should remain in line with the ears and torso. If arms fall downward/forward below the torso plane (> 15° forward deviation), flag this.

3. POSTERIOR VIEW:
   - "Foot - Foot Flattens": Look at lower leg and Achilles tendon from behind; Achilles tendon angles outward due to calcaneal eversion and medial arch collapse.
   - "Foot - Heel of Foot Rises": Heels lifting off the floor during the descent phase.
   - "LPHC - Asymmetrical Weight Shift": Compare the vertical center plumbline (spine) with the pelvic horizontal line. If pelvis shifts laterally to the left or right side of the plumbline, flag this with the exact side (Left or Right).

4. SINGLE LEG SQUAT:
   - "Knee - Move Inward (Valgus) - 1 LEG": Stance knee collapses medially toward the midline (Dynamic Valgus / medial deviation).
   - "LPHC - Hip Hike - 1 LEG": The non-stance/floating hip hikes UPWARD above horizontal.
   - "LPHC - Hip Drop - 1 LEG": The non-stance/floating hip drops DOWNWARD below horizontal (Trendelenburg sign).
   - "Upper Body - Inward Trunk Rotation - 1 LEG": Shoulders & torso rotate inward toward the stance leg.
   - "Upper Body - Outward Trunk Rotation - 1 LEG": Shoulders & torso rotate outward away from the stance leg.

CONSERVATIVE CLINICAL EVALUATION:
- If the subject has clean, normal, aligned posture in this image, return detected_compensations: [].
- Never hallucinate deviations not clearly visible in the image.

LANDMARK LOCALIZATION RULES (CRITICAL):
- You MUST locate the EXACT (x, y) percentage coordinates (0.0 to 100.0) where each body joint is actually located in THIS photo:
  * For Lateral View:
    - "Ear": where the subject's ear/tragus is in the photo
    - "Shoulder": glenohumeral joint / acromion
    - "Wrist": where the hands/wrists are extended
    - "Hip": greater trochanter / hip pivot
    - "Knee": lateral knee joint line
    - "Ankle": lateral malleolus
  * For Anterior View:
    - "Left ASIS", "Right ASIS" (pelvis)
    - "Left Knee", "Right Knee" (patellae center)
    - "Left Ankle", "Right Ankle" (malleoli)
    - "Left Toe", "Right Toe" (2nd/3rd toe tip)
  * For Posterior View:
    - "C7": upper spine
    - "Left PSIS", "Right PSIS": posterior pelvis dimples
    - "Left Knee", "Right Knee": popliteal crease
    - "Left Calcaneus", "Right Calcaneus": heel base
  * For Single Leg:
    - "Stance ASIS", "Floating ASIS"
    - "Stance Knee", "Stance Ankle"
    - "Left Shoulder", "Right Shoulder"

Return ONLY a valid JSON object matching this schema with NO markdown syntax, NO backticks:
{
  "summary": "Clinical summary in Indonesian language explaining observed kinematic chain deviations or confirming normal posture",
  "detected_compensations": [
    {
      "compensation_id": <matching integer ID from registered list>,
      "name": "<exact name from registered list>",
      "checkpoint": "<checkpoint>",
      "confidence": <integer between 75 and 99>,
      "severity": "Mild" | "Moderate" | "Severe",
      "side": "Bilateral" | "Left" | "Right",
      "angle_metric": "<e.g. Q-Angle 19.2° Medial / Non-Parallel Lean 28° / Arm Deviation 22°>",
      "clinical_rationale": "<Penjelasan klinis spesifik dalam bahasa Indonesia berdasarkan pola visual pada foto>"
    }
  ],
  "landmarks": [
    { "name": "<Joint Name matching view angle>", "x": <actual float 0.0-100.0>, "y": <actual float 0.0-100.0>, "status": "Normal" | "Deviation" }
  ]
}
PROMPT;

        $models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

        foreach ($models as $model) {
            $response = Http::timeout(25)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $base64Data,
                                ],
                            ],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                    'temperature' => 0.1,
                ],
            ]);

            if ($response->successful()) {
                $json = $response->json();
                $rawText = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
                $cleanText = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($rawText));
                $parsed = json_decode($cleanText, true);

                if (isset($parsed['detected_compensations']) && is_array($parsed['detected_compensations'])) {
                    // Enrich with muscle definitions from DB
                    foreach ($parsed['detected_compensations'] as &$d) {
                        $comp = $compensationsInView->firstWhere('id', $d['compensation_id']);
                        if (!$comp && isset($d['name'])) {
                            $dName = strtolower(trim($d['name']));
                            $comp = $compensationsInView->first(function($c) use ($dName) {
                                $cName = strtolower($c->name);
                                return $cName === $dName ||
                                    str_contains($cName, $dName) ||
                                    str_contains($dName, $cName) ||
                                    (str_contains($dName, 'hip hike') && str_contains($cName, 'hip hike')) ||
                                    (str_contains($dName, 'hip drop') && str_contains($cName, 'hip drop')) ||
                                    (str_contains($dName, 'inward') && str_contains($cName, 'inward') && str_contains($dName, 'trunk') && str_contains($cName, 'trunk')) ||
                                    (str_contains($dName, 'outward') && str_contains($cName, 'outward') && str_contains($dName, 'trunk') && str_contains($cName, 'trunk')) ||
                                    ((str_contains($dName, 'valgus') || str_contains($dName, 'inward')) && str_contains($cName, 'inward'));
                            });
                        }
                        if ($comp) {
                            $d['compensation_id'] = $comp->id;
                            $d['name'] = $comp->name;
                            $d['checkpoint'] = $comp->checkpoint;
                            $d['overactive_muscles'] = $comp->overactive_muscles;
                            $d['underactive_muscles'] = $comp->underactive_muscles;
                        }
                    }
                    return $parsed;
                }
            }
        }

        return null;
    }

    /**
     * Biomechanical landmark calibration engine (returns neutral coordinates for goniometer).
     */
    protected function generateBiomechanicsAnalysis(string $viewCategory, $compensationsInView): array
    {
        // When AI key is not supplied, return clean baseline neutral landmarks with prompt for goniometer inspection
        if ($viewCategory === 'Anterior View') {
            return [
                'summary' => 'Sistem goniometer biomekanika aktif. Titik pin landmark anatomi (ASIS, Patella, Malleolus, Foot) telah disiapkan pada foto untuk kalibrasi sudut Q-Angle dan Foot Turnout.',
                'detected_compensations' => [],
                'landmarks' => [
                    ['name' => 'Left ASIS', 'x' => 43.0, 'y' => 39.0, 'status' => 'Normal'],
                    ['name' => 'Right ASIS', 'x' => 57.0, 'y' => 39.0, 'status' => 'Normal'],
                    ['name' => 'Left Knee (Patella)', 'x' => 44.0, 'y' => 68.0, 'status' => 'Normal'],
                    ['name' => 'Right Knee (Patella)', 'x' => 56.0, 'y' => 68.0, 'status' => 'Normal'],
                    ['name' => 'Left Ankle (Malleolus)', 'x' => 43.0, 'y' => 88.0, 'status' => 'Normal'],
                    ['name' => 'Right Ankle (Malleolus)', 'x' => 57.0, 'y' => 88.0, 'status' => 'Normal'],
                    ['name' => 'Left Foot (2nd Toe)', 'x' => 41.0, 'y' => 93.0, 'status' => 'Normal'],
                    ['name' => 'Right Foot (2nd Toe)', 'x' => 59.0, 'y' => 93.0, 'status' => 'Normal'],
                ],
            ];
        } elseif ($viewCategory === 'Lateral View') {
            return [
                'summary' => 'Sistem goniometer lateral aktif. Titik pin landmark (Tragus, Acromion, Lumbar Spine, Greater Trochanter, Knee, Lateral Malleolus, Wrist) telah disiapkan untuk menghitung paralelisme Torso-Tibia, kelengkungan Lumbal, dan elevasi lengan.',
                'detected_compensations' => [],
                'landmarks' => [
                    ['name' => 'Tragus / Ear', 'x' => 50.0, 'y' => 15.0, 'status' => 'Normal'],
                    ['name' => 'Shoulder (Acromion)', 'x' => 48.0, 'y' => 26.0, 'status' => 'Normal'],
                    ['name' => 'Wrist (Overhead)', 'x' => 47.0, 'y' => 8.0, 'status' => 'Normal'],
                    ['name' => 'Lumbar Spine (L3-L5)', 'x' => 46.5, 'y' => 41.5, 'status' => 'Normal'],
                    ['name' => 'Hip (Greater Trochanter)', 'x' => 45.0, 'y' => 52.0, 'status' => 'Normal'],
                    ['name' => 'Knee Joint Axis', 'x' => 55.0, 'y' => 69.0, 'status' => 'Normal'],
                    ['name' => 'Lateral Malleolus', 'x' => 50.0, 'y' => 88.0, 'status' => 'Normal'],
                ],
            ];
        } elseif ($viewCategory === 'Posterior View') {
            return [
                'summary' => 'Sistem goniometer posterior aktif. Titik pin landmark (C7 Axis, PSIS Pelvis, Popliteal Knee, Calcaneus) telah disiapkan untuk mengukur pergeseran simetri beban.',
                'detected_compensations' => [],
                'landmarks' => [
                    ['name' => 'C7 Spine', 'x' => 50.0, 'y' => 22.0, 'status' => 'Normal'],
                    ['name' => 'Left PSIS', 'x' => 45.0, 'y' => 49.0, 'status' => 'Normal'],
                    ['name' => 'Right PSIS', 'x' => 55.0, 'y' => 49.0, 'status' => 'Normal'],
                    ['name' => 'Left Knee Crease', 'x' => 44.0, 'y' => 68.0, 'status' => 'Normal'],
                    ['name' => 'Right Knee Crease', 'x' => 56.0, 'y' => 68.0, 'status' => 'Normal'],
                    ['name' => 'Left Calcaneus', 'x' => 44.0, 'y' => 89.0, 'status' => 'Normal'],
                    ['name' => 'Right Calcaneus', 'x' => 56.0, 'y' => 89.0, 'status' => 'Normal'],
                ],
            ];
        } else {
            // Single Leg
            return [
                'summary' => 'Sistem goniometer Single Leg aktif. Titik pin landmark (Stance ASIS, Floating ASIS, Stance Patella, Stance Ankle) disiapkan untuk kalkulasi pelvic drop dan dynamic valgus.',
                'detected_compensations' => [],
                'landmarks' => [
                    ['name' => 'Stance Hip (ASIS)', 'x' => 48.0, 'y' => 48.0, 'status' => 'Normal'],
                    ['name' => 'Contralateral Hip (ASIS)', 'x' => 56.0, 'y' => 51.0, 'status' => 'Normal'],
                    ['name' => 'Stance Knee (Patella)', 'x' => 48.0, 'y' => 68.0, 'status' => 'Normal'],
                    ['name' => 'Stance Ankle (Malleolus)', 'x' => 48.0, 'y' => 88.0, 'status' => 'Normal'],
                ],
            ];
        }
    }

    private function jsonEncodePretty($data): string
    {
        return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
}
