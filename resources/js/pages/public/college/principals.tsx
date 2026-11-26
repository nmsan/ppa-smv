import PageHeader from '@/components/public/page-header';
import { Section, SectionTitle } from '@/components/public/section';
import { useReveal } from '@/hooks/use-reveal';
import PublicLayout from '@/layouts/public-layout';
import { langOf } from '@/lib/lang';
import { cn } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';

interface Principal {
    number: number | null;
    from: string | null;
    name: string | null;
    gender?: 'male' | 'female' | null;
    note: string | null;
    image?: string | null;
}

interface Props {
    content: {
        title: string;
        subtitle: string;
        principals: Principal[];
        message: { text: string; name: string; role: string; image?: string | null };
    };
}

/** A principal with the date their term ended (the next entry's start). */
interface Term extends Principal {
    to: string | null;
}

const isDate = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
const yearOf = (v: string | null) => (v ? v.slice(0, 4) : null);

/** "1956 – 1959", "2024 – Present" or "1987-1989". */
function yearsLabel(t: Term, present: boolean): string {
    if (t.from && !isDate(t.from)) return t.from;
    const from = yearOf(t.from) ?? '?';
    if (present) return `${from} – Present`;
    const to = yearOf(t.to);
    return to && to !== from ? `${from} – ${to}` : from;
}

type AvatarKind = 'male' | 'female' | 'monk';

/** The explicit gender wins; otherwise read the Sinhala honorific ("මිය" Mrs/Ms, "හිමි" a monk, "මයා" Mr). */
function avatarKind(p: Principal): AvatarKind {
    const name = p.name?.trim() ?? '';
    if (/හිමි$/.test(name)) return 'monk';
    if (p.gender) return p.gender;
    return /මිය$/.test(name) ? 'female' : 'male';
}

function Portrait({ p, className, large = false }: { p: Principal; className?: string; large?: boolean }) {
    if (p.image) {
        return <img src={p.image} alt={p.name ?? ''} loading={large ? 'eager' : 'lazy'} className={cn('object-cover object-top', className)} />;
    }
    // CC0 "Notionists" portraits by Zoish; see public/images/principals/CREDITS.md.
    return (
        <div
            aria-hidden
            className={cn(
                'relative overflow-hidden bg-[radial-gradient(120%_90%_at_30%_20%,var(--color-gold-100),var(--color-gold-300))]',
                className,
            )}
        >
            <img
                src={`/images/principals/${avatarKind(p)}.svg`}
                alt=""
                loading={large ? 'eager' : 'lazy'}
                className="absolute inset-0 h-full w-full object-contain object-bottom"
            />
        </div>
    );
}

/** A timeline row that animates in the first time it scrolls into view. */
function RevealRow({ side, className, children }: { side: 'left' | 'right' | 'center'; className?: string; children: ReactNode }) {
    const { ref, reveal } = useReveal<HTMLLIElement>(0.25);
    return (
        <li ref={ref} data-reveal={reveal} data-side={side} className={className}>
            {children}
        </li>
    );
}

/** Fills the gold spine down to the middle of the viewport as the list scrolls. */
function useSpineProgress() {
    const listRef = useRef<HTMLOListElement>(null);
    const fillRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const list = listRef.current;
        const fill = fillRef.current;
        if (!list || !fill) return;
        let frame = 0;
        const update = () => {
            frame = 0;
            const box = list.getBoundingClientRect();
            const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - box.top) / box.height));
            fill.style.transform = `scaleY(${progress})`;
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    return { listRef, fillRef };
}

