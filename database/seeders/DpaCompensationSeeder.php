<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DpaCompensation;

class DpaCompensationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            // --- ANTERIOR VIEW ---
            [
                'category' => 'Anterior View',
                'name' => 'Foot - Feet Turn Out',
                'checkpoint' => 'Foot & Ankle',
                'overactive_muscles' => "Soleus\nLateral Gastrocnemius\nBiceps Femoris (short head)\nTensor Fasciae Latae (TFL)",
                'underactive_muscles' => "Medial Gastrocnemius\nMedial Hamstring\nGracilis\nSartorius\nPopliteus",
                'possible_injuries' => "Plantar fasciitis\nAchilles tendinopathy\nMedial tibial stress syndrome\nAnkle sprains\nPatellar tendinopathy",
                'exercises_smr' => "Gastrocnemius / Soleus\nBiceps Femoris (short head)\nTFL / IT Band",
                'exercises_stretching' => "Static Gastrocnemius stretch\nStatic Soleus stretch\nStanding TFL stretch",
                'exercises_isometrics' => "Anterior Tibialis strengthening\nPosterior Tibialis activation\nMedial Hamstring activation",
                'exercises_integrated' => "Step-up to balance with mini band\nSingle-leg balance reach",
            ],
            [
                'category' => 'Anterior View',
                'name' => 'Foot - Foot Flattens (Pronation)',
                'checkpoint' => 'Foot & Ankle',
                'overactive_muscles' => "Peroneal Complex\nLateral Gastrocnemius\nBiceps Femoris (short head)\nTFL",
                'underactive_muscles' => "Anterior Tibialis\nPosterior Tibialis\nMedial Gastrocnemius\nGluteus Medius",
                'possible_injuries' => "Plantar fasciitis\nShin splints\nAnkle sprain\nPatellar tendinopathy",
                'exercises_smr' => "Lateral Gastrocnemius & Peroneals\nBiceps Femoris (short head)",
                'exercises_stretching' => "Gastrocnemius / Soleus static stretch\nPeroneal stretch",
                'exercises_isometrics' => "Short foot exercise\nPosterior Tibialis calf raises\nGluteus Medius clamshell",
                'exercises_integrated' => "Single-leg Romanian Deadlift to balance\nMultiplanar step-up",
            ],
            [
                'category' => 'Anterior View',
                'name' => 'Knee - Move Inward (Knee Valgus)',
                'checkpoint' => 'Knee',
                'overactive_muscles' => "Adductor Complex\nBiceps Femoris (short head)\nTFL / IT-Band\nVastus Lateralis\nLateral Gastrocnemius",
                'underactive_muscles' => "Gluteus Medius\nGluteus Maximus\nVastus Medialis Oblique (VMO)\nAnterior / Posterior Tibialis",
                'possible_injuries' => "ACL injury & strain\nPatellofemoral pain syndrome (Runner's knee)\nIT-band friction syndrome\nMeniscus tear",
                'exercises_smr' => "Adductors foam roll\nTFL / IT-band foam roll\nLateral thigh foam roll",
                'exercises_stretching' => "Standing adductor stretch\nSide-lying TFL stretch\nSupine piriformis stretch",
                'exercises_isometrics' => "Side-lying hip abduction\nBanded glute bridge\nTerminal knee extension (VMO)",
                'exercises_integrated' => "Squat to overhead press with loop band above knees\nMultiplanar lunges to balance",
            ],
            [
                'category' => 'Anterior View',
                'name' => 'Knee - Move Outward (Knee Varus)',
                'checkpoint' => 'Knee',
                'overactive_muscles' => "Piriformis\nGluteus Medius (posterior fibers)\nGluteus Minimus\nTFL",
                'underactive_muscles' => "Adductor Complex\nMedial Hamstring Complex\nGracilis",
                'possible_injuries' => "Lateral meniscus strain\nIT-band tendinopathy\nLateral knee pain",
                'exercises_smr' => "Piriformis / Gluteal complex foam roll\nTFL roll",
                'exercises_stretching' => "Figure-4 piriformis stretch\nSeated glute stretch",
                'exercises_isometrics' => "Ball squeeze bridge (adductor activation)\nAdductor side plank raise",
                'exercises_integrated' => "Squat with ball squeeze between knees\nForward lunge inline",
            ],

            // --- LATERAL VIEW ---
            [
                'category' => 'Lateral View',
                'name' => 'LPHC - Excessive Forward Lean',
                'checkpoint' => 'LPHC',
                'overactive_muscles' => "Soleus\nGastrocnemius\nHip Flexor Complex (Psoas, Rectus Femoris)\nAbdominal Complex",
                'underactive_muscles' => "Anterior Tibialis\nGluteus Maximus\nErector Spinae\nIntrinsic Core Stabilizers",
                'possible_injuries' => "Low back pain & disc strain\nHip impingement\nHamstring strain",
                'exercises_smr' => "Gastrocnemius & Soleus\nQuadriceps / Hip Flexors",
                'exercises_stretching' => "Kneeling hip flexor stretch\nCalf wall stretch",
                'exercises_isometrics' => "Bird-dog holds\nProne back extension (Cobra)\nAnterior Tibialis toe raises",
                'exercises_integrated' => "Ball wall squat with upright torso\nGoblet squat with vertical chest cue",
            ],
            [
                'category' => 'Lateral View',
                'name' => 'LPHC - Low Back Arches (Anterior Pelvic Tilt)',
                'checkpoint' => 'LPHC',
                'overactive_muscles' => "Hip Flexor Complex (Psoas, TFL, Rectus Femoris)\nErector Spinae\nLatissimus Dorsi",
                'underactive_muscles' => "Gluteus Maximus\nHamstring Complex\nIntrinsic Core Stabilizers (Transversus Abdominis)",
                'possible_injuries' => "Lumbar facet joint syndrome\nSacroiliac (SI) joint pain\nHip labral strain",
                'exercises_smr' => "Hip flexors / Quads\nLatissimus dorsi\nThoracolumbar fascia",
                'exercises_stretching' => "Half-kneeling psoas stretch\nChild's pose with lat stretch",
                'exercises_isometrics' => "Posterior pelvic tilt deadbugs\nGlute bridge with neutral spine\nPlank with core bracing",
                'exercises_integrated' => "Squat to row with cable/tubing\nReverse lunge to balance",
            ],
            [
                'category' => 'Lateral View',
                'name' => 'LPHC - Low Back Rounds (Posterior Pelvic Tilt)',
                'checkpoint' => 'LPHC',
                'overactive_muscles' => "Hamstring Complex\nAdductor Magnus\nRectus Abdominis\nExternal Obliques",
                'underactive_muscles' => "Gluteus Maximus\nErector Spinae\nIntrinsic Core Stabilizers\nHip Flexor Complex",
                'possible_injuries' => "Lumbar disc herniation\nLower back muscle spasms\nHamstring strain",
                'exercises_smr' => "Hamstrings complex\nAdductor magnus",
                'exercises_stretching' => "Supine hamstring stretch\nAdductor magnus stretch",
                'exercises_isometrics' => "Quadruped hip extension\nProne cobra holds\nPelvic clock exercises",
                'exercises_integrated' => "Ball wall squat with reach\nKettlebell deadlift with hip hinge focus",
            ],
            [
                'category' => 'Lateral View',
                'name' => 'Shoulders - Arms Fall Forward',
                'checkpoint' => 'Shoulders & Thoracic',
                'overactive_muscles' => "Latissimus Dorsi\nPectoralis Major / Minor\nCoracobrachialis\nTeres Major",
                'underactive_muscles' => "Mid / Lower Trapezius\nRhomboids\nPosterior Deltoid\nRotator Cuff (Infraspinatus, Teres Minor)",
                'possible_injuries' => "Shoulder impingement\nRotator cuff tendinitis\nThoracic outlet tension\nCervicogenic headaches",
                'exercises_smr' => "Latissimus dorsi\nPectoralis minor (trigger point ball)\nThoracic spine extension roll",
                'exercises_stretching' => "Doorway pec stretch\nSide-lying open book thoracic stretch\nOverhead lat stretch",
                'exercises_isometrics' => "Prone Y-T-W raises\nBand pull-aparts\nExternal shoulder rotation with band",
                'exercises_integrated' => "Squat to overhead press (dumbbells/stick)\nCable face-pull with external rotation",
            ],
            [
                'category' => 'Lateral View',
                'name' => 'Head - Forward Head Posture',
                'checkpoint' => 'Head & Neck',
                'overactive_muscles' => "Upper Trapezius\nSternocleidomastoid (SCM)\nLevator Scapulae\nScalenes",
                'underactive_muscles' => "Deep Cervical Flexors (Longus Colli, Longus Capitis)\nLower Trapezius\nRhomboids",
                'possible_injuries' => "Cervical spine strain\nTension headaches\nNeck stiffness\nShoulder instability",
                'exercises_smr' => "Upper trapezius with ball\nSuboccipital base roll",
                'exercises_stretching' => "Levator scapulae stretch\nUpper trap side-neck stretch",
                'exercises_isometrics' => "Chin tucks (cervical retraction)\nWall angels with neck retracted",
                'exercises_integrated' => "Standing cable row with axial neck elongation",
            ],

            // --- POSTERIOR VIEW ---
            [
                'category' => 'Posterior View',
                'name' => 'Foot - Foot Flattens',
                'checkpoint' => 'Foot & Ankle',
                'overactive_muscles' => "Peroneal Complex\nLateral Gastrocnemius\nBiceps Femoris (short head)\nTFL",
                'underactive_muscles' => "Anterior Tibialis\nPosterior Tibialis\nMedial Gastrocnemius\nGluteus Medius",
                'possible_injuries' => "Plantar fasciitis\nAchilles tendinopathy\nMedial tibial stress syndrome\nAnkle sprains",
                'exercises_smr' => "Lateral gastrocnemius & peroneals\nBiceps femoris",
                'exercises_stretching' => "Gastrocnemius/soleus static stretch\nBiceps femoris stretch",
                'exercises_isometrics' => "Posterior tibialis calf raises\nAnterior tibialis dorsiflexion",
                'exercises_integrated' => "Step-up to balance\nSingle-leg balance reach",
            ],
            [
                'category' => 'Posterior View',
                'name' => 'Foot - Heel of Foot Rises',
                'checkpoint' => 'Foot & Ankle',
                'overactive_muscles' => "Soleus\nGastrocnemius Complex",
                'underactive_muscles' => "Anterior Tibialis\nIntrinsic Foot Flexors",
                'possible_injuries' => "Achilles tendinitis\nShin splints\nAnkle stiffness",
                'exercises_smr' => "Soleus & deep calf roller\nAchilles tendon SMR",
                'exercises_stretching' => "Knee-to-wall ankle mobility stretch\nStair drop calf stretch",
                'exercises_isometrics' => "Anterior tibialis heel walks\nBanded dorsiflexion",
                'exercises_integrated' => "Overhead squat on level surface with heel down focus",
            ],
            [
                'category' => 'Posterior View',
                'name' => 'LPHC - Asymmetrical Weight Shift',
                'checkpoint' => 'LPHC',
                'overactive_muscles' => "Adductor Complex (same side of shift)\nTFL (same side of shift)\nGastrocnemius / Soleus (same side)\nPiriformis & Gluteus Medius (opposite side of shift)",
                'underactive_muscles' => "Gluteus Medius (same side of shift)\nAnterior Tibialis\nAdductor Complex (opposite side of shift)",
                'possible_injuries' => "Hamstring, quad & groin strain\nLow back pain\nSI joint dysfunction",
                'exercises_smr' => "Adductors and TFL/IT-band (shift side)\nPiriformis and calves (opposite side)",
                'exercises_stretching' => "Adductors & TFL (shift side)\nPiriformis & calves (opposite side)",
                'exercises_isometrics' => "Gluteus medius side plank (shift side)\nAdductor squeeze (opposite side)",
                'exercises_integrated' => "Single-leg balance reach\nLateral lunge to balance",
            ],
            [
                'category' => 'Posterior View',
                'name' => 'Shoulders - Shoulder Elevation',
                'checkpoint' => 'Shoulders & Thoracic',
                'overactive_muscles' => "Upper Trapezius\nLevator Scapulae\nRhomboids (superior fibers)",
                'underactive_muscles' => "Lower Trapezius\nSerratus Anterior\nLatissimus Dorsi (lower fibers)",
                'possible_injuries' => "Neck tension\nSubacromial impingement\nScapular dyskinesis",
                'exercises_smr' => "Upper trapezius\nLevator scapulae with massage ball",
                'exercises_stretching' => "Upper trapezius lateral neck stretch\nLevator scapulae corner stretch",
                'exercises_isometrics' => "Scapular depression & retraction on cable\nWall slide with serratus push",
                'exercises_integrated' => "Straight-arm pulldown to balance",
            ],

            // --- SINGLE LEG ASSESSMENT ---
            [
                'category' => 'Single Leg',
                'name' => 'Knee - Move Inward (Valgus)',
                'checkpoint' => 'Knee',
                'overactive_muscles' => "Adductor Complex\nBiceps Femoris (short head)\nTFL\nLateral Gastrocnemius\nVastus Lateralis",
                'underactive_muscles' => "Medial Hamstring\nMedial Gastrocnemius\nGluteus Medius / Maximus\nVastus Medialis Oblique (VMO)",
                'possible_injuries' => "ACL tear / strain\nPatellofemoral pain\nMedial collateral ligament (MCL) stress",
                'exercises_smr' => "Adductors, TFL, IT-band, biceps femoris (short head)",
                'exercises_stretching' => "Adductors static stretch, TFL stretch, biceps femoris stretch",
                'exercises_isometrics' => "Single-leg glute bridge\nBanded lateral monster walks\nClamshells with hold",
                'exercises_integrated' => "Single-leg squat to box\nMultiplanar step-up to balance",
            ],
            [
                'category' => 'Single Leg',
                'name' => 'LPHC - Hip Hike',
                'checkpoint' => 'LPHC',
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
                'name' => 'LPHC - Hip Drop (Trendelenburg Sign)',
                'checkpoint' => 'LPHC',
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
                'name' => 'Upper Body - Inward Trunk Rotation',
                'checkpoint' => 'Head & Upper Body',
                'overactive_muscles' => "Internal Oblique (same side as stance leg)\nExternal Oblique (opposite side of stance leg)\nTFL (same side)\nAdductor Complex (same side)",
                'underactive_muscles' => "Internal Oblique (opposite side of stance leg)\nExternal Oblique (same side of stance leg)\nGluteus Medius / Maximus",
                'possible_injuries' => "Rotational spine torque\nLower back sprain",
                'exercises_smr' => "Adductors and TFL",
                'exercises_stretching' => "Seated rotational trunk stretch",
                'exercises_isometrics' => "Pallof press holds\nAnti-rotation planks",
                'exercises_integrated' => "Single-leg cable chop with anti-rotation control",
            ],
            [
                'category' => 'Single Leg',
                'name' => 'Upper Body - Outward Trunk Rotation',
                'checkpoint' => 'Head & Upper Body',
                'overactive_muscles' => "Internal Oblique (opposite side of stance leg)\nExternal Oblique (same side as stance leg)\nPiriformis (same side as stance leg)",
                'underactive_muscles' => "Internal Oblique (same side)\nExternal Oblique (opposite side of stance leg)\nAdductor Complex (opposite side)\nGluteus Medius / Maximus",
                'possible_injuries' => "Pelvic-lumbar instability\nSacroiliac joint irritation",
                'exercises_smr' => "Piriformis & gluteal foam roll",
                'exercises_stretching' => "Piriformis figure-4 stretch",
                'exercises_isometrics' => "Pallof press with step\nSide plank rotation control",
                'exercises_integrated' => "Single-leg cable lift / diagonal reach",
            ],
        ];

        foreach ($data as $item) {
            DpaCompensation::updateOrCreate(
                ['category' => $item['category'], 'name' => $item['name']],
                $item
            );
        }
    }
}
