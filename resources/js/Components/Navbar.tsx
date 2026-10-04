import { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ThemeToggle } from '@/Components/ui/ThemeToggle';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    Activity,
    Users,
    ShieldCheck,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Dumbbell,
    Layers,
    ShieldAlert,
} from 'lucide-react';

export default function Navbar() {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const configDropdownRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setIsConfigOpen(true);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        hoverTimeoutRef.current = setTimeout(() => {
            setIsConfigOpen(false);
        }, 150);
    };

    // Close configuration dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (configDropdownRef.current && !configDropdownRef.current.contains(event.target as Node)) {
                setIsConfigOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const isConfigActive =
        route().current('athletes.*') ||
        route().current('dpa-compensations.*') ||
        route().current('exercises.*') ||
        route().current('muscles.*') ||
        route().current('injuries.*') ||
        route().current('users.*');

    return (
        <nav className="border-b border-slate-200/80 bg-white/85 dark:border-slate-800/80 dark:bg-[#0D1322]/85 backdrop-blur-md sticky top-0 z-40">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    {/* Brand & Left Links */}
                    <div className="flex items-center gap-8">
                        <Link href={route('dashboard')} className="flex items-center gap-3 group">
                            <ApplicationLogo className="h-9 w-9 transition-transform group-hover:scale-105" />
                            <div className="flex flex-col">
                                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                    Athlete <span className="text-[#84cc16] dark:text-[#b4f031]">PMA</span>
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                                    Postural & Movement Assessment
                                </span>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            <Link
                                href={route('dashboard')}
                                className={`px-3 py-1.5 text-xs font-bold transition-colors rounded-md ${
                                    route().current('dashboard')
                                        ? 'text-[#84cc16] dark:text-[#b4f031]'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                Dashboard
                            </Link>

                            <Link
                                href={route('dpa.index')}
                                className={`px-3 py-1.5 text-xs font-bold transition-colors rounded-md ${
                                    route().current('dpa.*')
                                        ? 'text-[#84cc16] dark:text-[#b4f031]'
                                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                }`}
                            >
                                Analisis PMA
                            </Link>

                            {/* Dropdown Konfigurasi (Kelola Atlet, Master Kompensasi, Master Latihan, Master Otot, Master Cedera, Kelola Admin) */}
                            <div
                                ref={configDropdownRef}
                                className="relative"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button
                                    type="button"
                                    onClick={() => setIsConfigOpen((prev) => !prev)}
                                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer rounded-md ${
                                        isConfigActive
                                            ? 'text-[#84cc16] dark:text-[#b4f031]'
                                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                                    }`}
                                >
                                    <span>Konfigurasi</span>
                                    <ChevronDown
                                        size={13}
                                        className={`transition-transform duration-150 ${isConfigOpen ? 'rotate-180' : ''} ${isConfigActive || isConfigOpen ? 'text-[#84cc16] dark:text-[#b4f031]' : 'opacity-70'}`}
                                    />
                                </button>

                                {isConfigOpen && (
                                    <div className="absolute left-0 top-full pt-1.5 w-56 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
                                        <div className="rounded-md bg-white dark:bg-[#0E1526] border border-slate-200/90 dark:border-slate-800/90 shadow-xl p-1.5 backdrop-blur-md">
                                            <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                                Master data & konfigurasi
                                            </div>

                                            <Link
                                                href={route('dpa-compensations.index')}
                                                onClick={() => setIsConfigOpen(false)}
                                                className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-md transition-all ${
                                                    route().current('dpa-compensations.*')
                                                        ? 'bg-slate-100 dark:bg-slate-800/70 text-[#84cc16] dark:text-[#b4f031] font-semibold'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                                                }`}
                                            >
                                                <div className={`p-1 rounded-md ${route().current('dpa-compensations.*') ? 'bg-[#b4f031]/20 text-[#84cc16] dark:text-[#b4f031]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                    <Activity size={13} />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span>Master Kompensasi</span>
                                                </div>
                                            </Link>

                                            <Link
                                                href={route('exercises.index')}
                                                onClick={() => setIsConfigOpen(false)}
                                                className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-md transition-all ${
                                                    route().current('exercises.*')
                                                        ? 'bg-slate-100 dark:bg-slate-800/70 text-[#84cc16] dark:text-[#b4f031] font-semibold'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                                                }`}
                                            >
                                                <div className={`p-1 rounded-md ${route().current('exercises.*') ? 'bg-[#b4f031]/20 text-[#84cc16] dark:text-[#b4f031]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                    <Dumbbell size={13} />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span>Master Latihan</span>
                                                </div>
                                            </Link>

                                            <Link
                                                href={route('muscles.index')}
                                                onClick={() => setIsConfigOpen(false)}
                                                className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-md transition-all ${
                                                    route().current('muscles.*')
                                                        ? 'bg-slate-100 dark:bg-slate-800/70 text-[#84cc16] dark:text-[#b4f031] font-semibold'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                                                }`}
                                            >
                                                <div className={`p-1 rounded-md ${route().current('muscles.*') ? 'bg-[#b4f031]/20 text-[#84cc16] dark:text-[#b4f031]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                    <Layers size={13} />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span>Master Anatomi Otot</span>
                                                </div>
                                            </Link>

                                            <Link
                                                href={route('injuries.index')}
                                                onClick={() => setIsConfigOpen(false)}
                                                className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-md transition-all ${
                                                    route().current('injuries.*')
                                                        ? 'bg-slate-100 dark:bg-slate-800/70 text-[#84cc16] dark:text-[#b4f031] font-semibold'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                                                }`}
                                            >
                                                <div className={`p-1 rounded-md ${route().current('injuries.*') ? 'bg-[#b4f031]/20 text-[#84cc16] dark:text-[#b4f031]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                    <ShieldAlert size={13} />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span>Master Potensi Cedera</span>
                                                </div>
                                            </Link>

                                            <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

                                            <Link
                                                href={route('athletes.index')}
                                                onClick={() => setIsConfigOpen(false)}
                                                className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-md transition-all ${
                                                    route().current('athletes.*')
                                                        ? 'bg-slate-100 dark:bg-slate-800/70 text-[#84cc16] dark:text-[#b4f031] font-semibold'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                                                }`}
                                            >
                                                <div className={`p-1 rounded-md ${route().current('athletes.*') ? 'bg-[#b4f031]/20 text-[#84cc16] dark:text-[#b4f031]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                    <Users size={13} />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span>Kelola Atlet</span>
                                                </div>
                                            </Link>

                                            <Link
                                                href={route('users.index')}
                                                onClick={() => setIsConfigOpen(false)}
                                                className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-md transition-all ${
                                                    route().current('users.*')
                                                        ? 'bg-slate-100 dark:bg-slate-800/70 text-[#84cc16] dark:text-[#b4f031] font-semibold'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                                                }`}
                                            >
                                                <div className={`p-1 rounded-md ${route().current('users.*') ? 'bg-[#b4f031]/20 text-[#84cc16] dark:text-[#b4f031]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                    <ShieldCheck size={13} />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span>Kelola Admin</span>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Tools & Profile */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                        <div className="flex items-center gap-2 text-xs">
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#b4f031]/15 text-slate-700 dark:text-slate-300 transition-colors"
                                title="Edit Profile"
                            >
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="h-7 w-7 rounded-full object-cover aspect-square shadow-2xs border border-[#b4f031]/40"
                                    />
                                ) : (
                                    <div className="h-7 w-7 rounded-full bg-[#b4f031] text-slate-950 flex items-center justify-center font-black text-xs shadow-2xs aspect-square">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="font-semibold max-w-[120px] truncate">{user.name}</span>
                            </Link>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
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
                            className="p-2 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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
                            className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={route('dpa.index')}
                            className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            Analisis PMA
                        </Link>

                        <div className="pt-2 pb-1 px-3 text-[10px] font-semibold text-slate-400">
                            Konfigurasi & Master Data
                        </div>
                        <Link
                            href={route('dpa-compensations.index')}
                            className="px-3 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#b4f031]/10 flex items-center gap-2"
                        >
                            <Activity className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                            <span>Master Kompensasi</span>
                        </Link>
                        <Link
                            href={route('exercises.index')}
                            className="px-3 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#b4f031]/10 flex items-center gap-2"
                        >
                            <Dumbbell className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                            <span>Master Latihan</span>
                        </Link>
                        <Link
                            href={route('muscles.index')}
                            className="px-3 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#b4f031]/10 flex items-center gap-2"
                        >
                            <Layers className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                            <span>Master Anatomi Otot</span>
                        </Link>
                        <Link
                            href={route('injuries.index')}
                            className="px-3 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#b4f031]/10 flex items-center gap-2"
                        >
                            <ShieldAlert className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                            <span>Master Potensi Cedera</span>
                        </Link>
                        <Link
                            href={route('athletes.index')}
                            className="px-3 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#b4f031]/10 flex items-center gap-2"
                        >
                            <Users className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                            <span>Kelola Atlet</span>
                        </Link>
                        <Link
                            href={route('users.index')}
                            className="px-3 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-[#b4f031]/10 flex items-center gap-2"
                        >
                            <ShieldCheck className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                            <span>Kelola Admin</span>
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
                            <span>Log Out</span>
                        </Link>
                        <span className="text-xs text-slate-400">{user.email}</span>
                    </div>
                </div>
            )}
        </nav>
    );
}
