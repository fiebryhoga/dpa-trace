import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import {
    Edit2,
    Image as ImageIcon,
    Activity,
    Search,
    X,
    Layers,
    ShieldAlert,
} from 'lucide-react';
import { DpaCompensation, PageProps } from '@/types';

interface CompensationsIndexProps extends PageProps {
    compensations: DpaCompensation[];
}

const CATEGORY_ORDER = [
    'Anterior View',
    'Lateral View',
    'Posterior View',
    'Single Leg',
];

const CATEGORY_INFO: Record<string, { label: string; description: string }> = {
    'Anterior View': {
        label: 'Tampak Depan (Anterior View)',
        description: 'Observasi kinetik kaki, pergelangan kaki, dan lutut dari sudut pandang depan.',
    },
    'Lateral View': {
        label: 'Tampak Samping (Lateral View)',
        description: 'Observasi kinetik LPHC (pinggang/panggul), bahu, dan kepala dari sudut pandang samping.',
    },
    'Posterior View': {
        label: 'Tampak Belakang (Posterior View)',
        description: 'Observasi kinetik tumit, arkus kaki, skapula, dan panggul dari sudut pandang belakang.',
    },
    'Single Leg': {
        label: 'Keseimbangan Satu Kaki (Single Leg)',
        description: 'Penilaian transisi dinamis penopang tunggal tubuh dan stabilitas panggul.',
    },
};

