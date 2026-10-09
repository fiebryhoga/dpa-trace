import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Dumbbell,
    Plus,
    Search,
    User,
    Calendar,
    ChevronRight,
    Activity,
    Clock,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';
import { Athlete, PageProps } from '@/types';

interface ExtendedAthlete extends Athlete {
    total_programs_count?: number;
    completed_programs_count?: number;
}

interface TrainingProgramsIndexProps extends PageProps {
    athletes: {
        data: ExtendedAthlete[];
        links: any[];
        total: number;
        from: number;
        to: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        gender?: string;
    };
}

export default function TrainingProgramsIndex({
    auth,
    athletes,
    filters,
}: TrainingProgramsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [gender, setGender] = useState(filters.gender || 'all');

    const handleFilterChange = (newSearch?: string, newGender?: string) => {
        const s = newSearch !== undefined ? newSearch : search;
        const g = newGender !== undefined ? newGender : gender;

        router.get(
            route('training-programs.index'),
            {
                search: s,
                gender: g,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Program Latihan Atlet - Athlete PMA" />

            <div className="space-y-5 pb-12">
                {/* Header */}
                <PageHeader
                    title="Program Latihan Atlet"
                    description="Pilih profil atlet untuk melihat kalender jadwal harian, status kepatuhan latihan, dan detail peresepan korektif 4 Fase NASM."
                    icon={
                        <div className="w-10 h-10 rounded-md bg-[#84cc16]/15 dark:bg-[#b4f031]/15 text-[#65a30d] dark:text-[#b4f031] flex items-center justify-center border border-[#84cc16]/30 shrink-0">
                            <Dumbbell size={20} />
                        </div>
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('training-programs.create')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#84cc16] hover:bg-[#65a30d] dark:bg-[#b4f031] dark:hover:bg-[#a3e635] text-slate-950 font-bold rounded-md text-xs shadow-2xs transition-all cursor-pointer"
                            >
                                <Plus size={14} className="stroke-[3]" />
                                <span>Buat Program Baru</span>
                            </Link>
                        </div>
                    }
                />

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3 sm:p-4 space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange(search, gender)}
                                placeholder="Cari nama atau kode atlet..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#84cc16] dark:focus:ring-[#b4f031]"
                            />
                        </div>

                        {/* Gender Filter Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 text-xs">
                            <button
                                type="button"
                                onClick={() => {
                                    setGender('all');
                                    handleFilterChange(search, 'all');
                                }}
                                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                                    gender === 'all'
                                        ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                                Semua Atlet
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setGender('L');
                                    handleFilterChange(search, 'L');
                                }}
                                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                                    gender === 'L'
                                        ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                                Laki-laki
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setGender('P');
                                    handleFilterChange(search, 'P');
                                }}
                                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                                    gender === 'P'
                                        ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                                Perempuan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Athlete Cards Grid */}
                {athletes.data && athletes.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {athletes.data.map((athlete) => {
                            const totalSessions = athlete.total_programs_count || (athlete.training_programs || []).length;
                            const completedSessions = athlete.completed_programs_count || 0;
                            const latestSession = athlete.training_programs && athlete.training_programs[0];

                            return (
                                <Link
                                    key={athlete.id}
                                    href={route('training-programs.athletes.calendar', athlete.id)}
                                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 rounded-md p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer"
                                >
                                    {/* Top Profile */}
                                    <div className="flex items-start gap-3.5">
                                        {athlete.photo_url ? (
                                            <img
                                                src={athlete.photo_url}
                                                alt={athlete.full_name}
                                                className="w-12 h-12 rounded-md object-cover border border-orange-500/30 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-md border border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-black text-lg flex items-center justify-center shrink-0">
                                                {athlete.full_name ? athlete.full_name.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                        )}

                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                                                    {athlete.full_name}
                                                </h3>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                <span>{athlete.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                                {athlete.age && <span> • {athlete.age} th</span>}
                                                {athlete.height_cm && <span> • {athlete.height_cm}cm</span>}
                                            </p>
                                            <span className="inline-block text-[10px] font-semibold text-slate-400">
                                                ID: {athlete.athlete_code}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle Program / Calendar Stats */}
                                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">
                                                Total Sesi
                                            </span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                {totalSessions} Sesi
                                            </span>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
                                            <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">
                                                Selesai
                                            </span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {completedSessions} Selesai
                                            </span>
                                        </div>
                                    </div>

                                    {/* Latest Scheduled Date if any */}
                                    {latestSession && latestSession.start_date && (
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                            <Calendar size={13} className="text-orange-500 shrink-0" />
                                            <span>Sesi Terdekat: <strong className="text-slate-800 dark:text-slate-200">{new Date(latestSession.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                                        </div>
                                    )}

                                    {/* Bottom Button Action */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            <span>Buka Kalender Latihan</span>
                                        </span>
                                        <ChevronRight size={15} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-12 text-center space-y-3 shadow-2xs">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                            <User size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Tidak Ada Atlet Ditemukan
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Tidak ada data atlet yang sesuai dengan kata kunci pencarian. Tambahkan atlet baru melalui menu Manajemen Atlet.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                {athletes.links && athletes.links.length > 3 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{athletes.from || 0}</span> -{' '}
                            <span className="font-bold text-slate-800 dark:text-slate-200">{athletes.to || 0}</span> dari{' '}
                            <span className="font-bold text-slate-800 dark:text-slate-200">{athletes.total}</span> atlet
                        </div>
                        <div className="flex items-center gap-1">
                            {athletes.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                                        link.active
                                            ? 'bg-[#84cc16] dark:bg-[#b4f031] text-slate-950 font-bold'
                                            : link.url
                                            ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                                            : 'text-slate-400 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
