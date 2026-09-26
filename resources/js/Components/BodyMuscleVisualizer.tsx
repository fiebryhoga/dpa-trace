import React, { useState } from 'react';
import Body, { ExtendedBodyPart, Slug } from 'react-muscle-highlighter';
import { User, Users, Eye, Sparkles } from 'lucide-react';

interface BodyMuscleVisualizerProps {
    overactiveMuscles: string;
    underactiveMuscles: string;
    category?: string;
    checkpoint?: string;
}

// Map Indonesian / Medical / English muscle keywords to body part slugs
function parseMusclesToSlugs(muscleText: string): Slug[] {
    if (!muscleText) return [];
    const keywords = muscleText.toLowerCase();
    const matchedSlugs = new Set<Slug>();

    const mappingRules: Array<{ terms: string[]; slugs: Slug[] }> = [
        {
            terms: ['soleus', 'gastrocnemius', 'calves', 'betis', 'calf'],
            slugs: ['calves'],
        },
        {
            terms: ['tibialis', 'anterior tibialis', 'posterior tibialis', 'shin', 'tibia'],
            slugs: ['tibialis', 'ankles'],
        },
        {
            terms: ['hamstring', 'biceps femoris', 'semitendinosus', 'semimembranosus'],
            slugs: ['hamstring'],
        },
        {
            terms: ['quadriceps', 'vmo', 'vastus', 'rectus femoris', 'paha depan', 'quads'],
            slugs: ['quadriceps'],
        },
        {
            terms: ['adductor', 'gracilis', 'adductor complex', 'selangkangan', 'groin'],
            slugs: ['adductors'],
        },
        {
            terms: ['tfl', 'tensor fasciae latae', 'abductor', 'gluteus medius', 'gluteus minimus', 'it band', 'it-band'],
            slugs: ['gluteal', 'quadriceps'],
        },
        {
            terms: ['gluteus maximus', 'gluteus', 'gluteal', 'glutes', 'bokong', 'piriformis'],
            slugs: ['gluteal'],
        },
        {
            terms: ['psoas', 'hip flexor', 'iliopsoas', 'abs', 'rectus abdominis', 'perut', 'core'],
            slugs: ['abs'],
        },
        {
            terms: ['oblique', 'obliques', 'pinggang'],
            slugs: ['obliques'],
        },
        {
            terms: ['lower back', 'erector spinae', 'lumbar', 'pinggang bawah', 'punggung bawah'],
            slugs: ['lower-back'],
        },
        {
            terms: ['upper back', 'latissimus', 'latissimus dorsi', 'rhomboid', 'lats', 'punggung'],
            slugs: ['upper-back'],
        },
        {
            terms: ['trapezius', 'trap', 'upper trap', 'leher belakang'],
            slugs: ['trapezius'],
        },
        {
            terms: ['neck', 'sternocleidomastoid', 'scalenes', 'leher'],
            slugs: ['neck'],
        },
        {
            terms: ['chest', 'pectoralis', 'pecs', 'dada'],
            slugs: ['chest'],
        },
        {
            terms: ['biceps', 'biceps brachii', 'lengan depan'],
            slugs: ['biceps'],
        },
        {
            terms: ['triceps', 'lengan belakang'],
            slugs: ['triceps'],
        },
        {
            terms: ['deltoid', 'shoulder', 'bahu', 'rotator cuff'],
            slugs: ['deltoids'],
        },
        {
            terms: ['forearm', 'lengan bawah', 'pergelangan tangan'],
            slugs: ['forearm'],
        },
        {
            terms: ['knee', 'patellar', 'lutut', 'patella'],
            slugs: ['knees'],
        },
        {
            terms: ['foot', 'feet', 'ankle', 'engkel', 'pergelangan kaki'],
            slugs: ['feet', 'ankles'],
        },
    ];

    for (const rule of mappingRules) {
        if (rule.terms.some((term) => keywords.includes(term))) {
            rule.slugs.forEach((s) => matchedSlugs.add(s));
        }
    }

    return Array.from(matchedSlugs);
}

