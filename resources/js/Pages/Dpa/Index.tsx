import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Search,
    X,
    Activity,
    ShieldAlert,
    Calendar,
    UserCheck,
    Users,
    UserX,
    ChevronRight,
    ArrowUpRight,
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
    athletes = [],
    filters,
    totalCount = 0,
    testedCount = 0,
}: DpaIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<'all' | 'tested' | 'untested'>('all');
    const [sortBy, setSortBy] = useState(filters.sort || 'name_asc');

    const untestedCount = Math.max(0, totalCount - testedCount);
    const coveragePercentage = totalCount > 0 ? Math.round((testedCount / totalCount) * 100) : 0;

    const filteredAthletes = useMemo(() => {
        return (athletes || [])
            .filter((athlete) => {
                const matchesSearch =
                    !searchQuery.trim() ||
                    athlete.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    athlete.athlete_code?.toLowerCase().includes(searchQuery.toLowerCase());

                const totalRecords = athlete.total_records || 0;
                let matchesStatus = true;
                if (statusFilter === 'tested') {
                    matchesStatus = totalRecords > 0;
                } else if (statusFilter === 'untested') {
                    matchesStatus = totalRecords === 0;
                }

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
                if (sortBy === 'name_desc') return (b.full_name || '').localeCompare(a.full_name || '');
                if (sortBy === 'records_desc') return (b.total_records || 0) - (a.total_records || 0);
                return 0;
            });
    }, [athletes, searchQuery, statusFilter, sortBy]);

    const isFiltered = searchQuery.trim() !== '' || statusFilter !== 'all' || sortBy !== 'name_asc';

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setSortBy('name_asc');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Analisis DPA - Dynamic Posture Assessment" />

            <div className="space-y-5 pb-16">
                {/* ─── PAGE HEADER WITH SEARCH, FILTER & SORT ─── */}
                <PageHeader
                    icon={Activity}
                    title={
                        <>
                            Analisis Postur <span className="text-[#84cc16] dark:text-[#b4f031]">Dinamis (DPA)</span>
                        </>
                    }
                    description="Evaluasi pola gerak atlet, identifikasi deviasi kompensasi anatomi (overactive & underactive), dan tentukan protokol korektif berbasis biomekanika."
                    actions={
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Status Filter Tab Group */}
                            <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200/80 dark:border-slate-700/60">
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-2.5 py-1 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer ${
                                        statusFilter === 'all'
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                                    }`}
                                >
                                    Semua ({totalCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('tested')}
                                    className={`px-2.5 py-1 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer ${
                                        statusFilter === 'tested'
                                            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                                    }`}
                                >
                                    Sudah Dites ({testedCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('untested')}
                                    className={`px-2.5 py-1 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer ${
                                        statusFilter === 'untested'
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                                    }`}
                                >
                                    Belum Dites ({untestedCount})
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative w-52 sm:w-60">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama, kode..."
                                    className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] transition-all shadow-2xs"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Sort Dropdown */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] cursor-pointer shadow-2xs"
                            >
                                <option value="name_asc">Nama (A - Z)</option>
                                <option value="name_desc">Nama (Z - A)</option>
                                <option value="records_desc">Sesi Terbanyak</option>
                            </select>

                            {isFiltered && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer whitespace-nowrap px-1"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    }
                />

                {/* Counter text */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                    <span>
                        Menampilkan <strong className="text-slate-900 dark:text-slate-100 font-semibold">{filteredAthletes.length}</strong> atlet
                    </span>
                    <span className="text-[11px]">
                        {coveragePercentage}% atlet telah dievaluasi postur
                    </span>
                </div>

                {/* ─── ATHLETES GRID ─── */}
                {filteredAthletes.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-center py-16 px-4 shadow-2xs space-y-3">
                        <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                Atlet Tidak Ditemukan
                            </h4>
                            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                                Tidak ada data atlet yang cocok dengan kata kunci atau filter yang dipilih.
                            </p>
                        </div>
                        {isFiltered && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-3 py-1.5 text-xs font-semibold text-[#84cc16] dark:text-[#b4f031] hover:underline cursor-pointer"
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    className="group bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all duration-200 flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="p-4 space-y-3">
                                        {/* Header: Avatar, Name, Gender, Age & Status Badge */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
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
                                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031] transition-colors leading-tight">
                                                            {athlete.full_name}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                        <span>{athlete.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                                        {athlete.age && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{athlete.age} Tahun</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="shrink-0">
                                                {totalRecords > 0 ? (
                                                    <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                                        {totalRecords} Sesi DPA
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                                                        Siap Dites
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Physical Meta Chips (Clean, subtle inline badges) */}
                                        <div className="flex items-center gap-1.5 flex-wrap text-[10.5px] text-slate-600 dark:text-slate-300 pt-0.5">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 font-medium">
                                                {athlete.height_cm ? `${athlete.height_cm} cm` : '-'} / {athlete.weight_kg ? `${athlete.weight_kg} kg` : '-'}
                                            </span>
                                            {athlete.bmi && (
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 font-medium">
                                                    BMI {athlete.bmi} ({athlete.bmi_category || 'Normal'})
                                                </span>
                                            )}
                                            {athlete.dominant_side && (
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 font-medium text-slate-500 dark:text-slate-400">
                                                    Kaki {athlete.dominant_side === 'L' ? 'Kiri' : 'Kanan'} Dominan
                                                </span>
                                            )}
                                        </div>

                                        {/* Assessment Diagnostic Summary */}
                                        <div className="space-y-1.5 pt-1 text-xs">
                                            {totalRecords > 0 && latestAssessment ? (
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-[10.5px] text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={11} className="text-slate-400" />
                                                            <span>Evaluasi Terakhir:</span>
                                                            <strong className="text-slate-700 dark:text-slate-300 font-medium">
                                                                {formatDate(latestAssessment.assessment_date)}
                                                            </strong>
                                                        </span>
                                                    </div>

                                                    {/* Diagnostic findings */}
                                                    <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                                                        {compensationDetails.length > 0 ? (
                                                            <p className="line-clamp-2" title={compensationDetails.map(d => d.compensation?.name).filter(Boolean).join(', ')}>
                                                                <strong className="text-slate-700 dark:text-slate-300 font-medium">Temuan: </strong>
                                                                {compensationDetails.slice(0, 3).map((detail, idx) => (
                                                                    <span key={idx}>
                                                                        {detail.compensation?.name || 'Kompensasi'}
                                                                        {idx < Math.min(compensationDetails.length, 3) - 1 ? ', ' : ''}
                                                                    </span>
                                                                ))}
                                                                {compensationDetails.length > 3 && (
                                                                    <span className="text-slate-400"> +{compensationDetails.length - 3} lainnya</span>
                                                                )}
                                                            </p>
                                                        ) : (
                                                            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                                                                • Postur Simetris / Optimal
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-[11px] text-slate-400 py-0.5">
                                                    Belum ada rekam jejak evaluasi postur dinamis.
                                                </div>
                                            )}

                                            {/* Injury History note if exists */}
                                            {athlete.injury_history && (
                                                <div className="flex items-start gap-1 text-[10.5px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                                                    <ShieldAlert size={11} className="text-amber-500 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-1">
                                                        <strong className="text-slate-700 dark:text-slate-300 font-medium">Riwayat:</strong> {athlete.injury_history}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                        <span className="text-[10.5px] font-medium text-slate-400">
                                            {totalRecords > 0 ? 'Lihat riwayat & evaluasi' : 'Mulai analisis awal'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#84cc16] dark:text-[#b4f031] group-hover:underline group-hover:translate-x-0.5 transition-transform">
                                            <span>Analisis DPA</span>
                                            <span>→</span>
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
