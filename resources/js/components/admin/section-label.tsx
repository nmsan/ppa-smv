import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

/** Section title in the admin portal: maroon small caps with the public site's gold rule. */
export default function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <h2
            className={cn(
                'text-maroon-700 dark:text-gold-300 inline-flex items-center gap-2.5 text-[13px] font-bold tracking-[0.14em] uppercase',
                "before:bg-gold-500 before:h-0.5 before:w-[18px] before:shrink-0 before:rounded-full before:content-['']",
                className,
            )}
        >
            {children}
        </h2>
    );
}
