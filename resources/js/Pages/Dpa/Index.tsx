import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Search,
    Filter,
    ChevronDown,
    Check,
    X,
    ArrowUpRight,
    Activity,
    Stethoscope,
    ShieldAlert,
    Calendar,
    UserCheck,
    Dumbbell,
    PlusCircle,
    Users,
} from 'lucide-react';
import { Athlete, PageProps } from '@/types';
import { formatDate } from '@/lib/utils';

interface DpaIndexProps extends PageProps {
    athletes: Athlete[];
    filters: {
        search: string;
        sort: string;
    };
    totalCount: number;
    testedCount: number;
}

function getInitials(name: string) {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

export default function DpaIndex({
    auth,
    athletes = [],
    filters,
    totalCount,
    testedCount,
}: DpaIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort || 'name_asc');

    const filteredAthletes = useMemo(() => {
        return (athletes || [])
            .filter((athlete) => {
                const matchesSearch =
                    !searchQuery.trim() ||
                    athlete.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    athlete.athlete_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    athlete.nickname?.toLowerCase().includes(searchQuery.toLowerCase());

                return matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
                if (sortBy === 'name_desc') return (b.full_name || '').localeCompare(a.full_name || '');
                if (sortBy === 'records_desc') return (b.total_records || 0) - (a.total_records || 0);
                return 0;
            });
    }, [athletes, searchQuery, sortBy]);

    const activeFilterCount = (searchQuery.trim() ? 1 : 0) + (sortBy !== 'name_asc' ? 1 : 0);

    const resetFilters = () => {
        setSearchQuery('');
        setSortBy('name_asc');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Analisis DPA - Dynamic Posture Assessment" />

            <div className="space-y-6">
                <PageHeader
                    icon={Activity}
                    title={
                        <>
                            Analisis Postur <span className="text-[#84cc16] dark:text-[#b4f031]">Dinamis (DPA)</span>
                        </>
                    }
                    description="Evaluasi pola gerak, identifikasi otot overactive / underactive, dan tentukan protokol korektif berbasis biomekanika."
                />

                {/* ─── SPLIT LAYOUT (KIRI LEBIH KECIL, KANAN UTAMA) ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* ─── KOLOM KIRI (SIDEBAR FILTER & STATISTIK) ─── */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                        {/* Panel Pencarian & Filter */}
                        <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 space-y-4 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Filter & Cari
                                </span>
                                {activeFilterCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama, kode..."
                                    className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-[#84cc16] outline-none transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Urutan */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    Urutkan Berdasarkan
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#84cc16] cursor-pointer"
                                >
                                    <option value="name_asc">Nama Atlet (A - Z)</option>
                                    <option value="name_desc">Nama Atlet (Z - A)</option>
                                    <option value="records_desc">Jumlah Tes Terbanyak</option>
                                </select>
                            </div>
                        </div>

                        {/* Ringkasan Status DPA */}
                        <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 space-y-3 shadow-xs">
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                                Status Penilaian
                            </span>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                                        <Users size={13} />
                                        <span className="text-[10px] font-semibold">Total Atlet</span>
                                    </div>
                                    <span className="text-base font-black text-slate-900 dark:text-white">
                                        {totalCount}
                                    </span>
                                </div>

                                <div className="p-2.5 rounded-md bg-[#b4f031]/10 border border-[#b4f031]/25">
                                    <div className="flex items-center gap-1.5 text-[#84cc16] dark:text-[#b4f031] mb-1">
                                        <UserCheck size={13} />
                                        <span className="text-[10px] font-semibold">Sudah Dites</span>
                                    </div>
                                    <span className="text-base font-black text-slate-900 dark:text-[#b4f031]">
                                        {testedCount}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                    <span>Cakupan Evaluasi</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                        {totalCount > 0 ? Math.round((testedCount / totalCount) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#84cc16] dark:bg-[#b4f031] transition-all duration-500 rounded-full"
                                        style={{
                                            width: `${totalCount > 0 ? Math.min(100, Math.round((testedCount / totalCount) * 100)) : 0}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── KOLOM KANAN (DAFTAR ATLET UNTUK ANALISIS) ─── */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                        {/* Header Hasil Pencarian */}
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                            <span>
                                Menampilkan <strong className="text-slate-900 dark:text-white">{filteredAthletes.length}</strong> atlet
                            </span>
                        </div>

                        {/* Athletes Grid */}
                        {filteredAthletes.length === 0 ? (
                            <div className="py-16 px-4 flex flex-col items-center justify-center bg-white dark:bg-[#0D1322] border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center space-y-3">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Search className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Atlet Tidak Ditemukan
                                    </h4>
                                    <p className="text-xs text-slate-400 max-w-sm">
                                        Tidak ada atlet yang cocok dengan kriteria pencarian yang dimasukkan.
                                    </p>
                                </div>
                                {activeFilterCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="px-3.5 py-1.5 text-xs font-bold text-[#84cc16] dark:text-[#b4f031] hover:underline cursor-pointer"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                                {filteredAthletes.map((athlete) => {
                                    const photo = athlete.photo_path
                                        ? athlete.photo_path.startsWith('/')
                                            ? athlete.photo_path
                                            : `/storage/${athlete.photo_path}`
                                        : null;

                                    const totalRecords = athlete.total_records || 0;
                                    const latestAssessment = athlete.dpa_assessments?.[0];
                                    const compensationDetails = latestAssessment?.details || [];

                                    return (
                                        <Link
                                            key={athlete.id}
                                            href={route('dpa.athletes.show', athlete.athlete_code || athlete.id)}
                                            className="group bg-white dark:bg-[#0D1322] rounded-lg border border-slate-200/90 dark:border-slate-800 hover:border-[#84cc16] dark:hover:border-[#b4f031] shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between overflow-hidden"
                                        >
                                            <div className="p-4 space-y-3">
                                                {/* Header Profile */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-md border border-[#b4f031]/40 bg-[#b4f031]/10 text-slate-900 dark:text-[#b4f031] font-black text-xs flex items-center justify-center shrink-0 overflow-hidden">
                                                            {photo ? (
                                                                <img
                                                                    src={photo}
                                                                    alt={athlete.full_name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <span>{getInitials(athlete.full_name)}</span>
                                                            )}
                                                        </div>

                                                        <div className="min-w-0 space-y-0.5">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031] transition-colors leading-tight">
                                                                    {athlete.full_name}
                                                                </h3>
                                                                {athlete.nickname && (
                                                                    <span className="text-[10px] text-slate-400 font-medium truncate">
                                                                        "{athlete.nickname}"
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                                <span className="truncate">{athlete.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                                                {athlete.age && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="truncate text-slate-400">{athlete.age} Tahun</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Biometrics & Physical Data */}
                                                <div className="grid grid-cols-3 gap-1.5 p-2 rounded-md bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800/80 text-[10px]">
                                                    <div className="space-y-0.5">
                                                        <span className="text-slate-400 block font-medium">Fisik (TB/BB)</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                            {athlete.height_cm ? `${athlete.height_cm} cm` : '-'} / {athlete.weight_kg ? `${athlete.weight_kg} kg` : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <span className="text-slate-400 block font-medium">BMI / Usia</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                            {athlete.bmi ? `${athlete.bmi} (${athlete.bmi_category || 'Normal'})` : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <span className="text-slate-400 block font-medium">Dominan / Gender</span>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                            {athlete.dominant_side || 'Kanan'} • {athlete.gender === 'L' ? 'L' : 'P'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Latest Diagnostic Findings / Assessment Details */}
                                                <div className="space-y-1 pt-1">
                                                    {totalRecords > 0 && latestAssessment ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between text-[10px]">
                                                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                                                    <Calendar size={11} className="text-slate-400" />
                                                                    Evaluasi Terakhir: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{formatDate(latestAssessment.assessment_date)}</strong>
                                                                </span>
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                                    {totalRecords} Sesi DPA
                                                                </span>
                                                            </div>

                                                            {/* Diagnostic findings (Clean text, no background badge) */}
                                                            <div className="flex items-center gap-1 flex-wrap text-[10px] leading-tight">
                                                                {compensationDetails.length > 0 ? (
                                                                    <div className="flex items-center gap-1 flex-wrap text-slate-600 dark:text-slate-300">
                                                                        <span className="text-slate-400">Temuan:</span>
                                                                        {compensationDetails.slice(0, 3).map((detail, idx) => (
                                                                            <span key={idx} className="font-semibold text-slate-800 dark:text-slate-200">
                                                                                {detail.compensation?.name || 'Kompensasi'}
                                                                                {idx < Math.min(compensationDetails.length, 3) - 1 ? ',' : ''}
                                                                            </span>
                                                                        ))}
                                                                        {compensationDetails.length > 3 && (
                                                                            <span className="text-slate-400 font-medium">
                                                                                +{compensationDetails.length - 3}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                                        • Postur Simetris / Optimal
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                                                            <span>Belum memiliki rekaman evaluasi DPA</span>
                                                            <span className="text-[#84cc16] dark:text-[#b4f031] font-semibold">Siap dites</span>
                                                        </div>
                                                    )}

                                                    {/* Injury History Warning (Clean text, no background badge) */}
                                                    {athlete.injury_history && (
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate pt-0.5">
                                                            <ShieldAlert size={11} className="text-rose-500 shrink-0" />
                                                            <span className="truncate">
                                                                Riwayat Cedera: <strong className="font-medium text-rose-600 dark:text-rose-400">{athlete.injury_history}</strong>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Footer */}
                                            <div className="px-4 py-2 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {totalRecords > 0 ? 'Lihat riwayat & evaluasi' : 'Mulai analisis awal'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#84cc16] dark:text-[#b4f031] group-hover:translate-x-0.5 transition-transform">
                                                    Analisis DPA
                                                    <ArrowUpRight size={12} />
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
