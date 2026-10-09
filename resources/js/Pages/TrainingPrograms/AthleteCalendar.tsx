import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import AthleteTrainingCalendar from '@/Components/AthleteTrainingCalendar';
import {
    Dumbbell,
    Plus,
    Calendar,
    ChevronLeft,
    User,
    Clock,
    Flame,
    Zap,
    Layers,
    Target,
    Activity,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';
import { Athlete, PageProps } from '@/types';

interface AthleteCalendarProps extends PageProps {
    athlete: Athlete;
}

export default function AthleteCalendar({ auth, athlete }: AthleteCalendarProps) {
    const trainingPrograms = athlete.training_programs || [];
    const latestProgram = trainingPrograms[0] || null;

    // Dummy fallback program wrapper for the calendar if none exists yet
    const dummyProgramForCalendar = latestProgram || {
        id: 0,
        athlete_id: athlete.id,
        name: `Program Latihan • ${athlete.full_name}`,
        slug: '',
        status: 'active' as const,
        frequency_per_week: 3,
        duration_weeks: 4,
        athlete: athlete,
        items: [],
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Kalender Latihan - ${athlete.full_name}`} />

            <div className="space-y-5 pb-16">
                {/* Back Link */}
                <div>
                    <Link
                        href={route('training-programs.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-[#65a30d] dark:hover:text-[#b4f031] transition-colors"
                    >
                        <ChevronLeft size={15} />
                        <span>Kembali ke Daftar Atlet</span>
                    </Link>
                </div>                {/* Athlete Profile Header Banner */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 sm:p-5 shadow-2xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            {athlete.photo_url ? (
                                <img
                                    src={athlete.photo_url}
                                    alt={athlete.full_name}
                                    className="w-14 h-14 rounded-md object-cover border border-slate-200 dark:border-slate-800 shadow-xs shrink-0"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-md border border-slate-200 dark:border-slate-800 bg-[#84cc16]/10 text-[#65a30d] dark:text-[#b4f031] font-black text-xl flex items-center justify-center shrink-0">
                                    {athlete.full_name ? athlete.full_name.charAt(0).toUpperCase() : 'A'}
                                </div>
                            )}

                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {athlete.full_name}
                                    </h1>
                                    <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-[#84cc16]/10 text-[#65a30d] dark:text-[#b4f031] border border-[#84cc16]/20">
                                        Member Atlet
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    <span>{athlete.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                    {athlete.age && <span> • {athlete.age} th</span>}
                                    {athlete.height_cm && <span> • {athlete.height_cm} cm</span>}
                                    {athlete.weight_kg && <span> • {athlete.weight_kg} kg</span>}
                                    {athlete.dominant_side && (
                                        <span> • Dominan: <strong className="text-slate-700 dark:text-slate-300">{athlete.dominant_side}</strong></span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Top CTA */}
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('training-programs.create', { athlete_id: athlete.id })}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#84cc16] hover:bg-[#65a30d] text-slate-950 rounded-md text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            >
                                <Plus size={14} className="stroke-[3]" />
                                <span>Buat Sesi Latihan Baru</span>
                            </Link>

                            <Link
                                href={route('dpa.athletes.show', athlete.id)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors"
                            >
                                <Activity size={14} />
                                <span>Hasil Asesmen Postur</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Calendar Component */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 sm:p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar size={16} className="text-[#84cc16] dark:text-[#b4f031]" />
                                <span>Kalender Sesi Latihan Atlet</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Jadwal latihan harian dan riwayat kepatuhan sesi korektif {athlete.full_name}
                            </p>
                        </div>
                    </div>

                    <AthleteTrainingCalendar
                        program={dummyProgramForCalendar}
                        interactive={true}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
