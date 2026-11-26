import { langOf } from '@/lib/lang';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export function Section({ children, className }: { children: ReactNode; className?: string }) {
    return <section className={cn('mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16', className)}>{children}</section>;
}

/** Small uppercase label with a gold rule, used above section headings. */
/** Pass `as="h2"` when the kicker is the only title a section has, so it shows up in the heading outline. */
export function Kicker({ children, className, as: Tag = 'p' }: { children: string; className?: string; as?: 'p' | 'h2' }) {
    return (
        <Tag
            {...langOf(children)}
            className={cn(
                'text-maroon-700 inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.14em] uppercase',
                "before:bg-gold-500 before:h-0.5 before:w-[22px] before:rounded-full before:content-['']",
                className,
            )}
        >
            {children}
        </Tag>
    );
}

interface SectionTitleProps {
    children: ReactNode;
    kicker?: string;
    description?: ReactNode;
    /** A link shown at the right on wide screens, e.g. "All news →". */
    action?: ReactNode;
}

export function SectionTitle({ children, kicker, description, action }: SectionTitleProps) {
    return (
        <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="max-w-2xl">
                {kicker && <Kicker>{kicker}</Kicker>}
                <h2 className="mt-2.5 text-[28px] leading-tight font-bold tracking-tight text-neutral-900 sm:text-4xl">{children}</h2>
                {description && <p className="mt-3 text-[17px] text-neutral-600">{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function formatDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const newsTypeLabel = { notice: 'Notice', event: 'Event', news: 'News' } as const;
