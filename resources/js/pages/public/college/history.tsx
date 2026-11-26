import PageHeader from '@/components/public/page-header';
import { Kicker, Section } from '@/components/public/section';
import PublicLayout from '@/layouts/public-layout';
import { langOf } from '@/lib/lang';

interface Props {
    history: {
        title: string;
        school: string[];
        founder: { name: string; title?: string | null; image: string; paragraphs?: string[] | null };
        kannangara: { name: string; tagline: string; image: string; paragraphs: string[] };
    };
}

const milestones = [
    { year: '1946', text: 'මාදම්පේ රජයේ විද්‍යාලය ලෙස ආරම්භය' },
    { year: '1999', text: 'ජාතික පාසලක් ලෙස උසස් කිරීම' },
    { year: '2026', text: 'වසර 80 සපිරීම' },
];

export default function History({ history }: Props) {
    const { founder, kannangara } = history;
    const founderParagraphs = founder.paragraphs ?? [];

    return (
        <PublicLayout title="Founder and history">
            <PageHeader title="Founder and history" subtitle={history.title} crumbs={[{ title: 'College' }, { title: 'Founder and history' }]} />

            {/* Our school */}
            <Section>
                <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
                    <div>
                        <Kicker>Our school</Kicker>
                        <h2 lang="si" className="text-maroon-950 mt-3 text-3xl leading-snug font-bold sm:text-4xl">
                            අපේ පාසලේ කතාව
                        </h2>
                        <div className="mt-6 space-y-5 text-lg text-neutral-800">
                            {history.school.map((p, i) => (
                                <p
                                    key={i}
                                    {...langOf(p)}
                                    className={i === 0 ? 'first-letter:text-maroon-800 first-letter:text-5xl first-letter:font-bold' : undefined}
                                >
                                    {p}
                                </p>
                            ))}
                        </div>
                    </div>

                    <ol className="border-gold-400 relative ml-2 space-y-8 self-center border-l-2 pl-8">
                        {milestones.map((m) => (
                            <li key={m.year} className="relative">
                                <span className="bg-maroon-800 ring-gold-300 absolute top-1.5 -left-[41px] size-4 rounded-full ring-4" />
                                <p className="text-maroon-900 text-3xl font-bold tabular-nums">{m.year}</p>
                                <p lang="si" className="mt-1 text-neutral-700">
                                    {m.text}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </Section>

            {/* Founder */}
            <section className="bg-maroon-950 relative overflow-hidden text-white">
                <div aria-hidden className="bg-gold-400/10 pointer-events-none absolute -top-40 -right-40 size-[480px] rounded-full blur-3xl" />
                <Section className="relative grid items-start gap-10 md:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16">
                    <figure className="mx-auto w-full max-w-xs md:sticky md:top-24">
                        <div className="rounded-[24px] bg-gradient-to-b from-white to-neutral-100 p-6 shadow-[var(--shadow-lift)]">
                            <img src={founder.image} alt={founder.name} className="mx-auto h-64 w-full object-contain" />
                        </div>
                    </figure>

                    <div>
                        <Kicker className="text-gold-300">Our founder</Kicker>
                        <h2 {...langOf(founder.name)} className="mt-3 text-3xl leading-snug font-bold sm:text-4xl">
                            {founder.name}
                        </h2>
                        {founder.title && (
                            <p {...langOf(founder.title)} className="text-gold-300 mt-2 text-lg font-medium">
                                {founder.title}
                            </p>
                        )}
                        {founderParagraphs.length > 0 && (
                            <div className="mt-8 space-y-5 text-lg text-white/90">
                                {founderParagraphs.map((p, i) => (
                                    <p key={i} {...langOf(p)}>
                                        {p}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </Section>
            </section>

            {/* Kannangara */}
            <section className="bg-white">
                <Section className="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
                    <figure className="lg:sticky lg:top-24">
                        <img
                            src={kannangara.image}
                            alt={kannangara.name}
                            className="w-full rounded-[24px] shadow-[var(--shadow-lift)]"
                            loading="lazy"
                        />
                    </figure>
                    <div>
                        <Kicker>Inspiration</Kicker>
                        <h2 {...langOf(kannangara.name)} className="text-maroon-950 mt-3 text-3xl leading-snug font-bold sm:text-4xl">
                            {kannangara.name}
                        </h2>
                        <p {...langOf(kannangara.tagline)} className="text-maroon-700 mt-2 text-lg font-medium">
                            {kannangara.tagline}
                        </p>
                        <div className="mt-8 space-y-5 text-lg text-neutral-800">
                            {kannangara.paragraphs.map((p, i) => (
                                <p key={i} {...langOf(p)}>
                                    {p}
                                </p>
                            ))}
                        </div>
                    </div>
                </Section>
            </section>
        </PublicLayout>
    );
}
