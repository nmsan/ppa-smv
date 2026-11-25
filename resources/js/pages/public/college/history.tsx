import PageHeader from '@/components/public/page-header';
import { Section } from '@/components/public/section';
import PublicLayout from '@/layouts/public-layout';

interface Props {
    history: {
        title: string;
        school: string[];
        founder: { name: string; image: string };
        kannangara: { name: string; tagline: string; image: string; paragraphs: string[] };
    };
}

export default function History({ history }: Props) {
    const { founder, kannangara } = history;

    return (
        <PublicLayout title="Founder and history">
            <PageHeader title="Founder and history" subtitle={history.title} crumbs={[{ title: 'College' }, { title: 'Founder and history' }]} />

            <Section className="grid gap-10 md:grid-cols-[1fr_14rem]">
                <div className="space-y-5 text-lg leading-relaxed text-neutral-800">
                    {history.school.map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
                <figure className="self-start rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
                    <img src={founder.image} alt={founder.name} className="mx-auto h-48 object-contain" />
                    <figcaption className="text-maroon-900 mt-4 font-semibold">{founder.name}</figcaption>
                </figure>
            </Section>

            <section className="bg-white">
                <Section className="grid items-start gap-10 lg:grid-cols-2">
                    <img src={kannangara.image} alt={kannangara.name} className="w-full rounded-xl shadow-sm" loading="lazy" />
                    <div>
                        <h2 className="text-maroon-950 text-2xl font-bold">{kannangara.name}</h2>
                        <p className="text-maroon-700 mt-1 font-medium">{kannangara.tagline}</p>
                        <div className="mt-6 space-y-4 leading-relaxed text-neutral-800">
                            {kannangara.paragraphs.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                    </div>
                </Section>
            </section>
        </PublicLayout>
    );
}