function CompensationCard({
    item,
}: {
    item: DpaCompensation;
}) {
    const image = item.image_path
        ? item.image_path.startsWith('/')
            ? item.image_path
            : `/storage/${item.image_path}`
        : null;

    const overactiveList = item.overactive_muscles
        ? item.overactive_muscles
              .split(/\r?\n|,/)
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    const underactiveList = item.underactive_muscles
        ? item.underactive_muscles
              .split(/\r?\n|,/)
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    const possibleInjuriesList = item.possible_injuries
        ? item.possible_injuries
              .split(/\r?\n|,/)
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    const exerciseCount = item.exercises?.length || 0;

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div>
                {/* ── Visual Media / Image Banner ── */}
                {image ? (
                    <div className="w-full h-36 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800/80 p-3 flex items-center justify-center relative overflow-hidden group/img">
                        <img
                            src={image}
                            alt={item.name}
                            className="w-full h-full object-contain transition-transform duration-300 group-hover/img:scale-105"
                        />
                        {item.checkpoint && (
                            <div className="absolute top-2.5 left-2.5">
                                <span className="inline-flex items-center text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs border border-slate-200/80 dark:border-slate-800">
                                    {item.checkpoint}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="px-4 pt-3.5 pb-0 flex items-center justify-between gap-2">
                        {item.checkpoint ? (
                            <span className="inline-flex items-center text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                                {item.checkpoint}
                            </span>
                        ) : (
                            <span className="inline-flex items-center text-[10px] font-medium text-slate-400">
                                Umum
                            </span>
                        )}
                        <Link
                            href={route('dpa-compensations.edit', item.slug || item.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit Kompensasi"
                        >
                            <Edit2 size={12} />
                        </Link>
                    </div>
                )}

                {/* ── Content Body ── */}
                <div className="p-4 space-y-3">
                    {/* Header Row if image was present */}
                    {image && (
                        <div className="flex items-center justify-between gap-2 -mt-0.5">
                            <span className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500">
                                {item.category}
                            </span>
                            <Link
                                href={route('dpa-compensations.edit', item.slug || item.id)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit Kompensasi"
                            >
                                <Edit2 size={12} />
                            </Link>
                        </div>
                    )}

                    {/* Title */}
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
                        {item.name}
                    </h4>

                    {/* Muscle Imbalance Breakdown - Clean Typography without heavy badge backgrounds */}
                    <div className="space-y-2.5 pt-0.5 text-xs">
                        {/* Overactive */}
                        {overactiveList.length > 0 && (
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                    <span>Overactive ({overactiveList.length})</span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 pl-3 leading-relaxed line-clamp-2" title={overactiveList.join(', ')}>
                                    {overactiveList.join(', ')}
                                </p>
                            </div>
                        )}

                        {/* Underactive */}
                        {underactiveList.length > 0 && (
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span>Underactive ({underactiveList.length})</span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 pl-3 leading-relaxed line-clamp-2" title={underactiveList.join(', ')}>
                                    {underactiveList.join(', ')}
                                </p>
                            </div>
                        )}

                        {/* Possible Injuries */}
                        {possibleInjuriesList.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                    <ShieldAlert size={12} className="text-amber-500 shrink-0 mt-0.5" />
                                    <span className="line-clamp-1 leading-tight" title={possibleInjuriesList.join(', ')}>
                                        <strong className="font-medium text-slate-700 dark:text-slate-300">Risiko:</strong> {possibleInjuriesList.join(', ')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers size={13} className="text-[#84cc16] dark:text-[#b4f031]" />
                    <span>{exerciseCount} latihan korektif</span>
                </span>
                <Link
                    href={route('dpa-compensations.edit', item.slug || item.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#84cc16] dark:text-[#b4f031] hover:underline cursor-pointer group-hover:translate-x-0.5 transition-transform"
                >
                    <span>Edit Kompensasi</span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    );
}

export default function CompensationsIndex({
    compensations = [],
}: CompensationsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Extract all distinct categories
    const allCategories = Array.from(
        new Set([
            ...CATEGORY_ORDER,
            ...compensations.map((c) => c.category).filter(Boolean),
        ])
    );

    // Filter by search
    const matchesSearch = (c: DpaCompensation) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
            c.name?.toLowerCase().includes(q) ||
            c.category?.toLowerCase().includes(q) ||
            c.checkpoint?.toLowerCase().includes(q) ||
            c.overactive_muscles?.toLowerCase().includes(q) ||
            c.underactive_muscles?.toLowerCase().includes(q) ||
            c.possible_injuries?.toLowerCase().includes(q)
        );
    };

    const filteredCompensations = compensations.filter((c) => {
        const matchesCategory =
            selectedCategory === 'All' || c.category === selectedCategory;
        return matchesCategory && matchesSearch(c);
    });

    // Categories to render
    const displayCategories = selectedCategory === 'All'
        ? allCategories.filter((cat) => {
              // Only display categories that have items matching search
              return compensations.some((c) => c.category === cat && matchesSearch(c));
          })
        : [selectedCategory];

    return (
        <AuthenticatedLayout>
            <Head title="Master Data Kompensasi Postur - Athlete DPA" />

            <div className="space-y-6 pb-16">
                {/* ─── PAGE HEADER WITH SEARCH BAR ONLY (NO ADD BUTTON) ─── */}
                <PageHeader
                    icon={Activity}
                    title={
                        <>
                            Master Data Kompensasi{' '}
                            <span className="text-[#84cc16] dark:text-[#b4f031]">Postur (DPA)</span>
                        </>
                    }
                    description="Basis data deviasi kinetik tubuh, pemetaan ketidakseimbangan otot (overactive & underactive), serta protokol 4 fase latihan korektif NASM."
                    actions={
                        <div className="relative w-64">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari kompensasi, checkpoint..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#84cc16] dark:focus:border-[#b4f031] transition-all shadow-2xs"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    }
                />

                {/* ─── FILTER SEGMENTED TABS (SHADCN UI STYLE) ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('All')}
                            className={`px-3 py-1.5 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                selectedCategory === 'All'
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                            }`}
                        >
                            <span>Semua Kategori</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
                                {compensations.length}
                            </span>
                        </button>
                        {allCategories.map((cat) => {
                            const count = compensations.filter((c) => c.category === cat).length;
                            const isActive = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-md text-xs transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                                        isActive
                                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                                    }`}
                                >
                                    <span>{cat}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0 px-1">
                        {filteredCompensations.length} pola deviasi standar NASM
                    </span>
                </div>

                {/* ─── CATEGORY-GROUPED OR FILTERED SECTIONS ─── */}
                {filteredCompensations.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md text-center py-12 px-4 shadow-xs space-y-2">
                        <ImageIcon className="h-8 w-8 text-slate-400 mx-auto" />
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            Tidak Ada Data Kompensasi
                        </h4>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            Tidak ditemukan data pola kompensasi untuk kriteria pencarian ini.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {displayCategories.map((category) => {
                            const categoryItems = filteredCompensations.filter(
                                (c) => c.category === category
                            );

                            if (categoryItems.length === 0) return null;

                            const info = CATEGORY_INFO[category] || {
                                label: category,
                                description: `Kompensasi pada kategori ${category}`,
                            };

                            return (
                                <section key={category} className="space-y-3.5">
                                    {/* Category Section Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200/80 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#84cc16] dark:bg-[#b4f031]" />
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {info.label}
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                {categoryItems.length} kompensasi
                                            </span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 hidden sm:block">
                                            {info.description}
                                        </p>
                                    </div>

                                    {/* Cards Grid for this category */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {categoryItems.map((item) => (
                                            <CompensationCard
                                                key={item.id}
                                                item={item}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
