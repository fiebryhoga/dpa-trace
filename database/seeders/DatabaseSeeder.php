<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Admin / Assessor account
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Athlete PMA Lead Biomechanist',
                'email' => 'admin@athletepma.com',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            DpaCompensationSeeder::class,
            AthleteSeeder::class,
            ExerciseSeeder::class,
        ]);
    }
}
