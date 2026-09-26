import { PropsWithChildren, ReactNode } from 'react';
import Navbar from '@/Components/Navbar';
import { ShieldCheck } from 'lucide-react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 dark:bg-[#090D16] dark:text-slate-100 transition-colors duration-200">
            {/* Modular Top Navigation Bar */}
            <Navbar />

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

            {/* Institutional Footer */}
            <footer className="w-full border-t border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-[#0D1322]/90 py-4 px-4 sm:px-6 lg:px-8 transition-colors">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#84cc16] dark:text-[#b4f031]" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">DPA Trace</span>
                        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                        <span className="hidden sm:inline">Olympus Training Surabaya X Unesa</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#b4f031]/15 text-slate-900 dark:text-[#b4f031] font-semibold text-[11px] border border-[#b4f031]/30">
                            DPA Trace v2.4.0
                        </span>
                        <span>© {new Date().getFullYear()} Olympus Training Surabaya X Unesa</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
