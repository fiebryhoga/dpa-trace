<?php

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $exercises = [
            // ─── INHIBIT (SMR / FOAM ROLLING) ───
            [
                'name' => 'Foam Roll Calf (Gastrocnemius & Soleus)',
                'instructions' => 'Duduk di lantai dengan foam roller diletakkan di bawah betis. Angkat pinggul sedikit dan gulirkan foam roller perlahan dari pergelangan kaki ke bawah lutut. Saat menemukan titik paling tegang (tender spot), tahan posisi selama 30-60 detik hingga rasa tegang mereda.',
                'is_active' => true,
            ],
            [
                'name' => 'Foam Roll Tensor Fasciae Latae (TFL) & IT Band',
                'instructions' => 'Berbaring miring dengan foam roller tepat di bawah tulang panggul samping (TFL). Gunakan kaki atas dan kedua tangan untuk menopang berat badan. Gulirkan perlahan 2-3 cm ke atas dan bawah mencari titik ketegangan maksimal.',
                'is_active' => true,
            ],
            [
                'name' => 'Foam Roll Thoracic Spine & Latissimus Dorsi',
                'instructions' => 'Berbaring miring dengan lengan terentang ke atas, letakkan foam roller di bawah ketiak samping (latissimus). Perlahan gulirkan beberapa sentimeter ke arah punggung tengah. Tahan pada titik paling kaku sembari menarik napas dalam.',
                'is_active' => true,
            ],

            // ─── LENGTHEN (STRETCHING) ───
            [
                'name' => 'Static Standing Gastroc & Soleus Stretch',
                'instructions' => 'Berdiri menghadap dinding dengan posisi split stance (satu kaki di depan, satu di belakang). Kaki belakang lurus dengan tumit menempel kuat di lantai dan jari kaki mengarah lurus ke depan. Dorong pinggul ke depan hingga terasa regangan nyaman pada betis belakang.',
                'is_active' => true,
            ],
            [
                'name' => 'Kneeling Hip Flexor & Psoas Stretch',
                'instructions' => 'Ambil posisi half-kneeling (satu lutut di lantai, satu kaki di depan 90 derajat). Kencangkan gluteus pada sisi kaki yang di lantai dan lakukan posterior pelvic tilt (ratakan punggung bawah). Dorong pinggul sedikit ke depan tanpa melengkungkan pinggang.',
                'is_active' => true,
            ],
            [
                'name' => 'Doorway Pectoral & Anterior Shoulder Stretch',
                'instructions' => 'Posisikan lengan ditekuk 90 derajat menempel pada kusen pintu. Langkahkan satu kaki ke depan dan putar torso sedikit menjauhi lengan hingga terasa regangan di dada bagian depan dan bahu.',
                'is_active' => true,
            ],

            // ─── ACTIVATE (ISOLATED STRENGTHENING) ───
            [
                'name' => 'Side-Lying Hip Abduction (Gluteus Medius)',
                'instructions' => 'Berbaring miring lurus. Kaki atas sedikit diekstensikan ke belakang (15 derajat) dengan jari kaki mengarah sedikit ke bawah (internal rotation). Angkat kaki ke atas secara terkontrol dan tahan di puncak selama 2 detik sebelum diturunkan perlahan.',
                'is_active' => true,
            ],
            [
                'name' => 'Prone Cobra / Scapular Retraction',
                'instructions' => 'Tengkurap di matras dengan lengan di samping tubuh. Putar ibu jari ke arah atas langit-langit (external rotation bahu). Angkat dada sedikit dari lantai sembari merapatkan kedua tulang belikat ke belakang dan bawah. Tahan 3 detik.',
                'is_active' => true,
            ],
            [
                'name' => 'Anterior Tibialis Dorsiflexion with Resistance Band',
                'instructions' => 'Duduk dengan kaki lurus, kaitkan resistance band di ujung atas kaki. Tarik jari-jari kaki ke arah tulang kering (dorsiflexion) dengan kuat melawan tarikan karet, tahan 2 detik di posisi dorsifleksi penuh, lalu kembali perlahan.',
                'is_active' => true,
            ],

            // ─── INTEGRATE (DYNAMIC MOVEMENT) ───
            [
                'name' => 'Squat to Overhead Press with Mini-Band',
                'instructions' => 'Pasang mini-band di atas lutut, pegang dumbbell di depan bahu. Lakukan squat dengan menjaga lutut tetap sejajar dengan jari kaki (tidak valgus/masuk ke dalam). Saat bangkit dari squat, dorong beban ke atas kepala dalam satu gerakan terkoordinasi.',
                'is_active' => true,
            ],
            [
                'name' => 'Single-Leg Balance to Reach with Romanian Deadlift',
                'instructions' => 'Berdiri dengan satu kaki. Bungkukkan badan dari panggul (hip hinge) sembari meluruskan kaki belakang ke belakang dan meraih tangan ke depan ke arah target di lantai. Jaga panggul tetap rata dan sejajar sebelum kembali berdiri tegak.',
                'is_active' => true,
            ],
            [
                'name' => 'Step-Up to Balance with Bicep Curl & Overhead Press',
                'instructions' => 'Langkahkan satu kaki ke atas boks, dorong melalui tumit untuk naik ke atas dan angkat kaki yang berlawanan hingga paha sejajar lantai (single leg balance). Di puncak gerakan, lakukan bicep curl dan overhead press sebelum melangkah turun dengan terkontrol.',
                'is_active' => true,
            ],
        ];

        foreach ($exercises as $exercise) {
            Exercise::updateOrCreate(
                ['name' => $exercise['name']],
                $exercise
            );
        }
    }
}
