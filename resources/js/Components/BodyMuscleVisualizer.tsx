import React, { useState } from 'react';
import Body, { ExtendedBodyPart, Slug } from 'react-muscle-highlighter';
import { Activity, Flame, Dumbbell, ShieldAlert, Zap } from 'lucide-react';

interface BodyMuscleVisualizerProps {
    overactiveMuscles?: string | string[];
    underactiveMuscles?: string | string[];
    possibleInjuries?: string | string[];
    category?: string;
    checkpoint?: string;
    title?: string;
    defaultTab?: 'muscles' | 'injuries';
    showModeSwitcher?: boolean;
    compact?: boolean;
    gender?: 'male' | 'female' | 'L' | 'P' | string;
    hideLegend?: boolean;
}

// Map Indonesian / Medical / English muscle keywords to body part slugs
function parseMusclesToSlugs(muscleInput?: string | string[]): Slug[] {
    if (!muscleInput) return [];
    const muscleText = Array.isArray(muscleInput) ? muscleInput.join('\n') : muscleInput;
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

// Map Injury and clinical pathology terms to body part slugs
function parseInjuriesToSlugs(injuryInput?: string | string[]): Slug[] {
    if (!injuryInput) return [];
    const injuryText = Array.isArray(injuryInput) ? injuryInput.join('\n') : injuryInput;
    if (!injuryText) return [];

    const keywords = injuryText.toLowerCase();
    const matchedSlugs = new Set<Slug>();

    const mappingRules: Array<{ terms: string[]; slugs: Slug[] }> = [
        {
            terms: ['plantar fasciitis', 'achilles', 'ankle sprain', 'shin splint', 'medial tibial', 'foot', 'feet', 'ankle', 'engkel', 'telapak'],
            slugs: ['feet', 'ankles', 'tibialis', 'calves'],
        },
        {
            terms: ['patellar tendinopathy', "jumper's knee", "runner's knee", 'patellofemoral', 'acl', 'meniscus', 'it band', 'it-band', 'valgus collapse', 'knee pain', 'lutut'],
            slugs: ['knees', 'quadriceps'],
        },
        {
            terms: ['hamstring strain', 'biceps femoris strain', 'semitendinosus'],
            slugs: ['hamstring'],
        },
        {
            terms: ['quad strain', 'quadriceps strain', 'rectus femoris'],
            slugs: ['quadriceps'],
        },
        {
            terms: ['groin strain', 'adductor strain', 'selangkangan'],
            slugs: ['adductors'],
        },
        {
            terms: ['low back pain', 'lower back strain', 'lower back sprain', 'lumbar', 'si joint', 'sacroiliac', 'pelvic asymmetry', 'rotational spine torque', 'pelvic-lumbar', 'pinggang'],
            slugs: ['lower-back', 'gluteal', 'abs', 'obliques'],
        },
        {
            terms: ['shoulder', 'rotator cuff', 'biceps tendonitis', 'shoulder impingement', 'shoulder injuries', 'bahu'],
            slugs: ['deltoids', 'upper-back', 'biceps', 'trapezius'],
        },
        {
            terms: ['headaches', 'neck pain', 'cervical strain', 'tension headache', 'leher', 'pusing'],
            slugs: ['neck', 'trapezius'],
        },
        {
            terms: ['trochanteric bursitis', 'lateral hip pain', 'piriformis syndrome', 'hip impingement', 'pinggul', 'bokong'],
            slugs: ['gluteal', 'quadriceps', 'adductors'],
        },
    ];

    for (const rule of mappingRules) {
        if (rule.terms.some((term) => keywords.includes(term))) {
            rule.slugs.forEach((s) => matchedSlugs.add(s));
        }
    }

    return Array.from(matchedSlugs);
}

const SLUG_LABELS: Record<string, { id: string; en: string }> = {
    abs: { id: 'Perut / Core', en: 'Abdominals' },
    adductors: { id: 'Paha Dalam / Selangkangan', en: 'Adductors' },
    ankles: { id: 'Pergelangan Kaki', en: 'Ankles' },
    biceps: { id: 'Lengan Depan', en: 'Biceps' },
    calves: { id: 'Betis', en: 'Gastrocnemius & Soleus' },
    chest: { id: 'Dada', en: 'Pectoralis' },
    deltoids: { id: 'Bahu', en: 'Deltoids' },
    feet: { id: 'Telapak & Kaki', en: 'Feet' },
    forearm: { id: 'Lengan Bawah', en: 'Forearms' },
    gluteal: { id: 'Bokong / Pinggul', en: 'Gluteals & Piriformis' },
    hamstring: { id: 'Paha Belakang', en: 'Hamstrings' },
    hands: { id: 'Tangan', en: 'Hands' },
    hair: { id: 'Kepala', en: 'Head' },
    head: { id: 'Kepala', en: 'Head' },
    knees: { id: 'Lutut / Patella', en: 'Knees' },
    'lower-back': { id: 'Punggung Bawah', en: 'Lumbar & Erector Spinae' },
    neck: { id: 'Leher', en: 'Cervical' },
    obliques: { id: 'Pinggang Samping', en: 'Obliques' },
    quadriceps: { id: 'Paha Depan', en: 'Quadriceps' },
    tibialis: { id: 'Tulang Kering / Betis Depan', en: 'Tibialis Anterior' },
    trapezius: { id: 'Punggung Atas & Leher Belakang', en: 'Trapezius' },
    triceps: { id: 'Lengan Belakang', en: 'Triceps' },
    'upper-back': { id: 'Punggung Atas & Belikat', en: 'Upper Back & Rhomboids' },
};

function parseItems(input?: string | string[]): string[] {
    if (!input) return [];
    if (Array.isArray(input)) {
        return input.flatMap((s) => s.split(/[\r\n,]+/)).map((s) => s.trim()).filter(Boolean);
    }
    return input.split(/[\r\n,]+/).map((s) => s.trim()).filter(Boolean);
}

export default function BodyMuscleVisualizer({
    overactiveMuscles,
    underactiveMuscles,
    possibleInjuries,
    category,
    checkpoint,
    title = 'Peta Anatomi Biomekanik',
    compact = false,
    gender = 'male',
    hideLegend = false,
}: BodyMuscleVisualizerProps) {
    const [viewMode, setViewMode] = useState<'both' | 'front' | 'back'>('both');
    const [hoveredInfo, setHoveredInfo] = useState<{
        slug: string;
        type: 'injuries' | 'muscles';
        x: number;
        y: number;
    } | null>(null);

    // Automatically resolve silhouette model from athlete's gender
    const resolvedGender: 'male' | 'female' =
        gender === 'female' || gender === 'P' || gender === 'Perempuan' || gender === 'Female' || gender === 'F'
            ? 'female'
            : 'male';

    const overactiveSlugs = parseMusclesToSlugs(overactiveMuscles);
    const underactiveSlugs = parseMusclesToSlugs(underactiveMuscles);
    const injurySlugs = parseInjuriesToSlugs(possibleInjuries);

    const overactiveNames = parseItems(overactiveMuscles);
    const underactiveNames = parseItems(underactiveMuscles);
    const injuryNames = parseItems(possibleInjuries);

    const hasMuscles = overactiveNames.length > 0 || underactiveNames.length > 0 || overactiveSlugs.length > 0 || underactiveSlugs.length > 0;
    const hasInjuries = injuryNames.length > 0 || injurySlugs.length > 0;
    const isCombined = hasMuscles && hasInjuries;

    // Muscle Imbalances Data: Overactive (Rose) & Underactive (Emerald)
    const muscleBodyData: ExtendedBodyPart[] = [
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

    // Injury Risks Data: Hotspots (Amber/Orange)
    const injuryBodyData: ExtendedBodyPart[] = injurySlugs.map((slug) => ({
        slug,
        color: '#f59e0b',
        intensity: 1,
    }));

    // Find specific findings for a hovered body part slug
    const getFindingsForSlug = (slug: string) => {
        const matchingOveractive = overactiveNames.filter((item) =>
            parseMusclesToSlugs(item).includes(slug as Slug)
        );
        const matchingUnderactive = underactiveNames.filter((item) =>
            parseMusclesToSlugs(item).includes(slug as Slug)
        );
        const matchingInjuries = injuryNames.filter((item) =>
            parseInjuriesToSlugs(item).includes(slug as Slug)
        );

        return {
            overactive: matchingOveractive,
            underactive: matchingUnderactive,
            injuries: matchingInjuries,
            label: SLUG_LABELS[slug] || { id: slug, en: slug },
        };
    };

    const handleCanvasMouseMove = (
        e: React.MouseEvent<HTMLDivElement>,
        type: 'injuries' | 'muscles'
    ) => {
        const target = e.target as SVGElement;
        const slug = (target.getAttribute('id') || target.id) as string;
        if (slug && SLUG_LABELS[slug]) {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredInfo({
                slug,
                type,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleCanvasMouseLeave = () => {
        setHoveredInfo(null);
    };

    return (
        <div className="space-y-3 py-1">
            {/* Top Bar Controls */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[#84cc16] dark:text-[#b4f031]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {title}
                    </span>
                    {(category || checkpoint) && (
                        <span className="text-[10px] text-slate-400 font-medium">
                            • {[category, checkpoint].filter(Boolean).join(' - ')}
                        </span>
                    )}
                </div>

                {/* Minimalist View Controls (Semua · Depan · Belakang) */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
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
            </div>

            {/* SECTION 1: RISIKO CEDERA */}
            {hasInjuries && (
                <div className={`space-y-2 ${isCombined ? 'p-2.5 bg-slate-50/50 dark:bg-slate-950/40 rounded-lg border border-amber-500/20 dark:border-amber-500/30' : ''}`}>
                    {isCombined && (
                        <div className="flex items-center justify-between pb-1 border-b border-amber-500/15 dark:border-amber-500/20">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                                <ShieldAlert size={13} className="text-amber-500" />
                                <span>Peta Area Potensi Risiko Cedera</span>
                            </div>
                            <span className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                {injuryNames.length} Temuan
                            </span>
                        </div>
                    )}

                    {/* Anatomical Canvas for Injuries */}
                    <div
                        className="relative flex items-center justify-center gap-6 sm:gap-10 py-2 bg-slate-50/70 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800 select-none"
                        onMouseMove={(e) => handleCanvasMouseMove(e, 'injuries')}
                        onMouseLeave={handleCanvasMouseLeave}
                    >
                        {(viewMode === 'both' || viewMode === 'front') && (
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                                    Anterior (Depan)
                                </span>
                                <div className="w-24 h-40 flex items-center justify-center">
                                    <Body
                                        data={injuryBodyData}
                                        side="front"
                                        gender={resolvedGender}
                                        scale={compact ? 0.38 : 0.45}
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
                                <div className="w-24 h-40 flex items-center justify-center">
                                    <Body
                                        data={injuryBodyData}
                                        side="back"
                                        gender={resolvedGender}
                                        scale={compact ? 0.38 : 0.45}
                                        defaultFill="#334155"
                                        defaultStroke="#1e293b"
                                        border="none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Interactive Floating Hover Tooltip (Injuries) */}
                        {hoveredInfo && hoveredInfo.type === 'injuries' && (() => {
                            const findings = getFindingsForSlug(hoveredInfo.slug);
                            return (
                                <div
                                    className="absolute z-50 pointer-events-none p-2.5 bg-slate-900/95 dark:bg-slate-900 text-white rounded-md shadow-xl border border-slate-700/80 max-w-[240px] text-left animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xs"
                                    style={{
                                        left: Math.min(Math.max(hoveredInfo.x + 12, 10), 220),
                                        top: Math.max(hoveredInfo.y - 45, 10),
                                    }}
                                >
                                    <div className="pb-1 mb-1 border-b border-slate-700 flex items-center justify-between gap-1.5">
                                        <span className="font-bold text-[11px] text-amber-400">
                                            {findings.label.id}
                                        </span>
                                        <span className="text-[9px] text-slate-400">
                                            {findings.label.en}
                                        </span>
                                    </div>

                                    {findings.injuries.length > 0 ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                                                <ShieldAlert size={10} />
                                                <span>Risiko Cedera:</span>
                                            </div>
                                            <ul className="text-[10px] space-y-0.5 pl-2 border-l border-amber-500/40 text-slate-200">
                                                {findings.injuries.map((item, idx) => (
                                                    <li key={idx} className="leading-tight">
                                                        • {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 italic">
                                            Tidak ada risiko cedera pada area ini.
                                        </p>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Injury Details (Hidden if hideLegend is true) */}
                    {!hideLegend && injuryNames.length > 0 && (
                        <div className="pt-1 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
                            <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                                Catatan Hotspot Cedera:
                            </span>
                            {injuryNames.join(', ')}
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 2: KETIDAKSEIMBANGAN OTOT */}
            {hasMuscles && (
                <div className={`space-y-2 ${isCombined ? 'p-2.5 bg-slate-50/50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800' : ''}`}>
                    {isCombined && (
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                <Flame size={13} className="text-rose-500" />
                                <span>Peta Ketidakseimbangan Otot</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                                    {overactiveNames.length} Overactive
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                                    {underactiveNames.length} Underactive
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Anatomical Canvas for Muscles */}
                    <div
                        className="relative flex items-center justify-center gap-6 sm:gap-10 py-2 bg-slate-50/70 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800 select-none"
                        onMouseMove={(e) => handleCanvasMouseMove(e, 'muscles')}
                        onMouseLeave={handleCanvasMouseLeave}
                    >
                        {(viewMode === 'both' || viewMode === 'front') && (
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1">
                                    Anterior (Depan)
                                </span>
                                <div className="w-24 h-40 flex items-center justify-center">
                                    <Body
                                        data={muscleBodyData}
                                        side="front"
                                        gender={resolvedGender}
                                        scale={compact ? 0.38 : 0.45}
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
                                <div className="w-24 h-40 flex items-center justify-center">
                                    <Body
                                        data={muscleBodyData}
                                        side="back"
                                        gender={resolvedGender}
                                        scale={compact ? 0.38 : 0.45}
                                        defaultFill="#334155"
                                        defaultStroke="#1e293b"
                                        border="none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Interactive Floating Hover Tooltip (Muscles) */}
                        {hoveredInfo && hoveredInfo.type === 'muscles' && (() => {
                            const findings = getFindingsForSlug(hoveredInfo.slug);
                            const hasAny = findings.overactive.length > 0 || findings.underactive.length > 0;
                            return (
                                <div
                                    className="absolute z-50 pointer-events-none p-2.5 bg-slate-900/95 dark:bg-slate-900 text-white rounded-md shadow-xl border border-slate-700/80 max-w-[240px] text-left animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xs"
                                    style={{
                                        left: Math.min(Math.max(hoveredInfo.x + 12, 10), 220),
                                        top: Math.max(hoveredInfo.y - 45, 10),
                                    }}
                                >
                                    <div className="pb-1 mb-1 border-b border-slate-700 flex items-center justify-between gap-1.5">
                                        <span className="font-bold text-[11px] text-white">
                                            {findings.label.id}
                                        </span>
                                        <span className="text-[9px] text-slate-400">
                                            {findings.label.en}
                                        </span>
                                    </div>

                                    {findings.overactive.length > 0 && (
                                        <div className="space-y-0.5 mb-1.5">
                                            <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-400">
                                                <Flame size={10} />
                                                <span>Overactive (Tegang):</span>
                                            </div>
                                            <ul className="text-[10px] space-y-0.5 pl-2 border-l border-rose-500/40 text-slate-200">
                                                {findings.overactive.map((item, idx) => (
                                                    <li key={idx} className="leading-tight">
                                                        • {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {findings.underactive.length > 0 && (
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                                                <Dumbbell size={10} />
                                                <span>Underactive (Lemah):</span>
                                            </div>
                                            <ul className="text-[10px] space-y-0.5 pl-2 border-l border-emerald-500/40 text-slate-200">
                                                {findings.underactive.map((item, idx) => (
                                                    <li key={idx} className="leading-tight">
                                                        • {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {!hasAny && (
                                        <p className="text-[10px] text-slate-400 italic">
                                            Kondisi normal / seimbang.
                                        </p>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Legend (Hidden if hideLegend is true) */}
                    {!hideLegend && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                                        Tidak ada otot overactive
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
                                        Tidak ada otot underactive
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
