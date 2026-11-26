import PageHeader from '@/components/public/page-header';
import { SectionTitle } from '@/components/public/section';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { langOf } from '@/lib/lang';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type MembershipPlan } from '@/types/membership';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Check, FileText, HandCoins, UserPlus } from 'lucide-react';

interface Props {
    membership: {
        title: string;
        intro: string;
        sections: { number: string; title: string; clauses: { number: string; text: string }[] }[];
    };
    /** Set by the treasurer under Membership plans; only plans open for requests are sent. */
    plans: MembershipPlan[];
}

/** 1500000 cents → "15,000" (cents shown only when there are any). */
function rupees(cents: number): string {
    return (cents / 100).toLocaleString('en-LK', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 });
}

// Facts from the constitution (clause 4.2), shared by every paid membership.
const eligibility = ['Open to anyone who studied at the college for at least one year', 'Applications are approved by the executive committee'];

const steps = [
    { Icon: UserPlus, title: 'Create your account', text: 'Sign up with your email address. It takes a minute.' },
    { Icon: FileText, title: 'Send your request', text: 'Choose annual or life membership, and add your phone or NIC and your O/L and A/L years.' },
    { Icon: BadgeCheck, title: 'Committee review', text: 'The executive committee reviews it and gives you a membership number.' },
    {
        Icon: HandCoins,
        title: 'Pay the fee',
        text: 'An office bearer contacts you to collect it by cash, bank transfer or cheque. Then your membership is active.',
    },
];

function FeeCard({ plan, cta }: { plan: MembershipPlan; cta: { href: string; label: string } }) {
    // A one-time fee (life membership) is the highlighted card.
    const featured = !plan.recurring;

    return (
        <article
            className={cn(
                'relative flex flex-col overflow-hidden rounded-[22px] border p-7 sm:p-8',
                featured
                    ? 'border-maroon-800 from-maroon-800 to-maroon-700 bg-gradient-to-br text-white shadow-[var(--shadow-lift)]'
                    : 'border-neutral-200 bg-white shadow-[var(--shadow-card)]',
            )}
        >
            {featured && <span aria-hidden className="border-gold-400/15 absolute -top-14 -right-14 size-48 rounded-full border-[30px]" />}
            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <h3 className={cn('text-xl font-bold', featured ? 'text-white' : 'text-neutral-900')}>{plan.name}</h3>
                    {plan.nameSi && (
                        <p lang="si" className={cn('mt-0.5 text-base', featured ? 'text-gold-400' : 'text-maroon-700')}>
                            {plan.nameSi}
                        </p>
                    )}
                </div>
                <span
                    className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-semibold',
                        featured ? 'bg-gold-500 text-gold-ink' : 'bg-maroon-50 text-maroon-700',
                    )}
                >
                    {featured ? 'Pay once' : 'Renew yearly'}
                </span>
            </div>

            <p className="relative mt-7 flex items-baseline gap-1.5">
                <span className={cn('text-xl font-bold', featured ? 'text-white/70' : 'text-neutral-500')}>Rs.</span>
                <span className="text-5xl font-extrabold tracking-[-0.03em] tabular-nums">{rupees(plan.feeCents)}</span>
            </p>
            <p className={cn('relative mt-1 text-[15px]', featured ? 'text-white/75' : 'text-neutral-500')}>
                {plan.recurring ? 'per year' : 'one-time payment'}
            </p>

            <ul className={cn('relative mt-7 space-y-3 border-t pt-6', featured ? 'border-white/15' : 'border-neutral-200')}>
                {eligibility.map((e) => (
                    <li key={e} className="flex gap-3 text-[15.5px]">
                        <Check className={cn('mt-1 size-[18px] shrink-0', featured ? 'text-gold-400' : 'text-emerald-700')} />
                        <span className={featured ? 'text-white/90' : 'text-neutral-700'}>{e}</span>
                    </li>
                ))}
                {featured && (
                    <li className="flex gap-3 text-[15.5px]">
                        <Check className="text-gold-400 mt-1 size-[18px] shrink-0" />
                        <span className="text-white/90">For members who have kept their membership for the period the committee sets</span>
                    </li>
                )}
            </ul>

            <div className="relative mt-auto pt-8">
                {/* One gold button per view: the featured (life) plan gets it. */}
                <Button asChild variant={featured ? 'gold' : 'maroon'} size="brand" className="w-full">
                    <Link href={cta.href}>
                        {cta.label}
                        <ArrowRight />
                    </Link>
                </Button>
            </div>
        </article>
    );
}

