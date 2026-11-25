import { SectionTitle } from '@/components/public/section';
import { Button } from '@/components/ui/button';
import { langOf } from '@/lib/lang';
import { lkr } from '@/lib/money';
import { cn } from '@/lib/utils';
import { type Project } from '@/types/public';
import { Link } from '@inertiajs/react';
import { ArrowRight, Landmark, ReceiptText, Trophy } from 'lucide-react';
import { type Giving } from './impact-strip';

const status = {
    planned: { label: 'Planned', className: 'bg-gold-100 text-gold-text' },
    ongoing: { label: 'In progress', className: 'bg-emerald-50 text-emerald-700' },
    completed: { label: 'Completed', className: 'bg-maroon-50 text-maroon-700' },
} as const;

/**
 * Fundraising-style project cards. Funding totals are not tracked per project
 * yet, so cards show the committee's estimate and status rather than a progress
 * bar; add raised/target once contributions are linked to projects.
 */
export default function ProjectsSection({ projects, giving }: { projects: Project[]; giving: Giving }) {
    if (projects.length === 0) return null;

    return (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
            <SectionTitle
                kicker="School projects"
                description="Choose a project and give through the association's official account. Every contribution is recorded by the treasurer."
                action={
                    <Link href="/projects" className="text-maroon-700 inline-flex items-center gap-1.5 font-semibold hover:underline">
                        All projects
                        <ArrowRight className="size-4" />
                    </Link>
                }
            >
                Every rupee, accounted for
            </SectionTitle>

            {/* auto-fit: two projects stretch to fill the row instead of leaving a gap */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.5rem),1fr))] gap-6">
                {projects.map((p) => (
                    <article
                        key={p.slug}
                        className="group flex flex-col overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-sm transition hover:shadow-[var(--shadow-card)]"
                    >
                        <div className="relative aspect-[16/10] overflow-hidden">
                            <img
                                src={p.image}
                                alt=""
                                className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                loading="lazy"
                            />
                            <span
                                className={cn(
                                    'absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-semibold shadow-sm',
                                    p.status ? status[p.status].className : 'bg-emerald-50 text-emerald-700',
                                )}
                            >
                                {!p.status && <span className="size-[7px] rounded-full bg-current" />}
                                {p.status ? status[p.status].label : 'Accepting support'}
                            </span>
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-6">
                            <h3 {...langOf(p.title)} className="text-xl leading-snug font-bold text-neutral-900">
                                {p.title}
                            </h3>
                            {p.summary && (
                                <p {...langOf(p.summary)} className="line-clamp-3 text-[15.5px] text-neutral-600">
                                    {p.summary}
                                </p>
                            )}
                            {p.estimate && (
                                <p className="flex items-baseline justify-between gap-3 border-t border-neutral-200 pt-3 text-sm text-neutral-500">
                                    Estimated cost
                                    <b className="text-lg font-extrabold text-neutral-900">{p.estimate}</b>
                                </p>
                            )}
                            <div className="mt-auto flex gap-2.5 pt-2">
                                <Button asChild variant="gold" size="brand" className="flex-1">
                                    <Link href={`/projects/${p.slug}#give`}>Donate now</Link>
                                </Button>
                                <Button asChild variant="pill" size="brand" className="flex-1">
                                    <Link href={`/projects/${p.slug}`}>Details</Link>
                                </Button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 rounded-[14px] border border-neutral-200 bg-white px-5 py-4 text-[15px] text-neutral-600">
                <TrustLink href="/projects" Icon={Landmark}>
                    Give to the official bank account
                </TrustLink>
                <TrustLink href="/projects/donors" Icon={ReceiptText}>
                    See the donor board
                </TrustLink>
                <TrustLink href="/projects/sponsors" Icon={Trophy}>
                    Our main sponsors
                </TrustLink>
            </div>

            {giving.supporters > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div aria-hidden className="flex">
                        {giving.shown.map((name, i) => (
                            <span
                                key={name}
                                className={cn(
                                    'grid size-[38px] place-items-center rounded-full border-2 border-white text-[13px] font-bold text-white',
                                    i > 0 && '-ml-2.5',
                                    avatarTones[i % avatarTones.length],
                                )}
                            >
                                {monogram(name)}
                            </span>
                        ))}
                        {giving.supporters > giving.shown.length && (
                            <span className="bg-maroon-800 -ml-2.5 grid size-[38px] place-items-center rounded-full border-2 border-white text-[13px] font-bold text-white">
                                +
                            </span>
                        )}
                    </div>
                    <p className="text-[15.5px] text-neutral-600">
                        <b className="text-neutral-900">{giving.supporters} sponsors and donors</b> have given {lkr(giving.raised_cents)} so far.
                    </p>
                    <Link href="/projects/donors" className="text-maroon-700 inline-flex items-center gap-1.5 font-semibold hover:underline">
                        Donor board
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            )}
        </section>
    );
}

function TrustLink({ href, Icon, children }: { href: string; Icon: typeof Landmark; children: string }) {
    return (
        <Link href={href} className="hover:text-maroon-700 inline-flex min-h-8 items-center gap-2 font-medium">
            <Icon className="size-[18px] text-emerald-700" />
            {children}
        </Link>
    );
}

const avatarTones = ['bg-maroon-700', 'bg-[#B08A2E]', 'bg-maroon-600', 'bg-neutral-700'];

/** "Anthony Builders" → "AB" */
function monogram(name: string): string {
    return name
        .replace(/[^\p{L}\s]/gu, '')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}
