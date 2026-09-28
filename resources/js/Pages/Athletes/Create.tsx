import { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { UserPlus, Save } from 'lucide-react';

export default function AthleteCreate() {
    const { data, setData, post, processing, errors } = useForm({
        athlete_code: `DPA-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        full_name: '',
        nickname: '',
        gender: 'L' as 'L' | 'P',
        birth_date: '',
        height_cm: '' as any,
        weight_kg: '' as any,
        sport_category: 'Volleyball',
        position_specialty: '',
        club_institution: '',
        dominant_side: 'R' as 'R' | 'L' | 'Bilateral',
        injury_history: '',
        phone_number: '',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('athletes.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tambah Atlet Baru - Athlete DPA" />

            <div className="w-full space-y-6">
                <PageHeader
                    icon={UserPlus}
                    backUrl={route('athletes.index')}
                    backLabel="Kembali ke Daftar Atlet"
                    title={
                        <>
                            Tambah <span className="text-[#84cc16] dark:text-[#b4f031]">Atlet Baru</span>
                        </>
                    }
                    description="Daftarkan profil atlet, data antropometri, dan cabang olahraga untuk penilaian DPA."
                />

                <form onSubmit={submit}>
                    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1526]">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Profile & Biomechanical Biodata</CardTitle>
                            <CardDescription className="text-xs">
                                All athlete records connect seamlessly to the DPA kinetic assessment module
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
                                        placeholder="e.g. Dimas Arya Pratama"
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
                                        placeholder="e.g. Dimas"
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
                                        placeholder="e.g. 184"
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
                                        placeholder="e.g. 76.5"
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
                                        placeholder="e.g. Volleyball / Track & Field / Futsal"
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
                                        placeholder="e.g. Outside Hitter / 100m Sprinter"
                                        value={data.position_specialty}
                                        onChange={(e) => setData('position_specialty', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="club_institution">
                                    Club / Organization (Optional)
                                </Label>
                                <Input
                                    id="club_institution"
                                    placeholder="e.g. National Athletics Academy"
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
                                    placeholder="Note past ACL tears, ankle sprains, shoulder impingement, or recurring lumbar tightness..."
                                    value={data.injury_history}
                                    onChange={(e) => setData('injury_history', e.target.value)}
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b4f031] dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-600 dark:focus-visible:ring-[#b4f031]"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-2">
                                <Link href={route('athletes.index')}>
                                    <Button type="button" variant="outline" size="sm">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" size="sm" className="gap-1.5" isLoading={processing}>
                                    <Save className="h-4 w-4" />
                                    <span>Save Athlete</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
