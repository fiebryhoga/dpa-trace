import React, { ReactNode, ComponentType } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { LucideProps } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface PageHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    icon?: ComponentType<LucideProps> | ReactNode;
    badge?: ReactNode;
    backUrl?: string;
    backLabel?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
    children?: ReactNode;
    className?: string;
}

export default function PageHeader({
    title,
    description,
    icon: IconComponent,
    badge,
    backUrl,
    backLabel = 'Kembali',
    breadcrumbs,
    actions,
    children,
    className = '',
}: PageHeaderProps) {
    // Determine whether icon is a component or pre-rendered ReactNode
    const renderIcon = () => {
        if (!IconComponent) return null;
        if (React.isValidElement(IconComponent)) {
            return IconComponent;
        }
        // When passed as a component identifier (e.g. icon={Layers} or LucideIcon forwardRef)
        const Icon = IconComponent as ComponentType<LucideProps>;
        return <Icon size={18} className="text-[#84cc16] dark:text-[#b4f031] shrink-0" />;
    };

    return (
        <div className={`space-y-2 pb-3 border-b border-slate-200/90 dark:border-slate-800/90 ${className}`}>
            {/* Optional Breadcrumbs or Back Link */}
            {(breadcrumbs || backUrl) && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {backUrl && (
                        <Link
                            href={backUrl}
                            className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors mr-2"
                        >
                            <ArrowLeft size={13} />
                            <span>{backLabel}</span>
                        </Link>
                    )}

                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
                            {breadcrumbs.map((crumb, idx) => {
                                const isLast = idx === breadcrumbs.length - 1;
                                return (
                                    <div key={idx} className="flex items-center gap-1.5">
                                        {idx > 0 && <ChevronRight size={11} className="text-slate-400 opacity-60" />}
                                        {crumb.href && !isLast ? (
                                            <Link
                                                href={crumb.href}
                                                className="hover:text-slate-900 dark:hover:text-white transition-colors"
                                            >
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span className={isLast ? 'font-semibold text-slate-900 dark:text-white' : ''}>
                                                {crumb.label}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    )}
                </div>
            )}

            {/* Main Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        {renderIcon()}
                        <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                            {title}
                        </h1>
                        {badge && (
                            <div className="shrink-0">
                                {typeof badge === 'string' ? (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        {badge}
                                    </span>
                                ) : (
                                    badge
                                )}
                            </div>
                        )}
                    </div>

                    {description && (
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Action Buttons Slot */}
                {actions && (
                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:justify-end">
                        {actions}
                    </div>
                )}
            </div>

            {/* Optional Children Slot (Filter bar, summary tabs, metrics preview) */}
            {children && <div className="pt-2">{children}</div>}
        </div>
    );
}
