import { SectionTitle } from '@/components/public/section';
import { Button } from '@/components/ui/button';
import { langOf } from '@/lib/lang';
import { type NewsItem } from '@/types/public';
import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

const parse = (iso: string) => new Date(iso + 'T00:00:00');
const month = (iso: string) => parse(iso).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
const weekday = (iso: string) => parse(iso).toLocaleDateString('en-GB', { weekday: 'short' });

/** "Today", "Tomorrow", "In 3 days". Computed after mount so server and client markup match. */
function useCountdown(iso: string | null) {
    const [label, setLabel] = useState<string | null>(null);
    useEffect(() => {
        if (!iso) return;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const days = Math.round((parse(iso).getTime() - today.getTime()) / 86_400_000);
        setLabel(days <= 0 ? 'Today' : days === 1 ? 'Tomorrow' : days <= 60 ? `In ${days} days` : null);
    }, [iso]);
    return label;
}

export default function EventsSection({ events }: { events: NewsItem[] }) {
    const [featured, ...rest] = events;

    return (
        <section className="bg-neutral-100">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
                <SectionTitle
                    kicker="Events"
                    description="Reunions, tournaments and celebrations organised by the association."
                    action={
                        <Link href="/news" className="text-maroon-700 inline-flex items-center gap-1.5 font-semibold hover:underline">
                            All news and events
                            <ArrowRight className="size-4" />
                        </Link>
                    }
                >
                    Come back to Madampe
                </SectionTitle>

                {featured ? <FeaturedEvent event={featured} /> : <NoEvents />}

                {rest.length > 0 && (
                    <ul className="mt-5 grid gap-5 md:grid-cols-2">
                        {rest.map((e) => (
                            <li key={e.slug}>
                                <Link
                                    href={`/news/${e.slug}`}
                                    className="flex items-center gap-4 rounded-[22px] border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-[var(--shadow-card)]"
                                >
                                    {e.date && (
                                        <span className="bg-maroon-50 text-maroon-700 flex h-[68px] w-16 shrink-0 flex-col items-center justify-center rounded-[14px] leading-none">
                                            <b className="text-2xl font-extrabold">{parse(e.date).getDate()}</b>
                                            <span className="mt-1.5 text-xs font-bold tracking-[0.12em]">{month(e.date)}</span>
                                        </span>
                                    )}
                                    <span {...langOf(e.title)} className="text-[17.5px] leading-snug font-bold text-neutral-900">
                                        {e.title}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

function FeaturedEvent({ event }: { event: NewsItem }) {
    const countdown = useCountdown(event.date);

    return (
        <article className="grid overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-sm md:grid-cols-[1.05fr_1fr]">
            <div className="bg-maroon-900 relative aspect-[16/10] md:aspect-auto md:min-h-[380px]">
                {event.image && <img src={event.image} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />}
                {event.date && (
                    <div className="absolute top-5 left-5 w-[76px] overflow-hidden rounded-2xl bg-white text-center shadow-[var(--shadow-card)]">
                        <span className="bg-maroon-800 block py-1 text-[13px] font-bold tracking-[0.14em] text-white">{month(event.date)}</span>
                        <span className="block pt-2.5 pb-1 text-[32px] leading-none font-extrabold text-neutral-900">
                            {parse(event.date).getDate()}
                        </span>
                        <span className="block pb-2 text-xs text-neutral-500">{weekday(event.date)}</span>
                    </div>
                )}
                {countdown && (
                    <span className="bg-gold-100 text-gold-text absolute bottom-5 left-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold">
                        <Clock className="size-3.5" />
                        {countdown}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-5 p-6 sm:p-9">
                <div className="flex flex-wrap gap-2">
                    <span className="bg-maroon-50 text-maroon-700 rounded-full px-2.5 py-0.5 text-[13px] font-semibold">Featured event</span>
                </div>
                <h3
                    {...langOf(event.title)}
                    className="text-2xl leading-tight font-bold tracking-tight text-neutral-900 sm:text-[30px] [&[lang=si]]:leading-snug"
                >
                    {event.title}
                </h3>
                {event.date && (
                    <p className="flex items-center gap-2.5 text-neutral-600">
                        <CalendarDays className="text-maroon-700 size-[19px] shrink-0" />
                        {parse(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                )}
                <div className="space-y-2 text-neutral-700">
                    {event.body.slice(0, 2).map((line, i) => (
                        <p key={i} {...langOf(line)}>
                            {line}
                        </p>
                    ))}
                </div>
                <div className="mt-auto flex flex-wrap gap-3 border-t border-neutral-200 pt-5">
                    <Button asChild variant="maroon" size="brand" className="max-sm:w-full">
                        <Link href={`/news/${event.slug}`}>
                            Event details
                            <ArrowRight />
                        </Link>
                    </Button>
                    <Button asChild variant="pill" size="brand" className="max-sm:w-full">
                        <Link href="/contact">Ask the committee</Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}

/** Never a dead end: with nothing scheduled, point to past events instead of an empty block. */
function NoEvents() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-dashed border-neutral-300 bg-white p-6 sm:p-8">
            <div>
                <p className="text-lg font-bold text-neutral-900">No events are scheduled right now.</p>
                <p className="mt-1 text-neutral-600">See photos and reports from past events, or suggest one to the committee.</p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Button asChild variant="pill" size="brand">
                    <Link href="/news">Past events</Link>
                </Button>
                <Button asChild variant="maroon" size="brand">
                    <Link href="/contact">Suggest an event</Link>
                </Button>
            </div>
        </div>
    );
}
