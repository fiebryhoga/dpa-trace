import { useState, useEffect } from 'react';

export function useTheme() {
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return document.documentElement.classList.contains('dark');
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Sync initial state
        setIsDark(document.documentElement.classList.contains('dark'));

        // Observer for class changes on <html> element
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return { isDark };
}
