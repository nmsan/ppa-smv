import PageHeader from '@/components/public/page-header';
import { Section, SectionTitle } from '@/components/public/section';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

interface Props {
    membership: {
        title: string;
        intro: string;
        sections: { number: string; title: string; clauses: { number: string; text: string }[] }[];
        fees: { name: string; sinhala: string; amount: string; period: string }[];
    };
}

export default function Membership({ membership }: Props) {
    return (
        <PublicLayout title="Membership">
            <PageHeader title="Membership" subtitle={membership.intro} crumbs={[{ title: 'Membership' }]} />

            <Section>
                <SectionTitle kicker="Fees">Become a member</SectionTitle>
                <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
                    {membership.fees.map((f, i) => (
                        <div
                            key={f.name}
                            className={`rounded-2xl p-6 shadow-sm ring-1 ${i === 1 ? 'bg-maroon-900 ring-maroon-900 text-white' : 'bg-white ring-black/5'}`}
                        >
                            <p className={`font-semibold ${i === 1 ? 'text-gold-300' : 'text-maroon-800'}`}>{f.name}</p>
                            <p className={`text-sm ${i === 1 ? 'text-white/75' : 'text-neutral-600'}`}>{f.sinhala}</p>
                            <p className="mt-4 text-3xl font-bold">{f.amount}</p>
                            <p className={`text-sm ${i === 1 ? 'text-white/75' : 'text-neutral-600'}`}>{f.period}</p>
                        </div>
                    ))}
                </div>
                <ul className="mt-6 space-y-2 text-neutral-700">
                    <li className="flex gap-2">
                        <Check className="text-maroon-700 mt-0.5 size-5" /> Open to anyone who studied at the college for at least one year.
                    </li>
                    <li className="flex gap-2">
                        <Check className="text-maroon-700 mt-0.5 size-5" /> Applications are approved by the executive committee.
                    </li>
                </ul>
                <Button asChild size="lg" className="bg-maroon-800 hover:bg-maroon-700 mt-8">
                    <Link href="/register">Become a member</Link>
                </Button>
            </Section>

            <section className="bg-white">
                <Section>
                    <SectionTitle kicker="Constitution, clause 4">{membership.title}</SectionTitle>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {membership.sections.map((s) => (
                            <div key={s.number} className="rounded-xl bg-neutral-50 p-6 ring-1 ring-black/5">
                                <h3 className="text-maroon-900 text-lg font-bold">
                                    {s.number} {s.title}
                                </h3>
                                <ol className="mt-4 space-y-3">
                                    {s.clauses.map((c) => (
                                        <li key={c.number} className="flex gap-3 text-sm leading-relaxed text-neutral-800">
                                            <span className="text-maroon-700 shrink-0 font-semibold">{c.number}</span>
                                            <span>{c.text}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ))}
                    </div>
                </Section>
            </section>
        </PublicLayout>
    );
}
