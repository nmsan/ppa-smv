import PageHeader from '@/components/public/page-header';
import { Section, SectionTitle } from '@/components/public/section';
import { Button } from '@/components/ui/button';
import { useReveal } from '@/hooks/use-reveal';
import PublicLayout from '@/layouts/public-layout';
import { langOf } from '@/lib/lang';
import { cn } from '@/lib/utils';
import { type Person, type SiteInfo } from '@/types/public';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Phone } from 'lucide-react';
import { type CSSProperties, useState } from 'react';

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

type Contact = SiteInfo['contacts'][number];

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

function Avatar({ name, photo, className }: { name: string; photo?: string; className?: string }) {
    return photo ? (
        <img src={photo} alt="" className={cn('shrink-0 rounded-full object-cover', className)} loading="lazy" />
    ) : (
        <span
            aria-hidden
            className={cn(
                'text-gold-400 grid shrink-0 place-items-center rounded-full bg-[radial-gradient(120%_90%_at_30%_20%,var(--color-maroon-600),var(--color-maroon-900))] font-bold',
                className,
            )}
        >
            {initials(name)}
        </span>
    );
}

/** A batch note such as "A/L 1998" as a small badge; any other note as plain text. */
function Note({ note, className }: { note: string | null; className?: string }) {
    if (!note) return null;
    return /^(A\/L|O\/L)\s/i.test(note) ? (
        <span className={cn('bg-maroon-50 text-maroon-700 inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold', className)}>{note}</span>
    ) : (
        <span {...langOf(note)} className={cn('text-[15px] text-neutral-500', className)}>
            {note}
        </span>
    );
}

function ContactLink({ contact }: { contact?: Contact }) {
    if (!contact) return null;
    return (
        <a
            href={`tel:${contact.phone.replace(/\s+/g, '')}`}
            className="text-maroon-700 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold hover:underline"
        >
            <Phone className="size-4" />
            {contact.phone}
        </a>
    );
}

function OfficerCard({ role, person, contact, ms }: { role: string; person: Person; contact?: Contact; ms: number }) {
    return (
        <article
            className="reveal-item flex flex-col items-center rounded-[22px] border border-neutral-200 bg-white px-5 pt-7 pb-5 text-center shadow-sm transition hover:shadow-[var(--shadow-card)]"
            style={delay(ms)}
        >
            <Avatar name={person.name} photo={contact?.image} className="ring-gold-400/40 size-20 text-xl ring-4" />
            <p className="text-maroon-700 mt-4 text-[13px] font-bold tracking-[0.12em] uppercase">{role}</p>
            <h3 className="mt-1.5 text-[17.5px] leading-snug font-bold text-neutral-900">{person.name}</h3>
            <Note note={person.note} className="mt-2" />
            {contact && (
                <div className="mt-auto pt-2">
                    <ContactLink contact={contact} />
                </div>
            )}
        </article>
    );
}

function Officers({ term, contactFor }: { term: Term; contactFor: (p: Person) => Contact | undefined }) {
    const { ref, reveal } = useReveal<HTMLDivElement>(0.1);
    // Every office bearer gets the same card, in the order the committee listed the offices.
    const cards = term.officers.flatMap((o) => o.people.map((p) => ({ role: o.people.length > 1 ? singular(o.role) : o.role, person: p })));

    return (
        <div ref={ref} data-reveal={reveal} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ role, person }, i) => (
                <OfficerCard key={person.name} role={role} person={person} contact={contactFor(person)} ms={i * 70} />
            ))}
        </div>
    );
}

function Committee({ members }: { members: Person[] }) {
    const { ref, reveal } = useReveal<HTMLUListElement>(0.05);
    if (members.length === 0) return null;

    return (
        <ul ref={ref} data-reveal={reveal} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((m, i) => (
                <li
                    key={m.name}
                    className="reveal-item flex items-center gap-3.5 rounded-[14px] border border-neutral-200 bg-white p-3.5 shadow-sm"
                    style={delay(Math.min(i, 16) * 35)}
                >
                    <Avatar name={m.name} className="size-11 text-sm" />
                    <div className="min-w-0">
                        <p className="leading-snug font-semibold text-neutral-900">{m.name}</p>
                        {m.note ? <Note note={m.note} className="mt-1" /> : <p className="text-sm text-neutral-500">Batch not listed</p>}
                    </div>
                </li>
            ))}
        </ul>
    );
}

