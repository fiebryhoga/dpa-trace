import { PropsWithChildren, ReactNode, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ThemeToggle } from '@/Components/ui/ThemeToggle';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    Activity,
    Users,
    ClipboardCheck,
    PlusCircle,
    ShieldCheck,
    LogOut,
    User,
    Menu,
    X,
} from 'lucide-react';
import { Button } from '@/Components/ui/Button';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 transition-colors duration-200">
            {/* Top Navigation Bar */}
            <nav className="border-b border-slate-200/80 bg-white/85 dark:border-slate-800/80 dark:bg-[#0D1322]/85 backdrop-blur-md sticky top-0 z-40">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Brand & Left Links */}
                        <div className="flex items-center gap-8">
                            <Link href={route('dashboard')} className="flex items-center gap-3 group">
                                <ApplicationLogo className="h-9 w-9 transition-transform group-hover:scale-105" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                        DPA <span className="text-[#84cc16] dark:text-[#b4f031]">Trace</span>
                                    </span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                                        Dynamic Posture Assessment
                                    </span>
                                </div>
                            </Link>

                            <div className="hidden md:flex items-center gap-1.5">
                                <Link
                                    href={route('dashboard')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        route().current('dashboard')
                                            ? 'bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] border border-[#b4f031]/40 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-[#b4f031]/10 dark:text-slate-400 dark:hover:text-[#b4f031] dark:hover:bg-[#b4f031]/10'
                                    }`}
                                >
                                    Dashboard
                                </Link>

                                <Link
                                    href={route('athletes.index')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        route().current('athletes.*')
                                            ? 'bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] border border-[#b4f031]/40 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-[#b4f031]/10 dark:text-slate-400 dark:hover:text-[#b4f031] dark:hover:bg-[#b4f031]/10'
                                    }`}
                                >
                                    Athletes
                                </Link>

                                <Link
                                    href={route('dpa.index')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        route().current('dpa.*')
                                            ? 'bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] border border-[#b4f031]/40 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-[#b4f031]/10 dark:text-slate-400 dark:hover:text-[#b4f031] dark:hover:bg-[#b4f031]/10'
                                    }`}
                                >
                                    Analisis DPA
                                </Link>

                                <Link
                                    href={route('dpa-compensations.index')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        route().current('dpa-compensations.*')
                                            ? 'bg-[#b4f031]/20 text-slate-950 dark:text-[#b4f031] border border-[#b4f031]/40 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-[#b4f031]/10 dark:text-slate-400 dark:hover:text-[#b4f031] dark:hover:bg-[#b4f031]/10'
                                    }`}
                                >
                                    Master Kompensasi
                                </Link>
                            </div>
                        </div>

                        {/* Right Tools & Profile */}
                        <div className="hidden md:flex items-center gap-3">
                            <Link href={route('dpa.index')}>
                                <Button size="sm" className="gap-1.5 text-xs font-bold bg-[#b4f031] text-slate-950 hover:bg-[#a2dd26] shadow-brand">
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span>Analisis DPA</span>
                                </Button>
                            </Link>

                            <ThemeToggle />

                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                            <div className="flex items-center gap-2 text-xs">
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#b4f031]/15 text-slate-700 dark:text-slate-300 transition-colors"
                                    title="Edit Profile"
                                >
                                    <div className="h-7 w-7 rounded-full bg-[#b4f031] text-slate-950 flex items-center justify-center font-black text-xs shadow-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold max-w-[120px] truncate">{user.name}</span>
                                </Link>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Menu Trigger */}
                        <div className="flex md:hidden items-center gap-2">
                            <ThemeToggle />
                            <button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                {showingNavigationDropdown ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {showingNavigationDropdown && (
                    <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1322] p-4 space-y-3">
                        <div className="flex flex-col space-y-1">
                            <Link
                                href={route('dashboard')}
                                className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href={route('athletes.index')}
                                className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                                Athletes
                            </Link>
                            <Link
                                href={route('dpa.index')}
                                className="px-3 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                                Analisis DPA
                            </Link>
                            <Link
                                href={route('dpa-compensations.index')}
                                className="px-3 py-2 rounded-lg text-sm font-semibold text-[#84cc16] dark:text-[#b4f031] hover:bg-[#b4f031]/10 flex items-center gap-1.5"
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>Master Kompensasi</span>
                            </Link>
                        </div>

                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-semibold"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                <span>Sign Out</span>
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Optional Header Banner */}
            {header && (
                <header className="border-b border-slate-200/80 bg-white/50 dark:border-slate-800/80 dark:bg-slate-900/50">
                    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content Area */}
            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* System Footer */}
            <footer className="w-full border-t border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-[#0D1322]/90 py-4 px-4 sm:px-6 lg:px-8 transition-colors">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">DPA Trace</span>
                        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                        <span className="hidden sm:inline">Dynamic Posture Assessment & Kinetic Analysis</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-2 py-0.5 rounded bg-[#b4f031]/15 text-slate-900 dark:text-[#b4f031] font-bold text-[11px] border border-[#b4f031]/30">
                            DPA Trace v2.4.0
                        </span>
                        <span>© {new Date().getFullYear()} All Rights Reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
