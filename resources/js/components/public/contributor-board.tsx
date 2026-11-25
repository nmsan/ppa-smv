import PageHeader from '@/components/public/page-header';
import { formatDate, Section } from '@/components/public/section';
import { Button } from '@/components/ui/button';
import { useCountUp } from '@/hooks/use-count-up';
import { useReveal } from '@/hooks/use-reveal';
import { lkr } from '@/lib/money';
import { cn } from '@/lib/utils';
import { type BankDetails } from '@/types/public';
import { Link } from '@inertiajs/react';
import { Award, Building2, CalendarHeart, Check, Copy, HandHeart, Landmark, Users } from 'lucide-react';
import { type CSSProperties, type ReactNode, useMemo, useState } from 'react';

/** One supporter's total of one kind (sponsorships or donations), from their account. */
export interface BoardRow {
    name: string;
    note: string | null;
    total_cents: number;
    events: { name: string; cents: number }[];
    first_received: string | null;
}

interface Ranked extends BoardRow {
    rank: number;
}

export interface BoardLabels {
    /** "Main sponsors" / "Donors" */
    people: string;
    /** "Contributed" / "Donated" */
    given: string;
    /** "Event supported" / "Cause supported" */
    cause: string;
    /** "Our leading sponsors" */
    podiumTitle: string;
    /** "Become a sponsor" */
    ctaTitle: string;
    ctaText: string;
    empty: string;
}

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

/** Equal amounts share a place: 1, 2, 2, 4 … */
function ranked<T>(rows: T[], value: (r: T) => number): (T & { rank: number })[] {
    const sorted = [...rows].sort((a, b) => value(b) - value(a));
    return sorted.map((r) => ({ ...r, rank: 1 + sorted.filter((o) => value(o) > value(r)).length }));
}

function monogram(name: string) {
    const words = name
        .replace(/\(.*?\)|[-,.]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !/^(pvt|ltd|the|and|mr|mrs|dr)$/i.test(w));
    return ((words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
}

const medals = [
    { label: 'Top', ring: 'ring-gold-400', bg: 'from-gold-300 to-gold-500', step: 'h-28 bg-gold-400/90', text: 'text-maroon-950' },
    { label: 'Second', ring: 'ring-neutral-300', bg: 'from-neutral-100 to-neutral-300', step: 'h-20 bg-neutral-300', text: 'text-neutral-800' },
    { label: 'Third', ring: 'ring-amber-700/40', bg: 'from-amber-200 to-amber-600', step: 'h-14 bg-amber-600/70', text: 'text-amber-950' },
];

function Monogram({ name, className }: { name: string; className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                'from-maroon-700 to-maroon-950 text-gold-300 flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-bold',
                className,
            )}
        >
            {monogram(name) || <Building2 className="size-5" />}
        </span>
    );
}

function Stat({ icon: Icon, label, value, ms }: { icon: typeof Award; label: string; value: string; ms: number }) {
    return (
        <div className="reveal-item flex items-center gap-4 rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur" style={delay(ms)}>
            <span className="bg-gold-400 text-maroon-950 flex size-12 items-center justify-center rounded-xl">
                <Icon className="size-6" aria-hidden />
            </span>
            <div>
                <p className="text-2xl font-bold whitespace-nowrap text-white tabular-nums sm:text-3xl">{value}</p>
                <p className="text-sm text-white/75">{label}</p>
            </div>
        </div>
    );
}

