import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
        return (
            <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                    type="checkbox"
                    className="sr-only peer"
                    ref={ref}
                    checked={checked}
                    onChange={(e) => {
                        onChange?.(e);
                        onCheckedChange?.(e.target.checked);
                    }}
                    {...props}
                />
                <div
                    className={cn(
                        'h-4 w-4 rounded-md border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500 peer-checked:text-white dark:peer-checked:text-black peer-checked:border-emerald-600 dark:peer-checked:border-emerald-500',
                        className,
                    )}
                >
                    {checked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
            </label>
        );
    },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