export default function Principals({ content }: Props) {
    // Stored oldest first; each term ends when the next one begins.
    const terms: Term[] = content.principals.map((p, i, all) => ({ ...p, to: all[i + 1]?.from ?? null }));
    const presentIndex = terms.findLastIndex((t) => t.name !== null);
    // Newest first, the present principal leading the list.
    const list = terms.map((t, i) => ({ ...t, present: i === presentIndex })).reverse();
    const { listRef, fillRef } = useSpineProgress();

    return (
        <PublicLayout title="Principals">
            <PageHeader title="Principals of the college" subtitle={content.subtitle} crumbs={[{ title: 'College' }, { title: 'Principals' }]} />

            <Section className="pb-6 sm:pb-8">
                {/* Capped to the timeline's width below, which keeps the quote's lines a readable length. */}
                <figure className="bg-maroon-900 relative mx-auto max-w-5xl overflow-hidden rounded-[28px] px-7 py-10 text-white sm:px-12 sm:py-14">
                    <blockquote {...langOf(content.message.text)} className="flow-root text-lg leading-relaxed sm:text-xl">
                        {/* The quote mark floats in the text, so the opening lines wrap around it. The viewBox is cropped
                            to the glyph so the float is exactly as big as what is drawn. */}
                        <svg
                            viewBox="4 10 36 26"
                            fill="currentColor"
                            aria-hidden
                            className="text-gold-400/30 float-right -mt-3 ml-3 w-12 sm:ml-4 sm:w-[72px]"
                        >
                            <path d="M10 36c-3.3 0-6-2.9-6-7 0-8.6 5.4-15.4 13.4-19l1.6 2.6C13.9 15.4 11 19.2 10.6 23c.5-.2 1.1-.3 1.8-.3 3.6 0 6.2 2.6 6.2 6.4 0 4-3.3 6.9-8.6 6.9Zm21 0c-3.3 0-6-2.9-6-7 0-8.6 5.4-15.4 13.4-19L40 12.6C34.9 15.4 32 19.2 31.6 23c.5-.2 1.1-.3 1.8-.3 3.6 0 6.2 2.6 6.2 6.4 0 4-3.3 6.9-8.6 6.9Z" />
                        </svg>
                        {content.message.text}
                    </blockquote>
                    <figcaption className="relative mt-6 flex items-center gap-4">
                        {content.message.image && (
                            <img
                                src={content.message.image}
                                alt=""
                                loading="lazy"
                                className="ring-gold-400/60 size-16 shrink-0 rounded-full object-cover object-top ring-2"
                            />
                        )}
                        <div>
                            <p {...langOf(content.message.name)} className="text-gold-300 font-semibold">
                                {content.message.name}
                            </p>
                            <p {...langOf(content.message.role)} className="text-sm text-white/80">
                                {content.message.role}
                            </p>
                        </div>
                    </figcaption>
                </figure>
            </Section>

            <Section className="pt-10 sm:pt-12">
                <SectionTitle kicker="Our principals" description={<span {...langOf(content.title)}>{content.title}</span>}>
                    Those who have led us
                </SectionTitle>

                <ol ref={listRef} className="relative mx-auto max-w-5xl">
                    {/* The spine: left on phones, centred from md up; the gold fill follows the scroll. */}
                    <span aria-hidden className="absolute top-2 bottom-2 left-[19px] w-0.5 bg-neutral-200 md:left-1/2 md:-translate-x-1/2">
                        <span
                            ref={fillRef}
                            className="from-gold-400 to-maroon-700 absolute inset-0 origin-top bg-gradient-to-b will-change-transform"
                            style={{ transform: 'scaleY(0)' }}
                        />
                    </span>
                    {list.map((t, i) => {
                        if (t.name === null) {
                            return (
                                <RevealRow key={`gap-${i}`} side="center" className="relative py-5 pl-14 md:flex md:justify-center md:pl-0">
                                    <span
                                        aria-hidden
                                        className="tl-node absolute top-1/2 left-[11px] flex size-[18px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-neutral-400 bg-neutral-50 md:left-1/2 md:-translate-x-1/2"
                                    />
                                    <div className="tl-card relative flex max-w-md items-start gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 md:mt-8 md:text-center">
                                        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-neutral-400 md:hidden" />
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-700 tabular-nums">{t.from}</p>
                                            {t.note && (
                                                <p {...langOf(t.note)} className="text-sm text-neutral-600">
                                                    {t.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </RevealRow>
                            );
                        }

                        const right = i % 2 === 1;
                        const year = t.from && isDate(t.from) ? yearOf(t.from) : t.from;

                        return (
                            <RevealRow
                                key={`${t.number}-${i}`}
                                side={right ? 'right' : 'left'}
                                className="relative py-3 pl-14 md:grid md:grid-cols-[1fr_4rem_1fr] md:items-center md:pl-0"
                            >
                                {/* Node on the spine, carrying the principal's number. */}
                                <span
                                    className={cn(
                                        'tl-node absolute top-1/2 left-0 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold tabular-nums ring-4 ring-neutral-50 md:static md:col-start-2 md:row-start-1 md:mx-auto md:translate-y-0',
                                        t.present ? 'bg-gold-400 text-maroon-950 tl-pulse' : 'bg-maroon-900 text-white',
                                    )}
                                >
                                    {t.number ?? '–'}
                                </span>

                                {/* Start year, on the side opposite the card (desktop only). */}
                                <p
                                    aria-hidden
                                    className={cn(
                                        'tl-year text-maroon-900/15 hidden text-5xl font-black tracking-tight tabular-nums md:row-start-1 md:block',
                                        right ? 'md:col-start-1 md:pr-6 md:text-right' : 'md:col-start-3 md:pl-6',
                                    )}
                                >
                                    {year}
                                </p>

                                <article
                                    className={cn(
                                        'tl-card relative flex items-center gap-4 rounded-2xl bg-white p-3 pr-4 shadow-sm ring-1 ring-black/5 md:row-start-1',
                                        right ? 'md:col-start-3' : 'md:col-start-1 md:flex-row-reverse md:text-right',
                                        t.present && 'ring-gold-400 ring-2',
                                    )}
                                >
                                    <Portrait p={t} large={t.present} className="tl-photo size-16 shrink-0 rounded-full sm:size-20" />
                                    <div className="min-w-0 flex-1">
                                        <h3 {...langOf(t.name)} className="leading-snug font-semibold text-neutral-900">
                                            {t.name}
                                        </h3>
                                        <p
                                            className={cn(
                                                'text-maroon-700 mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold tabular-nums',
                                                !right && 'md:justify-end',
                                            )}
                                        >
                                            {yearsLabel(t, t.present)}
                                            {t.present && (
                                                <span className="bg-gold-400 text-maroon-950 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                                                    Current
                                                </span>
                                            )}
                                        </p>
                                        {t.note && (
                                            <p {...langOf(t.note)} className="mt-0.5 line-clamp-2 text-xs text-neutral-500">
                                                {t.note}
                                            </p>
                                        )}
                                    </div>
                                </article>
                            </RevealRow>
                        );
                    })}
                </ol>
            </Section>
        </PublicLayout>
    );
}
