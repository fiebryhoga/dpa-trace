import { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { UserCog, Save } from 'lucide-react';

interface Athlete {
    id: number;
    athlete_code: string;
    full_name: string;
    nickname?: string;
    gender: 'L' | 'P';
    birth_date?: string;
    height_cm?: number;
    weight_kg?: number;
    sport_category: string;
    position_specialty?: string;
    club_institution?: string;
    dominant_side?: 'R' | 'L' | 'Bilateral';
    injury_history?: string;
    phone_number?: string;
    is_active: boolean;
}

export default function AthleteEdit({ athlete }: { athlete: Athlete }) {
    const { data, setData, put, processing, errors } = useForm({
        athlete_code: athlete.athlete_code,
        full_name: athlete.full_name,
        nickname: athlete.nickname || '',
        gender: athlete.gender,
        birth_date: athlete.birth_date ? athlete.birth_date.split('T')[0] : '',
        height_cm: athlete.height_cm || '',
        weight_kg: athlete.weight_kg || '',
        sport_category: athlete.sport_category,
        position_specialty: athlete.position_specialty || '',
        club_institution: athlete.club_institution || '',
        dominant_side: athlete.dominant_side || 'R',
        injury_history: athlete.injury_history || '',
        phone_number: athlete.phone_number || '',
        is_active: athlete.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('athletes.update', athlete.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Atlet - ${athlete.full_name}`} />

            <div className="w-full space-y-6">
                <PageHeader
                    icon={UserCog}
                    backUrl={route('athletes.show', athlete.id)}
                    backLabel="Kembali ke Detail Atlet"
                    title={
                        <>
                            Edit Profil Atlet: <span className="text-[#84cc16] dark:text-[#b4f031]">{athlete.full_name}</span>
                        </>
                    }
                    description="Perbarui metrik antropometri, cabang olahraga, dan riwayat cedera atlet."
                />

                <form onSubmit={submit}>
                    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1526]">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Athlete Information</CardTitle>
                            <CardDescription className="text-xs">
                                Updates will be immediately reflected in future DPA reports
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="athlete_code" required>
                                        Athlete ID / Code
                                    </Label>
                                    <Input
                                        id="athlete_code"
                                        value={data.athlete_code}
                                        onChange={(e) => setData('athlete_code', e.target.value)}
                                        error={!!errors.athlete_code}
                                        required
                                    />
                                    {errors.athlete_code && (
                                        <p className="text-xs text-red-600">{errors.athlete_code}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="full_name" required>
                                        Full Name
                                    </Label>
                                    <Input
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        error={!!errors.full_name}
                                        required
                                    />
                                    {errors.full_name && (
                                        <p className="text-xs text-red-600">{errors.full_name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nickname">Nickname</Label>
                                    <Input
                                        id="nickname"
                                        value={data.nickname}
                                        onChange={(e) => setData('nickname', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="gender" required>
                                        Gender
                                    </Label>
                                    <select
                                        id="gender"
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value as 'L' | 'P')}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4f031] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                    >
                                        <option value="L">Male</option>
                                        <option value="P">Female</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="birth_date">Birth Date</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-1.5">
                                    <Label htmlFor="height_cm">Height (cm)</Label>
                                    <Input
                                        id="height_cm"
                                        type="number"
                                        step="0.1"
                                        value={data.height_cm}
                                        onChange={(e) => setData('height_cm', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                                    <Input
                                        id="weight_kg"
                                        type="number"
                                        step="0.1"
                                        value={data.weight_kg}
                                        onChange={(e) => setData('weight_kg', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="dominant_side" required>
                                        Dominant Side
                                    </Label>
                                    <select
                                        id="dominant_side"
                                        value={data.dominant_side}
                                        onChange={(e) => setData('dominant_side', e.target.value as any)}
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4f031] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                    >
                                        <option value="R">Right (R)</option>
                                        <option value="L">Left (L)</option>
                                        <option value="Bilateral">Bilateral</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-1.5">
                                    <Label htmlFor="sport_category" required>
                                        Sport Discipline
                                    </Label>
                                    <Input
                                        id="sport_category"
                                        value={data.sport_category}
                                        onChange={(e) => setData('sport_category', e.target.value)}
                                        error={!!errors.sport_category}
                                        required
                                    />
                                    {errors.sport_category && (
                                        <p className="text-xs text-red-600">{errors.sport_category}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="position_specialty">
                                        Position / Event
                                    </Label>
                                    <Input
                                        id="position_specialty"
                                        value={data.position_specialty}
                                        onChange={(e) => setData('position_specialty', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="club_institution">
                                    Club / Organization
                                </Label>
                                <Input
                                    id="club_institution"
                                    value={data.club_institution}
                                    onChange={(e) => setData('club_institution', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="injury_history">
                                    Injury History / Medical Notes
                                </Label>
                                <textarea
                                    id="injury_history"
                                    rows={3}
                                    value={data.injury_history}
                                    onChange={(e) => setData('injury_history', e.target.value)}
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4f031] dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-600 dark:focus-visible:ring-[#b4f031]"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-2">
                                <Link href={route('athletes.show', athlete.id)}>
                                    <Button type="button" variant="outline" size="sm">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" size="sm" className="gap-1.5" isLoading={processing}>
                                    <Save className="h-4 w-4" />
                                    <span>Save Changes</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
