import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Edit,
    Trash2,
    Image as ImageIcon,
    Activity,
    Search,
    X,
    Flame,
    Dumbbell,
    ShieldAlert,
    ChevronRight,
} from 'lucide-react';
import { DpaCompensation, PageProps } from '@/types';

interface CompensationsIndexProps extends PageProps {
    compensations: DpaCompensation[];
}

export default function CompensationsIndex({
    auth,
    compensations = [],
}: CompensationsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        'Posterior View',
        'Lateral View',
        'Anterior View',
        'Single Leg',
    ];

    const handleDelete = (item: DpaCompensation) => {
        if (confirm(`Hapus kompensasi "${item.name}" secara permanen?`)) {
            router.delete(route('dpa-compensations.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    const filteredCompensations = compensations.filter((c) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q) ||
            c.checkpoint?.toLowerCase().includes(q)
        );
    });

    return (
        <AuthenticatedLayout>
            <Head title="Master Data Kompensasi DPA" />

            <div className="space-y-6 pb-12">
                {/* ─── HEADER BANNER ─── */}
                <div className="bg-white dark:bg-[#0D1322] border border-slate-200/90 dark:border-slate-800 rounded-lg p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] text-[11px] font-bold border border-[#b4f031]/40 uppercase tracking-wider">
                            <Activity size={12} />
                            <span>Database Biomekanika</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            Master Data Kompensasi Postur (DPA)
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Kelola daftar pola kompensasi, pemetaan otot, risiko cedera, dan protokol 4 fase latihan korektif NASM.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dpa-compensations.create')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#b4f031] hover:bg-[#a2dd26] text-slate-950 text-xs font-extrabold shadow-sm shadow-[#b4f031]/25 transition-all cursor-pointer"
                        >
                            <Plus size={14} />
                            <span>Tambah Kompensasi</span>
                        </Link>
                    </div>
                </div>

                {/* ─── SEARCH TOOLBAR ─── */}
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari nama kompensasi, checkpoint..."
                        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 rounded-lg text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-[#b4f031] outline-none shadow-2xs"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* ─── CATEGORIZED LIST OF COMPENSATIONS ─── */}
                <div className="space-y-8">
                    {categories.map((category) => {
                        const catItems = filteredCompensations.filter((c) => c.category === category);

                        return (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] dark:bg-[#b4f031]" />
                                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                        {category}
                                    </h3>
                                    <span className="bg-[#b4f031]/20 text-slate-900 dark:text-[#b4f031] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#b4f031]/40">
                                        {catItems.length} pola
                                    </span>
                                </div>

                                {catItems.length === 0 ? (
                                    <div className="py-8 px-4 flex flex-col items-center justify-center bg-white dark:bg-[#0D1322] border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center space-y-2">
                                        <ImageIcon className="w-6 h-6 text-slate-400" />
                                        <p className="text-xs text-slate-400 font-medium">
                                            Belum ada kompensasi yang didaftarkan untuk kategori {category}.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {catItems.map((item) => {
                                            const image = item.image_path
                                                ? item.image_path.startsWith('/')
                                                    ? item.image_path
                                                    : `/storage/${item.image_path}`
                                                : null;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="group bg-white dark:bg-[#0D1322] rounded-lg border border-slate-200/90 dark:border-slate-800 hover:border-[#84cc16] dark:hover:border-[#b4f031] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                                                >
                                                    <div className="p-4 space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden">
                                                                {image ? (
                                                                    <img
                                                                        src={image}
                                                                        className="w-full h-full object-contain p-1"
                                                                        alt={item.name}
                                                                    />
                                                                ) : (
                                                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug line-clamp-2">
                                                                    {item.name}
                                                                </h4>
                                                                {item.checkpoint && (
                                                                    <span className="text-[10px] font-semibold text-[#84cc16] dark:text-[#b4f031] block">
                                                                        {item.checkpoint}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Summary Tiles */}
                                                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                                            <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-0.5">
                                                                <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                                                                    <Flame size={10} /> Overactive
                                                                </span>
                                                                <p className="text-[10.5px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-tight">
                                                                    {item.overactive_muscles || '-'}
                                                                </p>
                                                            </div>

                                                            <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-0.5">
                                                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                                                    <Dumbbell size={10} /> Underactive
                                                                </span>
                                                                <p className="text-[10.5px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-tight">
                                                                    {item.underactive_muscles || '-'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions Footer */}
                                                    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                            {item.category.split(' ')[0]}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <Link
                                                                href={route('dpa-compensations.edit', item.id)}
                                                                className="p-1.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 hover:bg-[#b4f031]/20 text-slate-700 dark:text-slate-200 hover:text-[#84cc16] transition-colors"
                                                                title="Edit Kompensasi"
                                                            >
                                                                <Edit size={13} />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(item)}
                                                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                                                title="Hapus Kompensasi"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