function Advisors({ groups }: { groups: Office[] }) {
    const filled = groups.filter((g) => g.people.length > 0);
    if (filled.length === 0) return null;

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-5">
            {filled.map((g) => (
                <div key={g.role} className="rounded-[22px] border border-neutral-200 bg-white p-6 shadow-sm">
                    <p className="text-maroon-700 text-[13px] font-bold tracking-[0.12em] uppercase">{g.role}</p>
                    <ul className="mt-4 space-y-4">
                        {g.people.map((p) => (
                            <li key={p.name} className="flex items-center gap-3.5">
                                <Avatar name={p.name} className="size-12 text-sm" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-neutral-900">{p.name}</p>
                                    {p.note && <Note note={p.note} className="mt-1" />}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default function OfficeBearers({ content }: Props) {
    const { site } = usePage<{ site: SiteInfo }>().props;
    const [active, setActive] = useState(0);
    const term = content.terms[active];

    // Office bearers listed on the Contact page show their photo and phone here too.
    const contactFor = (p: Person) => site.contacts.find((c) => c.name === p.name);

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

    const officerCount = term.officers.reduce((n, o) => n + o.people.length, 0);

    return (
        <PublicLayout title="Office bearers">
            <div className="text-[17px]">
                <PageHeader title="Office bearers" subtitle={content.basis} crumbs={[{ title: 'Association' }, { title: 'Office bearers' }]} />

                {/* key: switching term replays the entrance animation */}
                <div key={term.term}>
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
                        <SectionTitle
                            kicker={`Term ${term.term}`}
                            description={term.elected || undefined}
                            action={
                                content.terms.length > 1 && (
                                    <div role="tablist" aria-label="Term" className="flex flex-wrap gap-2">
                                        {content.terms.map((t, i) => (
                                            <button
                                                key={t.term}
                                                type="button"
                                                role="tab"
                                                aria-selected={i === active}
                                                onClick={() => setActive(i)}
                                                className={cn(
                                                    'min-h-11 rounded-full px-4 text-[15px] font-semibold',
                                                    i === active
                                                        ? 'bg-maroon-800 text-white'
                                                        : 'hover:border-maroon-700 border border-neutral-200 bg-white',
                                                )}
                                            >
                                                {t.term}
                                            </button>
                                        ))}
                                    </div>
                                )
                            }
                        >
                            Office bearers
                        </SectionTitle>
                        <Officers term={term} contactFor={contactFor} />
                    </section>

                    {term.committee.length > 0 && (
                        <section className="bg-neutral-100">
                            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
                                <SectionTitle
                                    kicker="Executive committee"
                                    description={`${term.committee.length} members elected alongside the ${officerCount} office bearers to serve the association.`}
                                >
                                    Committee members
                                </SectionTitle>
                                <Committee members={term.committee} />
                            </div>
                        </section>
                    )}

                    {term.advisory.some((g) => g.people.length > 0) && (
                        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
                            <SectionTitle kicker="Non-executive committee" description="They support and check the work of the executive committee.">
                                Advisors and auditors
                            </SectionTitle>
                            <Advisors groups={term.advisory} />
                        </section>
                    )}
                </div>

                <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
                    <div className="bg-maroon-800 relative isolate flex flex-col gap-6 overflow-hidden rounded-[28px] p-6 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between">
                        <span
                            aria-hidden
                            className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_100%_0%,rgb(229_185_76/0.22),transparent_60%)]"
                        />
                        <div>
                            <h2 className="text-2xl leading-tight font-bold sm:text-[28px]">Want to help the committee?</h2>
                            <p className="mt-2 max-w-xl text-white/85">
                                Join the association, or get in touch with the office bearers to offer your time and skills.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild variant="gold" size="brand" className="max-sm:w-full">
                                <Link href="/register">
                                    Join PPA
                                    <ArrowRight />
                                </Link>
                            </Button>
                            <Button asChild variant="glass" size="brand" className="max-sm:w-full">
                                <Link href="/contact">Contact the committee</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