function Podium({ top }: { top: Ranked[] }) {
    const { ref, reveal } = useReveal<HTMLDivElement>(0.2);

    return (
        <div ref={ref} data-reveal={reveal} className="grid items-end gap-4 sm:grid-cols-3">
            {top.map((s, i) => {
                const m = medals[Math.min(s.rank, 3) - 1];
                const tied = top.filter((o) => o.rank === s.rank).length > 1;
                const label = tied ? `Joint ${['first', 'second', 'third'][Math.min(s.rank, 3) - 1]}` : m.label;
                return (
                    <article
                        key={s.name}
                        // Read in rank order; on wider screens shown as a podium: second, first, third.
                        className={cn('reveal-item flex flex-col', i === 0 ? 'sm:order-2' : i === 1 ? 'sm:order-1' : 'sm:order-3')}
                        style={delay(i === 0 ? 0 : 200 + i * 120)}
                    >
                        <div
                            className={cn(
                                'org-card relative rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5',
                                i === 0 && 'ring-gold-400 shadow-lg ring-2',
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-br px-3 py-1 text-xs font-bold shadow',
                                    m.bg,
                                    m.text,
                                )}
                            >
                                <Award className="size-3.5" aria-hidden /> {label}
                            </span>
                            <Monogram name={s.name} className={cn('mx-auto mt-2 ring-4', m.ring, i === 0 ? 'size-20 text-2xl' : 'size-16 text-xl')} />
                            <h3 className={cn('text-maroon-950 mt-4 font-bold', i === 0 ? 'text-xl' : 'text-lg')}>{s.name}</h3>
                            {s.note && <p className="text-sm text-neutral-600">{s.note}</p>}
                            <p className="text-maroon-800 mt-1 text-lg font-semibold tabular-nums">{lkr(s.total_cents)}</p>
                            {s.events.length > 1 && <p className="text-xs text-neutral-500">in total, across {s.events.length}</p>}
                            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                                {s.events.map((e) => (
                                    <span key={e.name} className="bg-maroon-50 text-maroon-800 rounded-full px-2.5 py-0.5 text-xs">
                                        {e.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className={cn('mx-6 hidden rounded-b-xl sm:flex sm:items-center sm:justify-center', m.step)}>
                            <span className={cn('text-3xl font-black opacity-60', m.text)}>{s.rank}</span>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

function List({ rows, events, labels }: { rows: Ranked[]; events: string[]; labels: BoardLabels }) {
    const { ref, reveal } = useReveal<HTMLDivElement>(0.1);
    const [event, setEvent] = useState<string | null>(null);

    // With an event chosen, each supporter is shown with what they gave to it.
    const amountFor = (s: BoardRow) => (event ? (s.events.find((e) => e.name === event)?.cents ?? 0) : s.total_cents);
    const shown = event
        ? ranked(
              rows.filter((s) => amountFor(s) > 0),
              amountFor,
          )
        : rows;
    const max = Math.max(1, ...shown.map(amountFor));
    const chip = (active: boolean) =>
        cn(
            'rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors',
            active ? 'bg-maroon-800 ring-maroon-800 text-white' : 'hover:bg-maroon-50 bg-white ring-black/10',
        );

    return (
        <div ref={ref} data-reveal={reveal}>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-maroon-950 text-2xl font-bold">Every contribution counts</h2>
                    <p className="mt-1 text-neutral-600">
                        {event ? `For ${event}, largest first.` : 'Each total adds up everything given, largest first.'}
                    </p>
                </div>
                {events.length > 1 && (
                    <div role="group" aria-label="Filter" className="flex flex-wrap gap-2">
                        <button type="button" className={chip(event === null)} aria-pressed={event === null} onClick={() => setEvent(null)}>
                            All
                        </button>
                        {events.map((e) => (
                            <button
                                key={e}
                                type="button"
                                className={chip(event === e)}
                                aria-pressed={event === e}
                                onClick={() => setEvent(event === e ? null : e)}
                            >
                                {e}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <ol className="mt-8 space-y-3">
                {shown.map((s, i) => (
                    <li
                        key={s.name}
                        className="reveal-item org-card grid grid-cols-[2rem_auto_1fr] items-center gap-x-4 gap-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:grid-cols-[2rem_auto_1fr_auto]"
                        style={delay(Math.min(i, 10) * 60)}
                    >
                        <span className="text-center text-sm font-semibold text-neutral-400 tabular-nums">{s.rank}</span>
                        <Monogram name={s.name} className="size-11 text-sm" />
                        <div className="min-w-0">
                            <p className="font-semibold text-neutral-900">
                                {s.name}
                                {s.note && <span className="ml-2 text-sm font-normal text-neutral-500">{s.note}</span>}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                                {s.events.map((e) => (
                                    <span
                                        key={e.name}
                                        className={cn(
                                            'rounded-full px-2 py-0.5 text-xs',
                                            event && e.name !== event ? 'bg-neutral-100 text-neutral-500' : 'bg-maroon-50 text-maroon-800',
                                        )}
                                    >
                                        {e.name}
                                        {s.events.length > 1 && <span className="opacity-70"> · {lkr(e.cents)}</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="col-start-3 sm:col-start-auto sm:text-right">
                            <p className="text-maroon-900 font-semibold whitespace-nowrap tabular-nums">{lkr(amountFor(s))}</p>
                            {!event && s.events.length > 1 && <p className="text-xs text-neutral-500">total of {s.events.length}</p>}
                        </div>
                        <div className="bg-maroon-50 col-span-full h-2 overflow-hidden rounded-full sm:col-start-3 sm:col-end-5" aria-hidden>
                            <div
                                key={event ?? 'all'}
                                className="grow-bar from-maroon-700 to-gold-400 h-full rounded-full bg-gradient-to-r"
                                style={{ width: `${Math.max(2, (amountFor(s) / max) * 100)}%`, ...delay(150 + Math.min(i, 10) * 60) }}
                            />
                        </div>
                    </li>
                ))}
            </ol>
            {shown.length === 0 && <p className="mt-6 text-neutral-600">{labels.empty}</p>}
        </div>
    );
}

/** The official account, in the top-right corner of the page header so givers find it at once. */
export function BankCorner({ bank }: { bank: BankDetails }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(bank.account_number.replace(/\s/g, ''));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard not available: the number is still on screen to copy by hand.
        }
    };

    return (
        <aside aria-label="Official bank account" className="ring-gold-300/40 rounded-2xl bg-white/10 p-5 shadow-xl ring-1 backdrop-blur-md">
            <p className="text-gold-300 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                <Landmark className="size-4" aria-hidden /> Give to the official account only
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-3xl font-bold whitespace-nowrap text-white tabular-nums">{bank.account_number}</p>
                <button
                    type="button"
                    onClick={copy}
                    aria-live="polite"
                    className="bg-gold-400 text-maroon-950 hover:bg-gold-300 inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
                >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-white/15 pt-3 text-sm">
                <dt className="text-white/60">Name</dt>
                <dd className="text-white">{bank.account_name}</dd>
                <dt className="text-white/60">Bank</dt>
                <dd className="text-white">
                    {bank.bank}, {bank.branch}
                </dd>
            </dl>
        </aside>
    );
}

/** The shared layout of the Main sponsors and Best donors pages: totals, podium, full list and a call to give. */
interface HeaderProps {
    title: string;
    subtitle: string;
    crumbs: { title: string; href?: string }[];
}

export default function ContributorBoard({
    rows,
    bank,
    labels,
    header,
    intro,
}: {
    rows: BoardRow[];
    bank: BankDetails;
    labels: BoardLabels;
    /** The page title band: title on the left, bank account top right, totals along the bottom. */
    header: HeaderProps;
    intro?: ReactNode;
}) {
    const stats = useReveal<HTMLDivElement>(0.3);
    const list = useMemo(() => ranked(rows, (s) => s.total_cents), [rows]);
    const events = useMemo(() => {
        const totals = new Map<string, number>();
        list.forEach((s) => s.events.forEach((e) => totals.set(e.name, (totals.get(e.name) ?? 0) + e.cents)));
        return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
    }, [list]);
    const total = list.reduce((sum, s) => sum + s.total_cents, 0);
    const since =
        list
            .map((s) => s.first_received)
            .filter((d): d is string => d !== null)
            .sort()[0] ?? null;
    const counted = useCountUp(Math.round(total / 100), stats.reveal === 'shown');

    return (
        <>
            <PageHeader {...header} aside={<BankCorner bank={bank} />}>
                <div ref={stats.ref} data-reveal={stats.reveal} className="grid gap-4 sm:grid-cols-3">
                    <Stat
                        icon={HandHeart}
                        label={since ? `${labels.given} since ${formatDate(since)}` : `${labels.given} in total`}
                        value={lkr(counted * 100)}
                        ms={0}
                    />
                    <Stat icon={Users} label={labels.people} value={String(list.length)} ms={120} />
                    <Stat
                        icon={CalendarHeart}
                        label={events.length === 1 ? labels.cause : `${labels.cause}s`}
                        value={String(events.length)}
                        ms={240}
                    />
                </div>
            </PageHeader>

            {intro}

            {list.length > 0 && (
                <Section>
                    <div className="mb-12 text-center">
                        <p className="text-maroon-700 text-sm font-semibold tracking-wider uppercase">With heartfelt thanks</p>
                        <h2 className="text-maroon-950 mt-1 text-3xl font-bold">{labels.podiumTitle}</h2>
                    </div>
                    <Podium top={list.slice(0, 3)} />
                </Section>
            )}

            <section className="bg-white">
                <Section className="max-w-5xl">
                    {list.length === 0 ? <p className="text-neutral-600">{labels.empty}</p> : <List rows={list} events={events} labels={labels} />}
                </Section>
            </section>

            <Section>
                <div className="from-maroon-800 to-maroon-950 grid items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto]">
                    <div>
                        <h2 className="text-2xl font-bold sm:text-3xl">{labels.ctaTitle}</h2>
                        <p className="mt-2 max-w-2xl text-white/85">{labels.ctaText}</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Button asChild size="lg" className="bg-gold-400 text-maroon-950 hover:bg-gold-300">
                                <Link href="/contact">Talk to the committee</Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href="/projects">See our projects</Link>
                            </Button>
                        </div>
                    </div>
                    <dl className="rounded-2xl bg-white/10 p-5 text-sm ring-1 ring-white/15">
                        <div className="mb-3 flex items-center gap-2 font-semibold">
                            <Landmark className="text-gold-300 size-4" aria-hidden /> {bank.bank}, {bank.branch}
                        </div>
                        <dt className="text-gold-300 text-xs tracking-wide uppercase">Account number</dt>
                        <dd className="text-lg font-semibold tabular-nums">{bank.account_number}</dd>
                        <dt className="text-gold-300 mt-2 text-xs tracking-wide uppercase">Account name</dt>
                        <dd>{bank.account_name}</dd>
                    </dl>
                </div>
            </Section>
        </>
    );
}
