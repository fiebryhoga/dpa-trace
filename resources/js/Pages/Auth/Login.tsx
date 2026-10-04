import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Button } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Checkbox';
import { ThemeToggle } from '@/Components/ui/ThemeToggle';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword = true }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white text-zinc-900 dark:bg-[#09090B] dark:text-zinc-100 transition-colors duration-200">
            <Head title="Sign In - Athlete PMA" />

            {/* Left Column: Cinematic Biomechanics Hero Visual (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-950 text-white flex-col justify-between p-10 xl:p-14">
                {/* Full-bleed Cinematic Background Image */}
                <img
                    src="/images/login-hero.jpg"
                    alt="Athlete PMA Biomechanics Postural & Movement Assessment"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-85 scale-105 transition-transform duration-1000 ease-out"
                />

                {/* Rich Gradient Vignette Overlays for Maximum Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/70 pointer-events-none" />
                <div className="absolute inset-0 bg-[#b4f031]/10 mix-blend-multiply pointer-events-none" />

                {/* Top Logo & Title with Backdrop Blur */}
                <div className="relative z-10 flex items-center gap-3 p-2 rounded-lg max-w-fit">
                    <ApplicationLogo className="h-9 w-9 drop-shadow-md" />
                    <div>
                        <span className="text-base font-bold tracking-tight text-white block leading-tight">
                            Athlete <span className="text-[#b4f031]">PMA</span>
                        </span>
                        <span className="text-xs text-zinc-300 leading-none">
                            Postural & Movement Assessment
                        </span>
                    </div>
                </div>

                {/* Bottom Editorial Quote & System Tagline */}
                <div className="relative z-10 space-y-3 max-w-lg mt-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#b4f031]">
                        Sports Biomechanics & Kinetic Analysis
                    </p>

                    <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-snug drop-shadow-sm">
                        Precision kinetic chain evaluation & automated corrective protocols.
                    </h2>

                    <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium pt-1">
                        <ShieldCheck className="h-4 w-4 text-[#b4f031] shrink-0" />
                        <span>Evidence-based diagnostic system for sports performance.</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Clean Authentication Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-white dark:bg-[#09090B] relative">
                {/* Top Bar on Right Side (Theme Toggle + Mobile Logo) */}
                <div className="flex items-center justify-between w-full">
                    <div className="flex lg:hidden items-center gap-2.5">
                        <ApplicationLogo className="h-8 w-8" />
                        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
                            Athlete <span className="text-[#84cc16] dark:text-[#b4f031]">PMA</span>
                        </span>
                    </div>
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-[380px] mx-auto my-auto py-8 space-y-6">
                    <div className="space-y-1.5 text-left">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Welcome back
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            Enter your credentials to access the Athlete PMA portal
                        </p>
                    </div>

                    {status && (
                        <div className="flex items-center gap-2 rounded-lg border border-[#b4f031]/40 bg-[#b4f031]/15 p-3 text-xs font-semibold text-slate-950 dark:text-[#b4f031]">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#84cc16] dark:text-[#b4f031]" />
                            <span>{status}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        {/* Username */}
                        <div className="space-y-1.5">
                            <Label htmlFor="username" required>
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                name="username"
                                value={data.username}
                                placeholder="Enter your username"
                                autoComplete="username"
                                autoFocus
                                error={!!errors.username}
                                leftIcon={<User className="h-4 w-4 text-zinc-400" />}
                                onChange={(e) => setData('username', e.target.value)}
                                className="h-10 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900"
                                required
                            />
                            {errors.username && (
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" required>
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-xs text-slate-700 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-[#b4f031] font-semibold transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                error={!!errors.password}
                                leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="focus:outline-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                }
                                onChange={(e) => setData('password', e.target.value)}
                                className="h-10 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900"
                                required
                            />
                            {errors.password && (
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2 pt-0.5">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked)}
                            />
                            <label
                                htmlFor="remember"
                                className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none"
                            >
                                Remember my session
                            </label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-10 text-xs font-bold gap-2 rounded-lg bg-[#b4f031] text-slate-950 hover:bg-[#a2dd26] shadow-md shadow-[#b4f031]/25 transition-all"
                            isLoading={processing}
                        >
                            <span>{processing ? 'Signing in...' : 'Sign In to Athlete PMA'}</span>
                            {!processing && <ArrowRight className="h-3.5 w-3.5" />}
                        </Button>
                    </form>
                </div>

                {/* Subdued Footer */}
                <div className="text-center text-xs text-zinc-400 dark:text-zinc-600 pt-4">
                    <p>© {new Date().getFullYear()} PKO Unesa x Olympus Training Surabaya</p>
                </div>
            </div>
        </div>
    );
}