export default function BodyMuscleVisualizer({
    overactiveMuscles,
    underactiveMuscles,
}: BodyMuscleVisualizerProps) {
    const [viewMode, setViewMode] = useState<'both' | 'front' | 'back'>('both');
    const [gender, setGender] = useState<'male' | 'female'>('male');

    const overactiveSlugs = parseMusclesToSlugs(overactiveMuscles);
    const underactiveSlugs = parseMusclesToSlugs(underactiveMuscles);

    // Build data array for react-muscle-highlighter
    // Overactive -> #f43f5e (Rose / Red)
    // Underactive -> #10b981 (Emerald / Green)
    const bodyData: ExtendedBodyPart[] = [
        ...overactiveSlugs.map((slug) => ({
            slug,
            color: '#f43f5e',
            intensity: 1,
        })),
        ...underactiveSlugs
            .filter((slug) => !overactiveSlugs.includes(slug))
            .map((slug) => ({
                slug,
                color: '#10b981',
                intensity: 1,
            })),
    ];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3.5">
            {/* Header with Title & Controls */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#84cc16]/10 dark:bg-[#b4f031]/10 flex items-center justify-center">
                        <Sparkles size={13} className="text-[#84cc16] dark:text-[#b4f031]" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                            Peta Anatomi Biomekanik
                        </h3>
                        <p className="text-[10px] text-slate-400">
                            Visualisasi serabut otot interaktif
                        </p>
                    </div>
                </div>

                {/* Gender Toggle */}
                <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800/90 p-0.5 text-[11px]">
                    <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                            gender === 'male'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Pria
                    </button>
                    <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                            gender === 'female'
                                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Wanita
                    </button>
                </div>
            </div>

            {/* View Switcher Pills */}
            <div className="flex items-center justify-center gap-1 bg-slate-100/70 dark:bg-slate-950/60 p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => setViewMode('both')}
                    className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer text-center ${
                        viewMode === 'both'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    Depan & Belakang
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode('front')}
                    className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer text-center ${
                        viewMode === 'front'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    Depan Saja
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode('back')}
                    className={`flex-1 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer text-center ${
                        viewMode === 'back'
                            ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    Belakang Saja
                </button>
            </div>

            {/* SVG Anatomy Canvas */}
            <div className="flex items-center justify-center gap-2 py-3 px-1 bg-slate-50/60 dark:bg-slate-950/80 rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden min-h-[240px]">
                {(viewMode === 'both' || viewMode === 'front') && (
                    <div className="flex flex-col items-center flex-1 max-w-[140px]">
                        <span className="text-[10px] font-semibold text-slate-400 mb-1">
                            Anterior (Depan)
                        </span>
                        <div className="w-full h-[210px] flex items-center justify-center">
                            <Body
                                data={bodyData}
                                side="front"
                                gender={gender}
                                scale={0.76}
                                defaultFill="#334155"
                                defaultStroke="#1e293b"
                                border="none"
                            />
                        </div>
                    </div>
                )}

                {(viewMode === 'both' || viewMode === 'back') && (
                    <div className="flex flex-col items-center flex-1 max-w-[140px]">
                        <span className="text-[10px] font-semibold text-slate-400 mb-1">
                            Posterior (Belakang)
                        </span>
                        <div className="w-full h-[210px] flex items-center justify-center">
                            <Body
                                data={bodyData}
                                side="back"
                                gender={gender}
                                scale={0.76}
                                defaultFill="#334155"
                                defaultStroke="#1e293b"
                                border="none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Color Legend Cards */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 shadow-xs" />
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 leading-none">
                            {overactiveSlugs.length} Overactive
                        </p>
                        <p className="text-[9px] text-rose-600/80 dark:text-rose-400/70 truncate mt-0.5">
                            Tegang / Dominan
                        </p>
                    </div>
                </div>

                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 shadow-xs" />
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-none">
                            {underactiveSlugs.length} Underactive
                        </p>
                        <p className="text-[9px] text-emerald-600/80 dark:text-emerald-400/70 truncate mt-0.5">
                            Lemah / Terhambat
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
