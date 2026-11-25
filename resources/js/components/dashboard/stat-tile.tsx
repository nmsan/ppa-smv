import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { type ReactNode } from 'react';

interface Props {
    label: string;
    value: ReactNode;
    detail?: ReactNode;
    trend?: { current: number; previous: number; label: string };
    tone?: 'default' | 'attention';
}

export default function StatTile({ label, value, detail, trend, tone = 'default' }: Props) {
    const change = trend ? trend.current - trend.previous : 0;

    return (
        <div className={cn('rounded-xl border p-5', tone === 'attention' && 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/30')}>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="mt-1 text-3xl font-semibold whitespace-nowrap tabular-nums">{value}</p>
            {trend && (
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    {change > 0 && <ArrowUpRight className="size-3.5" aria-hidden />}
                    {change < 0 && <ArrowDownRight className="size-3.5" aria-hidden />}
                    {change === 0 ? `Same as ${trend.label}` : `${change > 0 ? '+' : ''}${change} vs ${trend.label} (${trend.previous})`}
                </p>
            )}
            {detail && <p className="text-muted-foreground mt-1 text-xs">{detail}</p>}
        </div>
    );
}
