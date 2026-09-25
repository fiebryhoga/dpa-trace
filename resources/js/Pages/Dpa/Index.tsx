import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
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
} from 'lucide-react';
import { Athlete, PageProps } from '@/types';

interface DpaIndexProps extends PageProps {
    athletes: Athlete[];
    sportsList: string[];
    filters: {
        search: string;
        sport: string;
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
    sportsList = [],
    filters,
    totalCount,
    testedCount,
}: DpaIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedSport, setSelectedSport] = useState(filters.sport || 'all');
    const [sortBy, setSortBy] = useState(filters.sort || 'name_asc');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredAthletes = useMemo(() => {
        return (athletes || [])
            .filter((athlete) => {
                const matchesSearch =
                    !searchQuery.trim() ||
                    athlete.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    athlete.athlete_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    athlete.position_specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    athlete.sport_category?.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesSport =
                    selectedSport === 'all' || athlete.sport_category === selectedSport;

                return matchesSearch && matchesSport;
            })
            .sort((a, b) => {
                if (sortBy === 'name_asc') return (a.full_name || '').localeCompare(b.full_name || '');
                if (sortBy === 'name_desc') return (b.full_name || '').localeCompare(a.full_name || '');
                if (sortBy === 'records_desc') return (b.total_records || 0) - (a.total_records || 0);
                return 0;
            });
    }, [athletes, searchQuery, selectedSport, sortBy]);

    const activeFilterCount = (selectedSport !== 'all' ? 1 : 0) + (sortBy !== 'name_asc' ? 1 : 0);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedSport('all');
        setSortBy('name_asc');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Analisis DPA - Dynamic Posture Assessment" />

            <div className="space-y-6">
                {/* ─── 1. PAGE BANNER & STATS ─── */}
                <div className="bg-gradient-to-r from-slate-900 via-[#0c1908] to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-[#84cc16]/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                        <div className="space-y-1.5 max-w-xl">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#b4f031]/20 text-[#b4f031] text-xs font-bold border border-[#b4f031]/30">
                                <Activity size={12} />
                                <span>Dynamic Posture Assessment</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                                Analisis Postur Dinamis Atlet
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                Evaluasi pola gerak, identifikasi otot overactive / underactive, dan tentukan protokol korektif berbasis sains biomekanika.
                            </p>
                        </div>

                        {/* Quick Stats Badges */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-3.5 min-w-[110px]">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Atlet</span>
                                <span className="text-xl font-black text-white">{totalCount}</span>
                            </div>
                            <div className="bg-[#b4f031]/10 backdrop-blur-xs border border-[#b4f031]/30 rounded-xl p-3.5 min-w-[110px]">
                                <span className="text-[10px] uppercase font-bold text-[#b4f031] block">Sudah Dites</span>
                                <span className="text-xl font-black text-[#b4f031]">{testedCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── 2. SEARCH & FILTER TOOLBAR ─── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0D1322] border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl shadow-xs">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama, kode atlet, cabor..."
                            className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-[#84cc16] outline-none transition-all"
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

                    {/* Filter & Sort Controls */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Sport Filter */}
                        <select
                            value={selectedSport}
                            onChange={(e) => setSelectedSport(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#84cc16] cursor-pointer"
                        >
                            <option value="all">Semua Cabor</option>
                            {sportsList.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>

                        {/* Sort Filter */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#84cc16] cursor-pointer"
                        >
                            <option value="name_asc">Nama (A - Z)</option>
                            <option value="name_desc">Nama (Z - A)</option>
                            <option value="records_desc">Tes Terbanyak</option>
                        </select>

                        {activeFilterCount > 0 && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                title="Reset filter"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* ─── 3. ATHLETE GRID CARDS ─── */}
                {filteredAthletes.length === 0 ? (
                    <div className="py-16 px-4 flex flex-col items-center justify-center bg-white dark:bg-[#0D1322] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Search className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Atlet Tidak Ditemukan
                            </h4>
                            <p className="text-xs text-slate-400 max-w-sm">
                                Tidak ada atlet yang cocok dengan filter atau kueri pencarian saat ini.
                            </p>
                        </div>
                        {activeFilterCount > 0 && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="px-3.5 py-1.5 text-xs font-bold text-[#84cc16] hover:underline cursor-pointer"
                            >
                                Reset Semua Filter
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredAthletes.map((athlete) => {
                            const photo = athlete.photo_path
                                ? athlete.photo_path.startsWith('/')
                                    ? athlete.photo_path
                                    : `/storage/${athlete.photo_path}`
                                : null;

                            const totalRecords = athlete.total_records || 0;

                            return (
                                <Link
                                    key={athlete.id}
                                    href={route('dpa.athletes.show', athlete.id)}
                                    className="group bg-white dark:bg-[#0D1322] rounded-xl border border-slate-200/90 dark:border-slate-800 hover:border-[#84cc16] dark:hover:border-[#b4f031] shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="p-4 space-y-3.5">
                                        {/* Avatar & Info */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-11 h-11 rounded-xl border border-[#b4f031]/40 bg-[#b4f031]/10 text-slate-900 dark:text-[#b4f031] font-black text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
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

                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-[#84cc16] dark:group-hover:text-[#b4f031] transition-colors leading-tight">
                                                    {athlete.full_name}
                                                </h3>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                                    {athlete.sport_category} {athlete.position_specialty && `• ${athlete.position_specialty}`}
                                                </p>
                                                <span className="text-[10px] font-mono text-slate-400 block truncate">
                                                    {athlete.athlete_code}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Assessment Stats Card */}
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                            <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Riwayat
                                                </span>
                                                <div className="flex items-baseline gap-1 mt-0.5">
                                                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                                                        {totalRecords}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-medium">
                                                        evaluasi
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Status
                                                </span>
                                                <span
                                                    className={`text-[10px] font-extrabold mt-0.5 block truncate ${
                                                        totalRecords > 0
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-slate-400'
                                                    }`}
                                                >
                                                    {totalRecords > 0 ? 'Terdata' : 'Belum Ada'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            {totalRecords > 0 ? 'Klik untuk rincian' : 'Input evaluasi awal'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#84cc16] dark:text-[#b4f031] group-hover:translate-x-0.5 transition-transform">
                                            Analisis DPA
                                            <ArrowUpRight size={13} />
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
