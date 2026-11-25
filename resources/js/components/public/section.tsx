import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export function Section({ children, className }: { children: ReactNode; className?: string }) {
    return <section className={cn('mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16', className)}>{children}</section>;
}

export function SectionTitle({ children, kicker }: { children: ReactNode; kicker?: string }) {
    return (
        <div className="mb-8">
            {kicker && <p className="text-maroon-700 text-sm font-semibold tracking-wider uppercase">{kicker}</p>}
            <h2 className="text-maroon-950 mt-1 text-2xl font-bold sm:text-3xl">{children}</h2>
            <div className="bg-gold-400 mt-3 h-1 w-16 rounded" />
        </div>
    );
}

export function formatDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const newsTypeLabel = { notice: 'Notice', event: 'Event', news: 'News' } as const;