export default function Membership({ membership, plans }: Props) {
    const { auth } = usePage<SharedData>().props;
    const apply = auth.user ? { href: '/my-membership', label: 'Send a request' } : { href: '/register', label: 'Become a member' };

    return (
        <PublicLayout title="Membership">
            <div className="text-[17px]">
                <PageHeader
                    title="Membership"
                    subtitle="Join the past pupils of Senanayake Central College. Stay connected with your batch and help the school grow."
                    crumbs={[{ title: 'Membership' }]}
                />

                {/* Fees */}
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
                    <SectionTitle
                        kicker="Membership fees"
                        description="Annual or life membership, as set out in clause 4 of the association's constitution."
                    >
                        Choose your membership
                    </SectionTitle>
                    <div className={cn('mx-auto grid gap-6', plans.length > 1 ? 'max-w-5xl md:grid-cols-2' : 'max-w-xl')}>
                        {plans.map((p) => (
                            <FeeCard key={p.category} plan={p} cta={apply} />
                        ))}
                    </div>
                    <p className="mx-auto mt-6 max-w-5xl text-center text-[15px] text-neutral-500">
                        Fees are set by the executive committee from time to time (constitution clause 4.2.3). Already on the old register?{' '}
                        <Link href="/my-membership" className="text-maroon-700 font-semibold hover:underline">
                            Claim your record
                        </Link>
                        .
                    </p>
                </section>

                {/* How to join */}
                <section className="bg-neutral-100">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
                        <SectionTitle
                            kicker="How to join"
                            description="Nothing is paid online. An office bearer collects the fee once your request is approved."
                        >
                            Four simple steps
                        </SectionTitle>
                        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {steps.map(({ Icon, title, text }, i) => (
                                <li key={title} className="rounded-[22px] border border-neutral-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-maroon-50 text-maroon-700 grid size-11 place-items-center rounded-xl">
                                            <Icon className="size-[22px]" />
                                        </span>
                                        <span className="text-gold-text text-[13px] font-bold tracking-[0.12em] uppercase">Step {i + 1}</span>
                                    </div>
                                    <h3 className="mt-4 text-lg font-bold text-neutral-900">{title}</h3>
                                    <p className="mt-1.5 text-[15.5px] text-neutral-600">{text}</p>
                                </li>
                            ))}
                        </ol>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild variant="maroon" size="brand" className="max-sm:w-full">
                                <Link href={apply.href}>
                                    {auth.user ? 'Go to my membership' : 'Create my account'}
                                    <ArrowRight />
                                </Link>
                            </Button>
                            <Button asChild variant="pill" size="brand" className="max-sm:w-full">
                                <Link href="/contact">Questions? Contact us</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Constitution */}
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
                    <SectionTitle kicker="Constitution, clause 4" description={<span {...langOf(membership.intro)}>{membership.intro}</span>}>
                        <span {...langOf(membership.title)}>{membership.title}</span>
                    </SectionTitle>

                    <div className="grid gap-8 lg:grid-cols-[15rem_1fr]">
                        <nav aria-label="Clauses" className="lg:sticky lg:top-28 lg:self-start">
                            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                                {membership.sections.map((s) => (
                                    <li key={s.number}>
                                        <a
                                            href={`#clause-${s.number}`}
                                            className="hover:bg-maroon-50 flex min-h-11 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3.5 lg:border-transparent lg:bg-transparent"
                                        >
                                            <span className="text-maroon-700 text-sm font-bold tabular-nums">{s.number}</span>
                                            <span {...langOf(s.title)} className="text-[15.5px] leading-snug text-neutral-800">
                                                {s.title.replace(/\.$/, '')}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className="grid gap-6">
                            {membership.sections.map((s) => (
                                <article
                                    key={s.number}
                                    id={`clause-${s.number}`}
                                    className="scroll-mt-28 rounded-[22px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
                                >
                                    <h3 className="flex flex-wrap items-baseline gap-3">
                                        <span className="bg-maroon-800 rounded-full px-3 py-0.5 text-sm font-bold text-white tabular-nums">
                                            {s.number}
                                        </span>
                                        <span {...langOf(s.title)} className="text-xl leading-snug font-bold text-neutral-900">
                                            {s.title.replace(/\.$/, '')}
                                        </span>
                                    </h3>
                                    <ol className="mt-5 divide-y divide-neutral-100">
                                        {s.clauses.map((c) => (
                                            <li key={c.number} className="grid gap-1 py-4 first:pt-0 last:pb-0 sm:grid-cols-[3.5rem_1fr] sm:gap-3">
                                                <span className="text-maroon-700 pt-1 text-sm font-bold tabular-nums">{c.number}</span>
                                                <p {...langOf(c.text)} className="text-neutral-800">
                                                    {c.text}
                                                </p>
                                            </li>
                                        ))}
                                    </ol>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}
