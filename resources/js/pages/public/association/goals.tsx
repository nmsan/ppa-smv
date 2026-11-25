import PageHeader from '@/components/public/page-header';
import { Section } from '@/components/public/section';
import PublicLayout from '@/layouts/public-layout';

interface Props {
    goals: { title: string; intro: string; items: { marker: string; text: string }[] };
}

export default function Goals({ goals }: Props) {
    return (
        <PublicLayout title="Goals and objectives">
            <PageHeader title="Goals and objectives" subtitle={goals.title} crumbs={[{ title: 'Association' }, { title: 'Goals and objectives' }]} />
            <Section className="max-w-4xl">
                <p className="text-lg text-neutral-700">{goals.intro}</p>
                <ol className="mt-8 space-y-3">
                    {goals.items.map((item) => (
                        <li key={item.marker} className="flex gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                            <span className="bg-maroon-800 text-gold-300 flex size-9 shrink-0 items-center justify-center rounded-full font-semibold">
                                {item.marker}
                            </span>
                            <span className="pt-1.5 leading-relaxed text-neutral-800">{item.text}</span>
                        </li>
                    ))}
                </ol>
            </Section>
        </PublicLayout>
    );
}
