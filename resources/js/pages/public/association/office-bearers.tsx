import PageHeader from '@/components/public/page-header';
import { Section } from '@/components/public/section';
import { useReveal } from '@/hooks/use-reveal';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import { type Person, type SiteInfo } from '@/types/public';
import { usePage } from '@inertiajs/react';
import { Crown, Users } from 'lucide-react';
import { type CSSProperties, useMemo, useState } from 'react';

interface Office {
    role: string;
    people: Person[];
}

interface Term {
    term: string;
    elected: string;
    officers: Office[];
    committee: Person[];
    advisory: Office[];
}

interface Props {
    content: { title: string; basis: string; terms: Term[] };
}

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

function initials(name: string) {
    const words = name
        .replace(/^(mr|mrs|ms|miss|dr|eng|rev|prof)\.?\s+/i, '')
        .split(/[\s.]+/)
        .filter(Boolean);
    return ((words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
}

/** "Joint Secretaries" → "Joint Secretary", for a card showing one person. */
function singular(role: string) {
    return role.replace(/ies$/i, 'y').replace(/([^s])s$/i, '$1');
}

/** The batch year in a note such as "A/L 1998", if there is one. */
function batchOf(person: Person) {
    return person.note?.match(/(19|20)\d{2}/)?.[0] ?? null;
}

function Avatar({ person, photo, size = 'md' }: { person: Person; photo?: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 'size-10 text-sm', md: 'size-16 text-lg', lg: 'size-24 text-2xl' };
    return photo ? (
        <img src={photo} alt="" className={cn('ring-gold-300 rounded-full object-cover ring-4', sizes[size])} loading="lazy" />
    ) : (
        <span
            aria-hidden
            className={cn(
                'from-maroon-700 to-maroon-950 text-gold-300 ring-gold-300/70 flex items-center justify-center rounded-full bg-gradient-to-br font-semibold ring-4',
                sizes[size],
            )}
        >
            {initials(person.name)}
        </span>
    );
}

function OfficerCard({ role, person, photo, lead = false, ms }: { role: string; person: Person; photo?: string; lead?: boolean; ms: number }) {
    return (
        <article
            className={cn(
                'reveal-item org-card relative flex w-56 flex-col items-center rounded-2xl bg-white px-5 pt-6 pb-5 text-center shadow-sm ring-1 ring-black/5',
                lead && 'border-gold-400 w-64 border-t-4 shadow-md',
            )}
            style={delay(ms)}
        >
            {lead && (
                <span className="bg-gold-400 text-maroon-950 absolute -top-4 flex size-8 items-center justify-center rounded-full shadow">
                    <Crown className="size-4" aria-hidden />
                </span>
            )}
            <Avatar person={person} photo={photo} size={lead ? 'lg' : 'md'} />
            <p className="text-maroon-700 mt-3 text-xs font-semibold tracking-wider uppercase">{role}</p>
            <h3 className={cn('mt-1 font-bold text-neutral-900', lead ? 'text-lg' : 'text-base')}>{person.name}</h3>
            {person.note && <p className="mt-0.5 text-sm text-neutral-600">{person.note}</p>}
        </article>
    );
}

/** One office in the tree: each person holding it, side by side if several. */
function OfficeNode({ office, photoFor, ms, lead }: { office: Office; photoFor: (p: Person) => string | undefined; ms: number; lead?: boolean }) {
    return (
        <div className="flex flex-wrap justify-center gap-4">
            {office.people.map((p, i) => (
                <OfficerCard
                    key={p.name}
                    role={office.people.length > 1 ? singular(office.role) : office.role}
                    person={p}
                    photo={photoFor(p)}
                    lead={lead}
                    ms={ms + i * 80}
                />
            ))}
        </div>
    );
}

/**
 * Arranges the offices as a tree from their names: President at the top, then
 * the Vice President, then the other officers. "Joint …" offices hang under the
 * office they share a name with (Joint Secretaries under the Secretary).
 */
function useTree(officers: Office[]) {
    return useMemo(() => {
        const is = (o: Office, word: string) => o.role.toLowerCase().includes(word);
        const president = officers.find((o) => is(o, 'president') && !is(o, 'vice')) ?? officers[0];
        const vice = officers.find((o) => o !== president && is(o, 'vice'));
        const rest = officers.filter((o) => o !== president && o !== vice);
        const joints = rest.filter((o) => is(o, 'joint'));
        const branches = rest
            .filter((o) => !is(o, 'joint'))
            .map((office) => {
                // "Secretary" and "Joint Secretaries" share the stem "secretar".
                const stem = office.role
                    .toLowerCase()
                    .replace(/^the\s+/, '')
                    .trim()
                    .replace(/(ies|y|s)$/, '');
                return { office, children: joints.filter((j) => j.role.toLowerCase().includes(stem)) };
            });
        const placed = new Set(branches.flatMap((b) => b.children));
        joints.filter((j) => !placed.has(j)).forEach((j) => branches.push({ office: j, children: [] }));
        return { president, vice, branches };
    }, [officers]);
}

function OrgTree({ term, photoFor }: { term: Term; photoFor: (p: Person) => string | undefined }) {
    const { ref, reveal } = useReveal<HTMLDivElement>(0.1);
    const { president, vice, branches } = useTree(term.officers);
    const level = (n: number) => n * 260;

    return (
        <div ref={ref} data-reveal={reveal} className="org-tree overflow-x-auto pb-4">
            <div className="mx-auto flex w-max min-w-full flex-col items-center px-2 pt-6">
                {president && <OfficeNode office={president} photoFor={photoFor} ms={level(0)} lead />}

                <ul className="org-children" style={delay(level(1) - 120)}>
                    <li>
                        {vice ? <OfficeNode office={vice} photoFor={photoFor} ms={level(1)} /> : null}

                        {branches.length > 0 && (
                            <ul className="org-children" style={delay(level(2) - 120)}>
                                {branches.map((b, i) => (
                                    <li key={b.office.role}>
                                        <OfficeNode office={b.office} photoFor={photoFor} ms={level(2) + i * 100} />
                                        {b.children.length > 0 && (
                                            <ul className="org-children" style={delay(level(3) - 120)}>
                                                {b.children.flatMap((child) =>
                                                    child.people.map((p, j) => (
                                                        <li key={p.name}>
                                                            <OfficerCard
                                                                role={child.people.length > 1 ? singular(child.role) : child.role}
                                                                person={p}
                                                                photo={photoFor(p)}
                                                                ms={level(3) + j * 100}
                                                            />
                                                        </li>
                                                    )),
                                                )}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                </ul>
            </div>
        </div>
    );
}

function Committee({ members }: { members: Person[] }) {
    const { ref, reveal } = useReveal<HTMLDivElement>(0.1);
    const [batch, setBatch] = useState<string | null>(null);
    const batches = useMemo(
        () =>
            Object.entries(
                members.reduce<Record<string, number>>((acc, m) => {
                    const b = batchOf(m);
                    if (b) acc[b] = (acc[b] ?? 0) + 1;
                    return acc;
                }, {}),
            ).sort(([a], [b]) => a.localeCompare(b)),
        [members],
    );

    return (
        <div ref={ref} data-reveal={reveal}>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-maroon-950 flex items-center gap-2 text-2xl font-bold">
                        <Users className="text-maroon-700 size-6" aria-hidden /> Executive committee members
                    </h2>
                    <p className="mt-1 text-neutral-600">{members.length} members elected to serve the association.</p>
                </div>
                {batches.length > 1 && (
                    <div role="group" aria-label="Highlight a batch" className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setBatch(null)}
                            aria-pressed={batch === null}
                            className={cn(
                                'rounded-full px-3 py-1 text-sm ring-1',
                                batch === null ? 'bg-maroon-800 ring-maroon-800 text-white' : 'hover:bg-maroon-50 bg-white ring-black/10',
                            )}
                        >
                            All
                        </button>
                        {batches.map(([b, n]) => (
                            <button
                                key={b}
                                type="button"
                                onClick={() => setBatch(batch === b ? null : b)}
                                aria-pressed={batch === b}
                                className={cn(
                                    'rounded-full px-3 py-1 text-sm ring-1',
                                    batch === b ? 'bg-maroon-800 ring-maroon-800 text-white' : 'hover:bg-maroon-50 bg-white ring-black/10',
                                )}
                            >
                                A/L {b} <span className="opacity-70">· {n}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {members.map((m, i) => {
                    const dimmed = batch !== null && batchOf(m) !== batch;
                    return (
                        <li
                            key={m.name}
                            className={cn(
                                'reveal-item org-card flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition-opacity duration-300',
                                dimmed && 'opacity-30',
                                batch !== null && !dimmed && 'ring-gold-400 ring-2',
                            )}
                            style={delay(Math.min(i, 16) * 45)}
                        >
                            <Avatar person={m} size="sm" />
                            <div className="min-w-0">
                                <p className="truncate font-medium text-neutral-900">{m.name}</p>
                                <p className="text-sm text-neutral-600">{m.note ?? 'Batch not listed'}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function Advisors({ groups }: { groups: Office[] }) {
    const { ref, reveal } = useReveal<HTMLDivElement>(0.2);
    const filled = groups.filter((g) => g.people.length > 0);
    if (filled.length === 0) return null;

    return (
        <div ref={ref} data-reveal={reveal}>
            <h2 className="text-maroon-950 text-2xl font-bold">Advisors and auditors</h2>
            <p className="mt-1 text-neutral-600">The non-executive committee supports and checks the work of the executive.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {filled.map((g, i) => (
                    <div
                        key={g.role}
                        className="reveal-item org-card border-gold-400 rounded-2xl border-l-4 bg-white p-5 shadow-sm ring-1 ring-black/5"
                        style={delay(i * 120)}
                    >
                        <p className="text-maroon-700 text-xs font-semibold tracking-wider uppercase">{g.role}</p>
                        <ul className="mt-3 space-y-3">
                            {g.people.map((p) => (
                                <li key={p.name} className="flex items-center gap-3">
                                    <Avatar person={p} size="sm" />
                                    <div>
                                        <p className="font-medium text-neutral-900">{p.name}</p>
                                        {p.note && <p className="text-sm text-neutral-600">{p.note}</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function OfficeBearers({ content }: Props) {
    const { site } = usePage<{ site: SiteInfo }>().props;
    const [active, setActive] = useState(0);
    const term = content.terms[active];

    // Office bearers with a photo on the Contact page show it here too.
    const photoFor = (p: Person) => site.contacts.find((c) => c.name === p.name)?.image || undefined;

    if (!term) {
        return (
            <PublicLayout title="Office bearers">
                <PageHeader title="Office bearers" crumbs={[{ title: 'Association' }, { title: 'Office bearers' }]} />
                <Section>
                    <p className="text-neutral-600">The office bearers will be listed here soon.</p>
                </Section>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout title="Office bearers">
            <PageHeader title="Office bearers" subtitle={content.basis} crumbs={[{ title: 'Association' }, { title: 'Office bearers' }]} />

            <Section>
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-maroon-700 text-sm font-semibold tracking-wider uppercase">Executive committee</p>
                        <h2 className="text-maroon-950 mt-1 text-3xl font-bold">{term.term}</h2>
                        {term.elected && <p className="mt-1 text-neutral-600">{term.elected}</p>}
                    </div>
                    {content.terms.length > 1 && (
                        <div role="tablist" aria-label="Term" className="flex gap-2">
                            {content.terms.map((t, i) => (
                                <button
                                    key={t.term}
                                    role="tab"
                                    aria-selected={i === active}
                                    onClick={() => setActive(i)}
                                    className={cn(
                                        'rounded-full px-4 py-2 text-sm font-medium',
                                        i === active ? 'bg-maroon-800 text-white' : 'hover:bg-maroon-50 bg-white ring-1 ring-black/10',
                                    )}
                                >
                                    {t.term}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* key: switching term replays the animation */}
                <div key={term.term} className="from-maroon-50 ring-maroon-100 mt-6 rounded-3xl bg-gradient-to-b to-white px-2 py-10 ring-1 sm:px-6">
                    <OrgTree term={term} photoFor={photoFor} />
                </div>
            </Section>

            <section className="bg-white">
                <Section key={`${term.term}-committee`}>
                    <Committee members={term.committee} />
                </Section>
            </section>

            <Section key={`${term.term}-advisors`}>
                <Advisors groups={term.advisory} />
            </Section>
        </PublicLayout>
    );
}
