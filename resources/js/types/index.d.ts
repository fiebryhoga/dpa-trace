export interface User {
    id: number;
    name: string;
    username?: string;
    email: string;
    avatar?: string;
    avatar_url?: string;
    role?: string;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Athlete {
    id: number;
    athlete_code: string;
    full_name: string;
    gender: 'L' | 'P';
    age?: number;
    calculated_age?: number;
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    bmi_category?: string;
    dominant_side?: string;
    injury_history?: string;
    phone_number?: string;
    photo_path?: string;
    photo_url?: string;
    is_active: boolean;
    total_records?: number;
    created_at?: string;
    updated_at?: string;
    dpa_assessments?: DpaAssessment[];
    training_programs?: TrainingProgram[];
    galleries?: AthleteGallery[];
}

export interface DpaCompensation {
    id: number;
    category: string; // 'Anterior View' | 'Lateral View' | 'Posterior View' | 'Single Leg'
    name: string;
    slug?: string;
    checkpoint?: string;
    image_path?: string;
    overactive_muscles?: string;
    underactive_muscles?: string;
    possible_injuries?: string;
    exercises_smr?: string;
    image_smr?: string;
    exercises_stretching?: string;
    image_stretching?: string;
    exercises_isometrics?: string;
    image_isometrics?: string;
    exercises_integrated?: string;
    image_integrated?: string;
    exercises?: Exercise[];
    created_at?: string;
    updated_at?: string;
}

export interface Exercise {
    id: number;
    name: string;
    slug?: string;
    instructions?: string;
    image_path?: string;
    video_url?: string;
    is_active: boolean;
    pivot?: {
        dpa_compensation_id?: number;
        exercise_id?: number;
        phase: 'Inhibit' | 'Lengthen' | 'Activate' | 'Integrate';
        sort_order?: number;
    };
    created_at?: string;
    updated_at?: string;
}

export interface DpaAssessmentDetail {
    id: number;
    dpa_assessment_id: number;
    dpa_compensation_id: number;
    severity?: 'Mild' | 'Moderate' | 'Severe';
    side?: 'Left' | 'Right' | 'Bilateral';
    specific_note?: string;
    compensation?: DpaCompensation;
}

export interface DpaAssessment {
    id: number;
    athlete_id: number;
    assessor_id?: number;
    assessment_date: string;
    current_height_cm?: number;
    current_weight_kg?: number;
    notes?: string;
    details_count?: number;
    details?: DpaAssessmentDetail[];
    athlete?: Athlete;
    assessor?: User;
    created_at?: string;
    updated_at?: string;
}

export interface AthleteGallery {
    id: number;
    athlete_id: number;
    image_path: string;
    original_image_path?: string;
    annotations?: any;
    meta?: any;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Muscle {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Injury {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface BiomechanicalAnalysis {
    compensations: DpaCompensation[];
    overactive: string[];
    underactive: string[];
    injuries: string[];
    totalDeviations?: number;
    riskLevel?: 'Low' | 'Moderate' | 'High';
}

export interface TrainingProgramItem {
    id?: number | string;
    training_program_id?: number;
    exercise_id?: number | null;
    phase: 'inhibit' | 'lengthen' | 'activate' | 'integrate';
    exercise_name: string;
    target_muscle?: string;
    sets: number;
    reps?: string;
    duration_seconds?: number | null;
    hold_seconds?: number | null;
    tempo?: string;
    rest_seconds?: number | null;
    frequency?: string;
    intensity?: string;
    coaching_cues?: string;
    sort_order?: number;
    exercise?: Exercise;
    created_at?: string;
    updated_at?: string;
}

export interface TrainingProgram {
    id: number;
    athlete_id: number;
    dpa_assessment_id?: number | null;
    user_id?: number | null;
    name: string;
    slug: string;
    status: 'draft' | 'active' | 'completed';
    start_date?: string;
    end_date?: string;
    frequency_per_week: number;
    duration_weeks: number;
    scheduled_days?: string[];
    schedule_dates?: string[];
    completed_dates?: string[];
    session_notes?: Record<string, string>;
    description?: string;
    target_compensations?: string[];
    target_muscles_overactive?: string[];
    target_muscles_underactive?: string[];
    athlete?: Athlete;
    assessment?: DpaAssessment;
    creator?: User;
    items?: TrainingProgramItem[];
    items_count?: number;
    created_at?: string;
    updated_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
        message?: string;
    };
};

