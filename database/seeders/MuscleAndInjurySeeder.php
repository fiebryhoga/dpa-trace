<?php

namespace Database\Seeders;

use App\Models\Injury;
use App\Models\Muscle;
use Illuminate\Database\Seeder;

class MuscleAndInjurySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $muscles = [
            // Foot & Ankle / Lower Leg
            ['name' => 'Soleus', 'slug' => 'calves', 'description' => 'Otot plantar fleksi pergelangan kaki yang terletak di bawah gastrocnemius.'],
            ['name' => 'Lateral Gastrocnemius', 'slug' => 'calves', 'description' => 'Kepala lateral otot betis, sering tegang pada kompensasi feet turn out.'],
            ['name' => 'Medial Gastrocnemius', 'slug' => 'calves', 'description' => 'Kepala medial otot betis.'],
            ['name' => 'Anterior Tibialis', 'slug' => 'tibialis', 'description' => 'Otot dorsifleksi dan inversi kaki pada tulang kering depan.'],
            ['name' => 'Posterior Tibialis', 'slug' => 'tibialis', 'description' => 'Penopang utama arkus medial kaki.'],
            ['name' => 'Peroneus Longus & Brevis', 'slug' => 'calves', 'description' => 'Otot eversi pergelangan kaki sisi lateral.'],

            // Knee & Thigh
            ['name' => 'Biceps Femoris (short head)', 'slug' => 'hamstring', 'description' => 'Bagian hamstring lateral yang sering overactive pada knee valgus.'],
            ['name' => 'Biceps Femoris (long head)', 'slug' => 'hamstring', 'description' => 'Otot hamstring lateral utama.'],
            ['name' => 'Medial Hamstring (Semitendinosus/Semimembranosus)', 'slug' => 'hamstring', 'description' => 'Hamstring medial yang sering underactive/lemah.'],
            ['name' => 'Vastus Lateralis', 'slug' => 'quadriceps', 'description' => 'Bagian luar paha depan.'],
            ['name' => 'Vastus Medialis Oblique (VMO)', 'slug' => 'quadriceps', 'description' => 'Penstabil utama patella medial, sering lemah pada knee valgus.'],
            ['name' => 'Rectus Femoris', 'slug' => 'quadriceps', 'description' => 'Fleksor panggul dan ekstensor lutut.'],
            ['name' => 'Popliteus', 'slug' => 'knees', 'description' => 'Otot pengunci/pembuka sendi lutut posterior.'],
            ['name' => 'Gracilis', 'slug' => 'adductors', 'description' => 'Adduktor panjang medial paha.'],
            ['name' => 'Sartorius', 'slug' => 'adductors', 'description' => 'Otot terpanjang tubuh yang melintang dari panggul ke lutut medial.'],

            // LPHC (Lumbo-Pelvic-Hip Complex)
            ['name' => 'Tensor Fasciae Latae (TFL)', 'slug' => 'gluteal', 'description' => 'Otot penegang iliotibial band, sering dominan menggantikan gluteus medius.'],
            ['name' => 'Adductor Complex', 'slug' => 'adductors', 'description' => 'Adductor magnus, longus, dan brevis.'],
            ['name' => 'Psoas Major', 'slug' => 'abs', 'description' => 'Fleksor panggul utama, sering memendek akibat duduk lama.'],
            ['name' => 'Iliacus', 'slug' => 'abs', 'description' => 'Fleksor panggul yang menyatu dengan psoas (iliopsoas).'],
            ['name' => 'Gluteus Medius', 'slug' => 'gluteal', 'description' => 'Abduktor dan penstabil utama panggul frontal.'],
            ['name' => 'Gluteus Maximus', 'slug' => 'gluteal', 'description' => 'Ekstensor utama panggul dan penstabil sakroiliaka.'],
            ['name' => 'Piriformis', 'slug' => 'gluteal', 'description' => 'Rotator eksternal panggul di bawah gluteus maximus.'],
            ['name' => 'Erector Spinae', 'slug' => 'lower-back', 'description' => 'Otot ekstensor tulang belakang.'],
            ['name' => 'Transverse Abdominis (TVA)', 'slug' => 'abs', 'description' => 'Korset alami terdalam perut penstabil lumbal.'],

            // Shoulder & Upper Back
            ['name' => 'Latissimus Dorsi', 'slug' => 'upper-back', 'description' => 'Otot punggung lebar yang mempengaruhi ekstensi bahu dan lumbal.'],
            ['name' => 'Upper Trapezius', 'slug' => 'trapezius', 'description' => 'Elevator skapula, sering tegang saat stres/postur bungkuk.'],
            ['name' => 'Middle & Lower Trapezius', 'slug' => 'trapezius', 'description' => 'Depresor dan retraktor skapula, sering lemah.'],
            ['name' => 'Rhomboids (Major & Minor)', 'slug' => 'upper-back', 'description' => 'Retraktor skapula di antara tulang belikat.'],
            ['name' => 'Pectoralis Major & Minor', 'slug' => 'chest', 'description' => 'Otot dada yang sering memendek menarik bahu ke depan (protracted shoulder).'],
            ['name' => 'Deltoids', 'slug' => 'deltoids', 'description' => 'Otot bahu anterior, lateral, dan posterior.'],
            ['name' => 'Rotator Cuff (Infraspinatus, Teres Minor, Subscapularis, Supraspinatus)', 'slug' => 'upper-back', 'description' => 'Penstabil glenohumeral bahu.'],

            // Head & Neck
            ['name' => 'Sternocleidomastoid (SCM)', 'slug' => 'neck', 'description' => 'Otot leher depan yang sering tegang pada forward head posture.'],
            ['name' => 'Levator Scapulae', 'slug' => 'neck', 'description' => 'Otot pengangkat skapula leher belakang.'],
            ['name' => 'Deep Cervical Flexors', 'slug' => 'neck', 'description' => 'Otot fleksor leher dalam penstabil servikal.'],
        ];

        foreach ($muscles as $m) {
            Muscle::firstOrCreate(
                ['name' => $m['name']],
                $m
            );
        }

        $injuries = [
            ['name' => 'Plantar fasciitis', 'body_region' => 'Foot & Ankle', 'description' => 'Peradangan pada pita jaringan tebal di sepanjang telapak kaki.'],
            ['name' => 'Achilles tendinopathy', 'body_region' => 'Foot & Ankle', 'description' => 'Iritasi atau degenerasi pada tendon Achilles di tumit belakang.'],
            ['name' => 'Medial tibial stress syndrome (Shin splints)', 'body_region' => 'Foot & Ankle', 'description' => 'Nyeri sepanjang tepi medial tulang kering akibat beban berulang.'],
            ['name' => 'Ankle sprains (Inversion/Eversion)', 'body_region' => 'Foot & Ankle', 'description' => 'Keseleo ligamen pergelangan kaki.'],
            ['name' => 'Patellar tendinitis (Jumper\'s knee)', 'body_region' => 'Knee', 'description' => 'Peradangan pada tendon patella di bawah tempurung lutut.'],
            ['name' => 'IT-band syndrome (Runner\'s knee)', 'body_region' => 'Knee', 'description' => 'Gesekan iliotibial band pada epikondilus lateral femur.'],
            ['name' => 'ACL strain / tear', 'body_region' => 'Knee', 'description' => 'Cedera robekan pada ligamen anterior cruciate lutut.'],
            ['name' => 'Meniscus tears', 'body_region' => 'Knee', 'description' => 'Robekan pada bantalan tulang rawan sendi lutut.'],
            ['name' => 'Patellofemoral pain syndrome (PFPS)', 'body_region' => 'Knee', 'description' => 'Nyeri di sekitar atau di belakang tempurung lutut.'],
            ['name' => 'Hamstring strain', 'body_region' => 'Knee', 'description' => 'Tarikan atau robekan pada serabut otot hamstring.'],
            ['name' => 'Low back pain (Lumbago)', 'body_region' => 'LPHC', 'description' => 'Nyeri pinggang bawah akibat kompensasi panggul dan lumbal.'],
            ['name' => 'SI joint dysfunction', 'body_region' => 'LPHC', 'description' => 'Disfungsi sendi sakroiliaka antara sakrum dan panggul.'],
            ['name' => 'Groin strain (Adductor pull)', 'body_region' => 'LPHC', 'description' => 'Tarikan otot pada selangkangan paha dalam.'],
            ['name' => 'Shoulder impingement syndrome', 'body_region' => 'Shoulder & Arm', 'description' => 'Penjepitan tendon rotator cuff saat mengangkat lengan.'],
            ['name' => 'Rotator cuff tendinopathy', 'body_region' => 'Shoulder & Arm', 'description' => 'Degenerasi atau peradangan pada tendon rotator cuff bahu.'],
            ['name' => 'Biceps tendinitis', 'body_region' => 'Shoulder & Arm', 'description' => 'Peradangan pada tendon kepala panjang biseps.'],
            ['name' => 'Cervical neck pain & tension headache', 'body_region' => 'Head & Neck', 'description' => 'Ketegangan otot leher servikal dan sakit kepala tension.'],
        ];

        foreach ($injuries as $inj) {
            Injury::firstOrCreate(
                ['name' => $inj['name']],
                $inj
            );
        }
    }
}
