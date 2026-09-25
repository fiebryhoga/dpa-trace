import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Badge } from '@/Components/ui/Badge';
import {
    Users,
    UserPlus,
    Search,
    Activity,
    ChevronRight,
} from 'lucide-react';

interface AthleteItem {
    id: number;
    athlete_code: string;
    full_name: string;
    nickname?: string;
    gender: 'L' | 'P';
    age?: number;
    calculated_age?: number;
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    bmi_category?: string;
    sport_category: string;
    position_specialty?: string;
    club_institution?: string;
    is_active: boolean;
    dpa_assessments_count: number;
    dpa_assessments: Array<{
        id: number;
        assessment_date: string;
    }>;
}

interface IndexProps {
    athletes: {
        data: AthleteItem[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
    };
    filters: {
        search: string;
        sport: string;
    };
    sportsList: string[];
    totalCount: number;
    activeCount: number;
}

export default function AthleteIndex({
    athletes,
    filters,
    sportsList,
    totalCount,
    activeCount,
}: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [sport, setSport] = useState(filters.sport || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('athletes.index'),
            { search, sport },
            { preserveState: true, replace: true },
        );
    };

    const handleSportChange = (newSport: string) => {
        setSport(newSport);
        router.get(
            route('athletes.index'),
            { search, sport: newSport },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Athletes Directory - Dynamic Posture Assessment" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Athletes Directory
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Athlete profiles, anthropometry, and Dynamic Posture Assessment records
                        </p>
                    </div>

                    <Link href={route('athletes.create')}>
                        <Button size="sm" className="gap-1.5 text-xs shadow-brand">
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Add New Athlete</span>
                        </Button>
                    </Link>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleSearch} className="w-full sm:w-80 flex gap-2">
                        <Input
                            type="text"
                            placeholder="Search athlete, code, specialty..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />}
                            className="h-9 text-xs"
                        />
                        <Button type="submit" size="sm" variant="secondary" className="h-9 px-3">
                            Search
                        </Button>
                    </form>

                    {/* Sport Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => handleSportChange('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                sport === 'all'
                                    ? 'bg-[#b4f031] text-slate-950 font-bold shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-[#b4f031]'
                            }`}
                        >
                            All ({totalCount})
                        </button>
                        {sportsList.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => handleSportChange(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    sport === s
                                        ? 'bg-[#b4f031] text-slate-950 font-bold shadow-sm'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-[#b4f031]'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Athletes Grid */}
                {athletes.data.length === 0 ? (
                    <Card className="border-slate-200 dark:border-slate-800 text-center py-12">
                        <CardContent className="space-y-3">
                            <Users className="h-10 w-10 text-slate-400 mx-auto" />
                            <h3 className="text-sm font-semibold">No Athlete Records Found</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                No athlete matches your current search criteria or category filter.
                            </p>
                            <Link href={route('athletes.create')}>
                                <Button size="sm" className="mt-2 text-xs">
                                    Add Athlete Now
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {athletes.data.map((ath) => {
                            const lastAssessment = ath.dpa_assessments?.[0];
                            return (
                                <Card
                                    key={ath.id}
                                    className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] hover:border-[#b4f031]/80 transition-all hover:shadow-brand"
                                >
                                    <CardHeader className="p-4 pb-2 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <Badge variant="brand" className="text-[10px] mb-1">
                                                    {ath.athlete_code}
                                                </Badge>
                                                <CardTitle className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                                                    {ath.full_name}
                                                </CardTitle>
                                            </div>
                                            <Badge
                                                variant={ath.gender === 'L' ? 'sky' : 'brand'}
                                                className="text-[10px]"
                                            >
                                                {ath.gender === 'L' ? 'Male' : 'Female'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-[#b4f031]">
                                            {ath.sport_category} {ath.position_specialty && `• ${ath.position_specialty}`}
                                        </p>
                                    </CardHeader>

                                    <CardContent className="p-4 pt-2 space-y-3">
                                        {/* Anthropometry snippet */}
                                        <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-[#b4f031]/10 dark:bg-[#b4f031]/10 border border-[#b4f031]/30 text-center">
                                            <div>
                                                <span className="block text-[10px] text-slate-400">Height</span>
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ath.height_cm ? `${ath.height_cm} cm` : '-'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-slate-400">Weight</span>
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ath.weight_kg ? `${ath.weight_kg} kg` : '-'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] text-slate-400">BMI</span>
                                                <span className="text-xs font-bold text-slate-950 dark:text-[#b4f031]">{ath.bmi ?? '-'}</span>
                                            </div>
                                        </div>

                                        {/* Assessment info */}
                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Activity className="h-3.5 w-3.5 text-[#84cc16] dark:text-[#b4f031]" />
                                                <span>{ath.dpa_assessments_count} DPA Sessions</span>
                                            </div>
                                            {lastAssessment && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                                                    Last: {new Date(lastAssessment.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="pt-2 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800/80">
                                            <Link href={route('athletes.show', ath.id)} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full h-8 text-xs justify-between">
                                                    <span>Profile & DPA Log</span>
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </Button>
                                            </Link>
                                            <Link href={route('dpa.create', { athlete_id: ath.id })}>
                                                <Button size="sm" className="h-8 px-2.5 text-xs font-bold bg-[#b4f031] text-slate-950 hover:bg-[#a2dd26] shadow-sm" title="New DPA Assessment">
                                                    + Test
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
