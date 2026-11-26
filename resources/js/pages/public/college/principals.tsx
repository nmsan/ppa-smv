import PageHeader from '@/components/public/page-header';
import { Section, SectionTitle } from '@/components/public/section';
import PublicLayout from '@/layouts/public-layout';
import { langOf } from '@/lib/lang';
import { cn } from '@/lib/utils';
import { ShieldAlert } from 'lucide-react';

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

export default function Principals({ content }: Props) {
    // Stored oldest first; each term ends when the next one begins.
    const terms: Term[] = content.principals.map((p, i, all) => ({ ...p, to: all[i + 1]?.from ?? null }));
    const presentIndex = terms.findLastIndex((t) => t.name !== null);
    // Newest first, the present principal leading the list.
    const list = terms.map((t, i) => ({ ...t, present: i === presentIndex })).reverse();

    return (
        <PublicLayout title="Principals">
            <PageHeader title="Principals of the college" subtitle={content.subtitle} crumbs={[{ title: 'College' }, { title: 'Principals' }]} />

            <Section className="pb-6 sm:pb-8">
                <figure className="bg-maroon-900 relative overflow-hidden rounded-[28px] px-7 py-10 text-white sm:px-12 sm:py-14">
                    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden className="text-gold-400/30 absolute top-6 right-8 size-24">
                        <path d="M10 36c-3.3 0-6-2.9-6-7 0-8.6 5.4-15.4 13.4-19l1.6 2.6C13.9 15.4 11 19.2 10.6 23c.5-.2 1.1-.3 1.8-.3 3.6 0 6.2 2.6 6.2 6.4 0 4-3.3 6.9-8.6 6.9Zm21 0c-3.3 0-6-2.9-6-7 0-8.6 5.4-15.4 13.4-19L40 12.6C34.9 15.4 32 19.2 31.6 23c.5-.2 1.1-.3 1.8-.3 3.6 0 6.2 2.6 6.2 6.4 0 4-3.3 6.9-8.6 6.9Z" />
                    </svg>
                    <blockquote {...langOf(content.message.text)} className="relative max-w-3xl text-lg leading-relaxed sm:text-xl">
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

                <ol className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                    {list.map((t, i) =>
                        t.name === null ? (
                            <li
                                key={`gap-${i}`}
                                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-5 text-center sm:col-span-2 xl:col-span-3"
                            >
                                <ShieldAlert className="size-6 text-neutral-400" />
                                <p className="font-semibold text-neutral-700">{t.from}</p>
                                {t.note && (
                                    <p {...langOf(t.note)} className="text-neutral-600">
                                        {t.note}
                                    </p>
                                )}
                            </li>
                        ) : (
                            <li
                                key={`${t.number}-${i}`}
                                className={cn(
                                    'flex items-center gap-4 rounded-2xl bg-white p-3 pr-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md',
                                    t.present && 'ring-gold-400 bg-gold-100/50 ring-2',
                                )}
                            >
                                <div className="relative shrink-0">
                                    <Portrait p={t} large={t.present} className="size-20 rounded-xl sm:size-24" />
                                    <span className="bg-maroon-900 absolute -bottom-1.5 -left-1.5 flex size-8 items-center justify-center rounded-full text-xs font-bold text-white tabular-nums ring-2 ring-white">
                                        {t.number ?? '–'}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 {...langOf(t.name)} className="leading-snug font-semibold text-neutral-900">
                                        {t.name}
                                    </h3>
                                    <p className="text-maroon-700 mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold tabular-nums">
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
                            </li>
                        ),
                    )}
                </ol>
            </Section>
        </PublicLayout>
    );
}
