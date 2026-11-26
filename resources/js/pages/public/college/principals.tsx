import PageHeader from '@/components/public/page-header';
import { formatDate, Section, SectionTitle } from '@/components/public/section';
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

function fromLabel(v: string | null): string {
    if (!v) return 'Date not recorded';
    return isDate(v) ? formatDate(v) : v;
}

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

                <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                    {list.map((t, i) =>
                        t.name === null ? (
                            <li
                                key={`gap-${i}`}
                                className="col-span-2 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-6 text-center sm:col-span-3 lg:col-span-4 xl:col-span-5"
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
                                    'group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md',
                                    t.present && 'ring-gold-400 ring-2',
                                )}
                            >
                                <div className="relative">
                                    <Portrait p={t} large={t.present} className="aspect-[4/5] w-full" />
                                    <span className="text-maroon-900 absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-bold shadow-sm">
                                        No. {t.number ?? '–'}
                                    </span>
                                    {t.present && (
                                        <span className="bg-gold-400 text-maroon-950 absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm">
                                            Present
                                        </span>
                                    )}
                                    <span className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-2.5 text-sm font-semibold text-white tabular-nums">
                                        {yearsLabel(t, t.present)}
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-1 p-4">
                                    <h3 {...langOf(t.name)} className="font-semibold text-neutral-900">
                                        {t.name}
                                    </h3>
                                    {t.note && (
                                        <p {...langOf(t.note)} className="text-maroon-700 text-sm">
                                            {t.note}
                                        </p>
                                    )}
                                    <p className="mt-auto pt-1 text-xs text-neutral-500">From {fromLabel(t.from)}</p>
                                </div>
                            </li>
                        ),
                    )}
                </ol>
            </Section>
        </PublicLayout>
    );
}
