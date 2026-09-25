import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';

export function ThemeToggle({ className }: { className?: string }) {
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark((prev) => !prev);
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className={className}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-colors" />
            ) : (
                <Moon className="h-4 w-4 text-slate-700 hover:text-slate-900 transition-colors" />
            )}
        </Button>
    );
}
