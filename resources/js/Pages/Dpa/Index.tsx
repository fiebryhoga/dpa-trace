import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Badge } from '@/Components/ui/Badge';
import {
    Activity,
    PlusCircle,
    Search,
    ChevronRight,
    Calendar,
} from 'lucide-react';

interface Detail {
    id: number;
    severity: string;
    side: string;
    compensation: {
        name: string;
        category: string;
    };
}

interface AssessmentItem {
    id: number;
    assessment_date: string;
    notes?: string;
    details_count: number;
    athlete: {
        id: number;
        athlete_code: string;
        full_name: string;
        sport_category: string;
        gender: string;
    };
    assessor?: {
        name: string;
    };
    details: Detail[];
}

interface IndexProps {
    assessments: {
        data: AssessmentItem[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total: number;
    };
    filters: {
        search: string;
    };
    totalCount: number;
}

export default function DpaIndex({ assessments, filters, totalCount }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('dpa.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Assessment History - DPA Trace" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Dynamic Posture Assessment History
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Complete log of kinetic chain observations and muscle compensation diagnoses
                        </p>
                    </div>

                    <Link href={route('dpa.create')}>
                        <Button size="sm" className="gap-1.5 text-xs shadow-brand">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span>Start New Assessment</span>
                        </Button>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="flex items-center justify-between gap-3">
                    <form onSubmit={handleSearch} className="w-full sm:w-80 flex gap-2">
                        <Input
                            type="text"
                            placeholder="Search athlete, code, or sport..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />}
                            className="h-9 text-xs"
                        />
                        <Button type="submit" size="sm" variant="secondary" className="h-9 px-3">
                            Search
                        </Button>
                    </form>

                    <div className="text-xs text-slate-500 font-medium">
                        Total <strong className="text-slate-900 dark:text-[#b4f031]">{totalCount}</strong> assessment sessions
                    </div>
                </div>

                {/* Assessments List */}
                {assessments.data.length === 0 ? (
                    <Card className="border-slate-200 dark:border-slate-800 text-center py-12">
                        <CardContent className="space-y-3">
                            <Activity className="h-10 w-10 text-[#84cc16] dark:text-[#b4f031] mx-auto" />
                            <h3 className="text-sm font-semibold">No Assessment Sessions Found</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                No DPA assessment records match your criteria. Start an initial assessment session.
                            </p>
                            <Link href={route('dpa.create')}>
                                <Button size="sm" className="mt-2 text-xs shadow-brand">
                                    Start Assessment Now
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {assessments.data.map((item) => {
                            const total = item.details_count;
                            let riskBadge = (
                                <Badge variant="brand">Low Risk ({total} Deviations)</Badge>
                            );
                            if (total >= 5) {
                                riskBadge = (
                                    <Badge variant="destructive">High Risk ({total} Deviations)</Badge>
                                );
                            } else if (total >= 3) {
                                riskBadge = (
                                    <Badge variant="warning">Moderate Risk ({total} Deviations)</Badge>
                                );
                            }

                            return (
                                <Card
                                    key={item.id}
                                    className="border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] hover:border-[#b4f031]/80 transition-all shadow-sm hover:shadow-brand"
                                >
                                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('athletes.show', item.athlete.id)}
                                                    className="text-base font-bold text-slate-900 dark:text-white hover:text-[#84cc16] dark:hover:text-[#b4f031] transition-colors"
                                                >
                                                    {item.athlete.full_name}
                                                </Link>
                                                <Badge variant="brand" className="text-[10px]">
                                                    {item.athlete.athlete_code}
                                                </Badge>
                                                <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-[#b4f031]">
                                                    {item.athlete.sport_category}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1 font-medium">
                                                    <Calendar className="h-3.5 w-3.5 text-[#84cc16] dark:text-[#b4f031]" />
                                                    <span>
                                                        {new Date(item.assessment_date).toLocaleDateString('en-US', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                {item.assessor && (
                                                    <span>Assessor: {item.assessor.name}</span>
                                                )}
                                            </div>

                                            {/* Deviation Pills */}
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {item.details.map((d) => (
                                                    <span
                                                        key={d.id}
                                                        className="inline-flex items-center rounded-md bg-[#b4f031]/10 dark:bg-[#b4f031]/10 border border-[#b4f031]/30 px-2 py-0.5 text-[11px] font-semibold text-slate-900 dark:text-[#b4f031]"
                                                    >
                                                        {d.compensation.name} ({d.side})
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                                            <div>{riskBadge}</div>
                                            <Link href={route('dpa.show', item.id)}>
                                                <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                                                    <span>Full Report</span>
                                                    <ChevronRight className="h-3.5 w-3.5" />
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
