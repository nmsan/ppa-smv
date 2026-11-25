import { Button } from '@/components/ui/button';
import { useCountUp } from '@/hooks/use-count-up';
import { useReveal } from '@/hooks/use-reveal';
import { langOf } from '@/lib/lang';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, HeartHandshake, Users } from 'lucide-react';
import { type ReactNode } from 'react';

export interface Giving {
    raised_cents: number;
    supporters: number;
    shown: string[];
}

interface Props {
    stats: { label: string; value: number }[];
    join: { title: string; text: string };
    giving: Giving;
    batches: { from: number; to: number } | null;
}

/** "LKR 2.38M": short form for a stat tile; the full amount is read out to screen readers. */
function shortLkr(cents: number): { value: number; decimals: number; suffix: string } {
    const rupees = cents / 100;
    if (rupees >= 1_000_000) return { value: rupees / 1_000_000, decimals: 2, suffix: 'M' };
    if (rupees >= 1_000) return { value: rupees / 1_000, decimals: 0, suffix: 'K' };
    return { value: rupees, decimals: 0, suffix: '' };
}

/** Overlaps the hero: live member and giving figures, then the join / claim call to action. */
export default function ImpactStrip({ stats, join, giving, batches }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { ref, reveal } = useReveal<HTMLDivElement>(0.3);
    const start = reveal === 'shown';
    const [primary, ...others] = stats;
    const money = shortLkr(giving.raised_cents);

    return (
        <section aria-label="Membership and giving" className="relative z-10 mx-auto -mt-[104px] max-w-7xl px-4 max-sm:-mt-20 sm:px-6">
            <div
                ref={ref}
                className="grid overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-[var(--shadow-lift)] sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.35fr]"
            >
                {primary && (
                    <Tile
                        Icon={Users}
                        label={primary.label}
                        value={<Counter to={primary.value} start={start} suffix="+" />}
                        srValue={`${primary.value}`}
                        badge={
                            batches
                                ? `A/L batches ${batches.from} – ${batches.to}`
                                : others[0]
                                  ? `${others[0].value} ${others[0].label.toLowerCase()}`
                                  : null
                        }
                    />
                )}

                <Tile
                    Icon={HeartHandshake}
                    label="Given to the college through the PPA"
                    value={
                        <>
                            <small className="mr-1 text-xl font-bold tracking-normal text-neutral-500">LKR</small>
                            <Counter to={money.value} decimals={money.decimals} start={start} suffix={money.suffix} />
                        </>
                    }
                    srValue={`LKR ${(giving.raised_cents / 100).toLocaleString('en-LK')}`}
                    badge={`${giving.supporters} sponsors and donors`}
                    badgeTone="green"
                />

                <div className="from-maroon-800 to-maroon-700 relative flex flex-col justify-center gap-3.5 overflow-hidden bg-gradient-to-br p-6 text-white sm:col-span-2 sm:p-[30px] lg:col-span-1">
                    <span aria-hidden className="border-gold-400/12 absolute -top-12 -right-12 size-44 rounded-full border-[28px]" />
                    <h2 {...langOf(join.title)} className="relative text-[19px] leading-snug font-bold">
                        {join.title}
                    </h2>
                    <p {...langOf(join.text)} className="relative line-clamp-3 text-[15.5px] text-white/85">
                        {join.text}
                    </p>
                    <div className="relative flex flex-wrap items-center gap-x-5 gap-y-3">
                        <Button asChild variant="gold" size="brand" className="max-sm:w-full">
                            <Link href={auth.user ? '/my-membership' : '/register'}>
                                {auth.user ? 'My membership' : 'Register / Claim account'}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Tile({
    Icon,
    label,
    value,
    srValue,
    badge,
    badgeTone = 'maroon',
}: {
    Icon: typeof Users;
    label: string;
    value: ReactNode;
    srValue: string;
    badge: string | null;
    badgeTone?: 'maroon' | 'green';
}) {
    return (
        <div className="border-b border-neutral-200 p-6 sm:border-r sm:px-[30px] sm:py-7 lg:border-b-0">
            <p className="flex items-center gap-2.5 text-[14.5px] font-medium text-neutral-500">
                <span className="bg-maroon-50 text-maroon-700 grid size-9 shrink-0 place-items-center rounded-[10px]">
                    <Icon className="size-[19px]" />
                </span>
                <span {...langOf(label)}>{label}</span>
            </p>
            <p className="mt-3.5 text-[32px] leading-none font-extrabold tracking-[-0.03em] text-neutral-900 tabular-nums sm:text-[40px]">
                <span aria-hidden>{value}</span>
                <span className="sr-only">{srValue}</span>
            </p>
            {badge && (
                <p
                    className={
                        badgeTone === 'green'
                            ? 'mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[13px] font-semibold text-emerald-700 before:size-[7px] before:rounded-full before:bg-current before:content-[""]'
                            : 'bg-maroon-50 text-maroon-700 mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold'
                    }
                >
                    {badge}
                </p>
            )}
        </div>
    );
}

function Counter({ to, start, decimals = 0, suffix = '' }: { to: number; start: boolean; decimals?: number; suffix?: string }) {
    const scale = 10 ** decimals;
    const shown = useCountUp(Math.round(to * scale), start) / scale;
    return (
        <>
            {shown.toLocaleString('en-LK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            {suffix}
        </>
    );
}
