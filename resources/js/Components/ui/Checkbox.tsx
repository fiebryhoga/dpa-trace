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
                        'h-4 w-4 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-[#b4f031] peer-checked:bg-[#b4f031] peer-checked:text-slate-950 peer-checked:border-[#b4f031]',
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
