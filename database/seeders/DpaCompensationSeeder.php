<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DpaCompensation;
use App\Models\Exercise;
use Illuminate\Support\Str;

class DpaCompensationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            // ==========================================
            // 1. ANTERIOR VIEW
            // ==========================================
            [
                'category' => 'Anterior View',
                'checkpoint' => 'Foot & Ankle',
                'name' => 'Foot - Feet Turn Out',
                'overactive_muscles' => "Soleus\nLat. Gastrocnemius\nBiceps Femoris (short head)\nTensor Fascia Latae (TFL)",
                'underactive_muscles' => "Med. Gastrocnemius\nMed. Hamstring\nGluteus Medius / Maximus\nGracilis\nPopliteus\nSartorius",
                'possible_injuries' => "Plantar fasciitis\nAchilles tendinopathy\nMedial tibial stress syndrome\nAnkle sprains\nTendinopathy (jumper's knee)",
                'exercises_smr' => "Gastrocnemius / Soleus\nBiceps Femoris (short head)\nTFL / IT Band",
                'exercises_stretching' => "Static Gastrocnemius stretch\nStatic Soleus stretch\nStanding TFL stretch",
                'exercises_isometrics' => "Anterior Tibialis strengthening\nPosterior Tibialis activation\nMedial Hamstring activation",
                'exercises_integrated' => "Step-up to balance with mini band\nSingle-leg balance reach",
            ],
            [
                'category' => 'Anterior View',
                'checkpoint' => 'Foot & Ankle',
                'name' => 'Foot - Foot Flattens (Pronation)',
                'overactive_muscles' => "Peroneal Complex\nLat. Gastrocnemius\nBiceps Femoris\nTFL",
                'underactive_muscles' => "Anterior Tibialis\nPosterior Tibialis\nMed. Gastrocnemius\nGluteus Medius",
                'possible_injuries' => "Plantar fasciitis\nAchilles tendinopathy\nMedial tibial stress syndrome\nAnkle sprains\nTendinopathy (jumper's knee)",
                'exercises_smr' => "Lateral Gastrocnemius & Peroneals\nBiceps Femoris (short head)",
                'exercises_stretching' => "Gastrocnemius / Soleus static stretch\nPeroneal stretch",
                'exercises_isometrics' => "Short foot exercise\nPosterior Tibialis calf raises\nGluteus Medius clamshell",
                'exercises_integrated' => "Single-leg Romanian Deadlift to balance\nMultiplanar step-up",
            ],
            [
                'category' => 'Anterior View',
                'checkpoint' => 'Knee',
                'name' => 'Knee - Move Inward (Valgus)',
                'overactive_muscles' => "Adductor Complex\nBiceps Femoris (short head)\nTFL\nLat. Gastrocnemius\nVastus Lateralis",
                'underactive_muscles' => "Med. Hamstring\nMed. Gastrocnemius\nGluteus Medius / Maximus\nVastus Medialis Oblique (VMO)\nAnterior Tibialis\nPosterior Tibialis",
                'possible_injuries' => "Patellar tendinopathy (jumper's knee)\nPatellofemoral Syndrome\nACL Injury\nIT band tendonitis",
                'exercises_smr' => "Adductors foam roll\nTFL / IT-band foam roll\nLateral thigh foam roll",
                'exercises_stretching' => "Standing adductor stretch\nSide-lying TFL stretch\nSupine piriformis stretch",
                'exercises_isometrics' => "Side-lying hip abduction\nBanded glute bridge\nTerminal knee extension (VMO)",
                'exercises_integrated' => "Squat to overhead press with loop band above knees\nMultiplanar lunges to balance",
            ],
            [
                'category' => 'Anterior View',
                'checkpoint' => 'Knee',
                'name' => 'Knee - Move Outward',
                'overactive_muscles' => "Piriformis\nBiceps Femoris\nTFL / Gluteus Minimus",
                'underactive_muscles' => "Adductors Complex\nMed. Hamstring\nGluteus Maximus",
                'possible_injuries' => "Patellar tendinopathy (jumper's knee)\nPatellofemoral Syndrome\nACL Injury\nIT band tendonitis",
                'exercises_smr' => "Piriformis / Gluteal complex foam roll\nTFL roll",
                'exercises_stretching' => "Figure-4 piriformis stretch\nSeated glute stretch",
                'exercises_isometrics' => "Ball squeeze bridge (adductor activation)\nAdductor side plank raise",
                'exercises_integrated' => "Squat with ball squeeze between knees\nForward lunge inline",
            ],

            // ==========================================
            // 2. LATERAL VIEW
            // ==========================================
            [
                'category' => 'Lateral View',
                'checkpoint' => 'LPHC',
                'name' => 'LPHC - Excessive Forward Lean',
                'overactive_muscles' => "Soleus\nGastrocnemius\nHip Flexor Complex\nPiriformis\nAbdominal Complex (rectus abdominis, external oblique)",
                'underactive_muscles' => "Anterior Tibialis\nGluteus Maximus\nErector Spinae\nIntrinsic Core Stabilizers (transverse abdominis, multifidus, transversospinalis, internal oblique, pelvic floor muscles)",
                'possible_injuries' => "Hamstring, quad & groin strain\nLow back pain",
                'exercises_smr' => "Gastrocnemius & Soleus\nQuadriceps / Hip Flexors",
                'exercises_stretching' => "Kneeling hip flexor stretch\nCalf wall stretch",
                'exercises_isometrics' => "Bird-dog holds\nProne back extension (Cobra)\nAnterior Tibialis toe raises",
                'exercises_integrated' => "Ball wall squat with upright torso\nGoblet squat with vertical chest cue",
            ],
            [
                'category' => 'Lateral View',
                'checkpoint' => 'LPHC',
                'name' => 'LPHC - Low Back Arches',
                'overactive_muscles' => "Hip Flexor Complex\nErector Spinae\nLatissimus Dorsi",
                'underactive_muscles' => "Gluteus Maximus\nHamstrings\nIntrinsic Core Stabilizers",
                'possible_injuries' => "Hamstring, quad & groin strain\nLow back pain",
                'exercises_smr' => "Hip flexors / Quads\nLatissimus dorsi\nThoracolumbar fascia",
                'exercises_stretching' => "Half-kneeling psoas stretch\nChild's pose with lat stretch",
                'exercises_isometrics' => "Posterior pelvic tilt deadbugs\nGlute bridge with neutral spine\nPlank with core bracing",
                'exercises_integrated' => "Squat to row with cable/tubing\nReverse lunge to balance",
            ],
            [
                'category' => 'Lateral View',
                'checkpoint' => 'LPHC',
                'name' => 'LPHC - Low Back Rounds',
                'overactive_muscles' => "Hamstrings\nAdductor Magnus\nRectus Abdominis\nExternal Obliques",
                'underactive_muscles' => "Gluteus Maximus\nErector Spinae\nIntrinsic Core Stabilizers\nHip Flexor Complex\nLatissimus Dorsi",
                'possible_injuries' => "Hamstring, quad & groin strain\nLow back pain",
                'exercises_smr' => "Hamstrings complex\nAdductor magnus",
                'exercises_stretching' => "Supine hamstring stretch\nAdductor magnus stretch",
                'exercises_isometrics' => "Quadruped hip extension\nProne cobra holds\nPelvic clock exercises",
                'exercises_integrated' => "Ball wall squat with reach\nKettlebell deadlift with hip hinge focus",
            ],
            [
                'category' => 'Lateral View',
                'checkpoint' => 'Shoulders',
                'name' => 'Shoulders - Arms Fall Forward',
                'overactive_muscles' => "Latissimus Dorsi\nPectoralis Major / Minor\nCoracobrachialis\nTeres Major",
                'underactive_muscles' => "Mid / Lower Trapezius\nRhomboids\nPosterior Deltoid\nRotator Cuff",
                'possible_injuries' => "Headaches\nBiceps tendonitis\nShoulder injuries",
                'exercises_smr' => "Latissimus dorsi\nPectoralis minor (trigger point ball)\nThoracic spine extension roll",
                'exercises_stretching' => "Doorway pec stretch\nSide-lying open book thoracic stretch\nOverhead lat stretch",
                'exercises_isometrics' => "Prone Y-T-W raises\nBand pull-aparts\nExternal shoulder rotation with band",
                'exercises_integrated' => "Squat to overhead press (dumbbells/stick)\nCable face-pull with external rotation",
            ],

            // ==========================================
            // 3. POSTERIOR VIEW
            // ==========================================
            [
                'category' => 'Posterior View',
                'checkpoint' => 'Foot & Ankle',
                'name' => 'Foot - Foot Flattens',
                'overactive_muscles' => "Peroneal Complex\nLat. Gastrocnemius\nBiceps Femoris (short head)\nTFL",
                'underactive_muscles' => "Anterior Tibialis\nPosterior Tibialis\nMed. Gastrocnemius\nGluteus Medius",
                'possible_injuries' => "Plantar fasciitis\nAchilles tendinopathy\nMedial tibial stress syndrome\nAnkle sprains\nPatellar Tendinopathy (jumper's knee)",
                'exercises_smr' => "Lateral gastrocnemius & peroneals\nBiceps femoris",
                'exercises_stretching' => "Gastrocnemius/soleus static stretch\nBiceps femoris stretch",
                'exercises_isometrics' => "Posterior tibialis calf raises\nAnterior tibialis dorsiflexion",
                'exercises_integrated' => "Step-up to balance\nSingle-leg balance reach",
            ],
            [
                'category' => 'Posterior View',
                'checkpoint' => 'Foot & Ankle',
                'name' => 'Foot - Heel of Foot Rises',
                'overactive_muscles' => "Soleus",
                'underactive_muscles' => "Anterior Tibialis",
                'possible_injuries' => "Plantar fasciitis\nAchilles tendinopathy\nMedial tibial stress syndrome\nAnkle sprains\nPatellar Tendinopathy (jumper's knee)",
                'exercises_smr' => "Soleus & deep calf roller\nAchilles tendon SMR",
                'exercises_stretching' => "Knee-to-wall ankle mobility stretch\nStair drop calf stretch",
                'exercises_isometrics' => "Anterior tibialis heel walks\nBanded dorsiflexion",
                'exercises_integrated' => "Overhead squat on level surface with heel down focus",
            ],
            [
                'category' => 'Posterior View',
                'checkpoint' => 'LPHC',
                'name' => 'LPHC - Asymmetrical Weight Shift',
                'overactive_muscles' => "Adductor Complex\nTFL (same side of shift)\nGastrocnemius / Soleus\nPiriformis\nBicep Femoris\nGluteus Medius (opposite side of shift)",
                'underactive_muscles' => "Gluteus Medius (same side of shift)\nAnterior Tibialis\nAdductor Complex (opposite side of shift)",
                'possible_injuries' => "Hamstring, Quad & Groin strain\nLow back pain\nSI joint pain",
                'exercises_smr' => "Adductors and TFL/IT-band (shift side)\nPiriformis and calves (opposite side)",
                'exercises_stretching' => "Adductors & TFL (shift side)\nPiriformis & calves (opposite side)",
                'exercises_isometrics' => "Gluteus medius side plank (shift side)\nAdductor squeeze (opposite side)",
                'exercises_integrated' => "Single-leg balance reach\nLateral lunge to balance",
            ],

            // ==========================================
            // 4. SINGLE LEG ASSESSMENT (1 LEG)
            // ==========================================
            [
                'category' => 'Single Leg',
                'checkpoint' => 'Knee',
                'name' => 'Knee - Move Inward (Valgus) - 1 LEG',
                'overactive_muscles' => "Adductor Complex\nBicep Femoris (short head)\nTFL\nLat. Gastrocnemius\nVastus Lateralis",
                'underactive_muscles' => "Med. Hamstring\nMed. Gastrocnemius\nGluteus Medius / Maximus\nVMO",
                'possible_injuries' => "Patellar tendinopathy (jumper's knee)\nPatellofemoral Syndrome\nACL Injury\nIT band tendonitis",
                'exercises_smr' => "Adductors, TFL, IT-band, biceps femoris (short head)",
                'exercises_stretching' => "Adductors static stretch, TFL stretch, biceps femoris stretch",
                'exercises_isometrics' => "Single-leg glute bridge\nBanded lateral monster walks\nClamshells with hold",
                'exercises_integrated' => "Single-leg squat to box\nMultiplanar step-up to balance",
            ],
            [
                'category' => 'Single Leg',
                'checkpoint' => 'LPHC',
                'name' => 'LPHC - Hip Hike - 1 LEG',
                'overactive_muscles' => "Quadratus Lumborum (opposite side of stance leg)\nTFL / Gluteus Minimus (same side as stance leg)",
                'underactive_muscles' => "Adductor Complex (same side as stance leg)\nGluteus Medius (same side)",
                'possible_injuries' => "Lower back strain\nLateral hip pain\nPelvic asymmetry",
                'exercises_smr' => "Quadratus lumborum & TFL",
                'exercises_stretching' => "Side-lying QL stretch\nTFL stretch",
                'exercises_isometrics' => "Pelvic drop and lift on step\nStanding gluteus medius isometric hold",
                'exercises_integrated' => "Single-leg touchdown squat with level pelvis",
            ],
            [
                'category' => 'Single Leg',
                'checkpoint' => 'LPHC',
                'name' => 'LPHC - Hip Drop - 1 LEG',
                'overactive_muscles' => "Adductor Complex (same side as stance leg)",
                'underactive_muscles' => "Gluteus Medius (same side as stance leg)\nQuadratus Lumborum (same side as stance leg)",
                'possible_injuries' => "Trochanteric bursitis\nIT-band syndrome\nKnee valgus collapse",
                'exercises_smr' => "Adductor complex SMR",
                'exercises_stretching' => "Adductor stretch",
                'exercises_isometrics' => "Side plank with top leg lift\nGluteus medius wall push",
                'exercises_integrated' => "Single-leg balance with contralateral dumbbell reach",
            ],
            [
                'category' => 'Single Leg',
                'checkpoint' => 'Upper Body',
                'name' => 'Upper Body - Inward Trunk Rotation - 1 LEG',
                'overactive_muscles' => "Internal Oblique (same side as stance leg)\nExternal Oblique (opposite side of stance leg)\nTFL (same side)\nAdductor Complex (same side as stance leg)",
                'underactive_muscles' => "Internal Oblique (opposite side of stance leg)\nExternal Oblique (same side as stance leg)\nGluteus Medius / Maximus",
                'possible_injuries' => "Rotational spine torque\nLower back sprain",
                'exercises_smr' => "Adductors and TFL",
                'exercises_stretching' => "Seated rotational trunk stretch",
                'exercises_isometrics' => "Pallof press holds\nAnti-rotation planks",
                'exercises_integrated' => "Single-leg cable chop with anti-rotation control",
            ],
            [
                'category' => 'Single Leg',
                'checkpoint' => 'Upper Body',
                'name' => 'Upper Body - Outward Trunk Rotation - 1 LEG',
                'overactive_muscles' => "Internal Oblique (opposite side of stance leg)\nExternal Oblique (same side as stance leg)\nPiriformis (same side as stance leg)",
                'underactive_muscles' => "Internal Oblique (same side)\nExternal Oblique (opposite side of stance leg)\nAdductor Complex (opposite side of stance leg)\nGluteus Medius / Maximus",
                'possible_injuries' => "Pelvic-lumbar instability\nSacroiliac joint irritation",
                'exercises_smr' => "Piriformis & gluteal foam roll",
                'exercises_stretching' => "Piriformis figure-4 stretch",
                'exercises_isometrics' => "Pallof press with step\nSide plank rotation control",
                'exercises_integrated' => "Single-leg cable lift / diagonal reach",
            ],
        ];

        // Clean out and synchronize exact records
        $currentNames = collect($data)->pluck('name')->all();

        foreach ($data as $item) {
            $slug = Str::slug($item['name']);
            $compensation = DpaCompensation::updateOrCreate(
                ['name' => $item['name']],
                array_merge($item, ['slug' => $slug])
            );

            // Link exercises to master exercises table and pivot
            $phases = [
                'Inhibit' => array_filter(array_map('trim', explode("\n", $item['exercises_smr'] ?? ''))),
                'Lengthen' => array_filter(array_map('trim', explode("\n", $item['exercises_stretching'] ?? ''))),
                'Activate' => array_filter(array_map('trim', explode("\n", $item['exercises_isometrics'] ?? ''))),
                'Integrate' => array_filter(array_map('trim', explode("\n", $item['exercises_integrated'] ?? ''))),
            ];

            $syncData = [];
            foreach ($phases as $phase => $names) {
                foreach ($names as $idx => $name) {
                    if (!$name) continue;
                    $exercise = Exercise::firstOrCreate(
                        ['name' => $name],
                        [
                            'category' => $phase,
                            'instructions' => "Latihan korektif fase {$phase} untuk deviasi {$item['name']}.",
                            'is_active' => true,
                        ]
                    );
                    $syncData[$exercise->id] = ['phase' => $phase, 'sort_order' => $idx];
                }
            }

            $compensation->exercises()->sync($syncData);
        }

        // Delete any old outdated compensations that are no longer in the standard table
        DpaCompensation::whereNotIn('name', $currentNames)->delete();
    }
}
