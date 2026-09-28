import React, { useState } from 'react';
import Body, { ExtendedBodyPart, Slug } from 'react-muscle-highlighter';
import { Activity, Flame, Dumbbell } from 'lucide-react';

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
            terms: ['soleus', 'gastrocnemius', 'calves', 'betis', 'calf', 'lateral gastrocnemius', 'medial gastrocnemius'],
            slugs: ['calves'],
        },
        {
            terms: ['tibialis', 'anterior tibialis', 'posterior tibialis', 'shin', 'tibia'],
            slugs: ['tibialis', 'ankles'],
        },
        {
            terms: ['hamstring', 'biceps femoris', 'semitendinosus', 'semimembranosus', 'medial hamstring'],
            slugs: ['hamstring'],
        },
        {
            terms: ['quadriceps', 'vmo', 'vastus', 'rectus femoris', 'paha depan', 'quads', 'vastus medialis'],
            slugs: ['quadriceps'],
        },
        {
            terms: ['adductor', 'gracilis', 'adductor complex', 'selangkangan', 'groin', 'adductor magnus'],
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
            terms: ['psoas', 'hip flexor', 'iliopsoas', 'abs', 'rectus abdominis', 'perut', 'core', 'intrinsic core'],
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
            terms: ['upper back', 'latissimus', 'latissimus dorsi', 'rhomboid', 'lats', 'punggung', 'rhomboids'],
            slugs: ['upper-back'],
        },
        {
            terms: ['trapezius', 'trap', 'upper trap', 'lower trap', 'middle trap', 'leher belakang'],
            slugs: ['trapezius'],
        },
        {
            terms: ['neck', 'sternocleidomastoid', 'scalenes', 'leher', 'deep cervical flexors', 'longus capitis'],
            slugs: ['neck'],
        },
        {
            terms: ['chest', 'pectoralis', 'pecs', 'dada', 'pectoralis major', 'pectoralis minor'],
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
            terms: ['deltoid', 'shoulder', 'bahu', 'rotator cuff', 'anterior deltoid', 'posterior deltoid'],
            slugs: ['deltoids'],
        },
        {
            terms: ['forearm', 'lengan bawah', 'pergelangan tangan'],
            slugs: ['forearm'],
        },
        {
            terms: ['knee', 'patellar', 'lutut', 'patella', 'popliteus'],
            slugs: ['knees'],
        },
        {
            terms: ['foot', 'feet', 'ankle', 'engkel', 'pergelangan kaki', 'peroneals', 'peroneal complex'],
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
    // Overactive -> #f43f5e (Rose)
    // Underactive -> #10b981 (Emerald)
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

    const overactiveNames = overactiveMuscles
        ? overactiveMuscles
              .split(/[\r\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
    const underactiveNames = underactiveMuscles
        ? underactiveMuscles
              .split(/[\r\n,]+/)
              .map((s) => s.trim())
              .filter(Boolean)
        : [];

    return (
        <div className="space-y-3 py-1">
            {/* Header: Clean title & simple text controls without bulky frames */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[#84cc16] dark:text-[#b4f031]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Peta Anatomi Biomekanik
                    </span>
                </div>

                {/* Minimalist Controls */}
                <div className="flex items-center gap-3 text-[11px]">
                    {/* View options */}
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <button
                            type="button"
                            onClick={() => setViewMode('both')}
                            className={`cursor-pointer transition-colors ${
                                viewMode === 'both'
                                    ? 'font-bold text-slate-900 dark:text-white'
                                    : 'hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Semua
                        </button>
                        <span>·</span>
                        <button
                            type="button"
                            onClick={() => setViewMode('front')}
                            className={`cursor-pointer transition-colors ${
                                viewMode === 'front'
                                    ? 'font-bold text-slate-900 dark:text-white'
                                    : 'hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Depan
                        </button>
                        <span>·</span>
                        <button
                            type="button"
                            onClick={() => setViewMode('back')}
                            className={`cursor-pointer transition-colors ${
                                viewMode === 'back'
                                    ? 'font-bold text-slate-900 dark:text-white'
                                    : 'hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Belakang
                        </button>
                    </div>

                    <span className="text-slate-300 dark:text-slate-700">|</span>

                    {/* Gender options */}
                    <div className="flex items-center gap-1.5 text-slate-500">
                        <button
                            type="button"
                            onClick={() => setGender('male')}
                            className={`cursor-pointer transition-colors ${
                                gender === 'male'
                                    ? 'font-bold text-[#84cc16] dark:text-[#b4f031]'
                                    : 'hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Pria
                        </button>
                        <span>·</span>
                        <button
                            type="button"
                            onClick={() => setGender('female')}
                            className={`cursor-pointer transition-colors ${
                                gender === 'female'
                                    ? 'font-bold text-[#84cc16] dark:text-[#b4f031]'
                                    : 'hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Wanita
                        </button>
                    </div>
                </div>
            </div>

            {/* Seamless Anatomical Canvas - No box in a box */}
            <div className="flex items-center justify-center gap-8 py-2">
                {(viewMode === 'both' || viewMode === 'front') && (
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                            Anterior (Depan)
                        </span>
                        <div className="w-24 h-40 flex items-center justify-center pointer-events-none select-none">
                            <Body
                                data={bodyData}
                                side="front"
                                gender={gender}
                                scale={0.45}
                                defaultFill="#334155"
                                defaultStroke="#1e293b"
                                border="none"
                            />
                        </div>
                    </div>
                )}

                {(viewMode === 'both' || viewMode === 'back') && (
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                            Posterior (Belakang)
                        </span>
                        <div className="w-24 h-40 flex items-center justify-center pointer-events-none select-none">
                            <Body
                                data={bodyData}
                                side="back"
                                gender={gender}
                                scale={0.45}
                                defaultFill="#334155"
                                defaultStroke="#1e293b"
                                border="none"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Clean, Frameless Muscle Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                {/* Overactive */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                        <Flame size={13} className="text-rose-500 shrink-0" />
                        <span>Overactive (Tegang)</span>
                        <span className="text-[10px] font-normal text-slate-400">
                            ({overactiveNames.length})
                        </span>
                    </div>
                    {overactiveNames.length > 0 ? (
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                            {overactiveNames.join(', ')}
                        </p>
                    ) : (
                        <p className="text-[11px] text-slate-400 italic">
                            Tidak ada
                        </p>
                    )}
                </div>

                {/* Underactive */}
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Dumbbell size={13} className="text-emerald-500 shrink-0" />
                        <span>Underactive (Lemah)</span>
                        <span className="text-[10px] font-normal text-slate-400">
                            ({underactiveNames.length})
                        </span>
                    </div>
                    {underactiveNames.length > 0 ? (
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                            {underactiveNames.join(', ')}
                        </p>
                    ) : (
                        <p className="text-[11px] text-slate-400 italic">
                            Tidak ada
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
