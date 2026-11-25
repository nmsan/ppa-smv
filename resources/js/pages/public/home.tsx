import { formatDate, Section, SectionTitle } from '@/components/public/section';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { type NewsItem, type Project } from '@/types/public';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface Slide {
    title: string;
    text: string;
    cta: { label: string; href: string };
    image: string;
}

interface HomeContent {
    slides: Slide[];
    anniversary: { title: string; from: string; to: string };
    stats: { label: string; value: number }[];
    join: { title: string; text: string };
}

interface Props {
    home: HomeContent;
    message: { text: string; name: string; role: string };
    events: NewsItem[];
    news: NewsItem[];
    projects: Project[];
}

function Hero({ slides }: { slides: Slide[] }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

    useEffect(() => {
        if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const t = setInterval(() => go(index + 1), 6000);
        return () => clearInterval(t);
    }, [index, paused, go]);

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Highlights"
            className="bg-maroon-950 relative h-[28rem] overflow-hidden sm:h-[34rem]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {slides.map((s, i) => (
                <div
                    key={s.title}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} of ${slides.length}`}
                    aria-hidden={i !== index}
                    className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                >
                    <img src={s.image} alt="" className="absolute inset-0 size-full object-cover" />
                    <div className="from-maroon-950/90 via-maroon-950/60 absolute inset-0 bg-gradient-to-r to-transparent" />
                    <div className="relative mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6">
                        <div className="max-w-xl text-white">
                            <h2 className="text-4xl font-bold sm:text-5xl">{s.title}</h2>
                            <p className="mt-4 text-lg text-white/90">{s.text}</p>
                            <Button asChild size="lg" className="bg-gold-400 text-maroon-950 hover:bg-gold-300 mt-8">
                                <Link href={s.cta.href} tabIndex={i === index ? 0 : -1}>
                                    {s.cta.label}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
            <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => go(index - 1)}
                    className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="size-5" />
                </button>
                {slides.map((s, i) => (
                    <button
                        key={s.title}
                        type="button"
                        onClick={() => go(i)}
                        className={`h-2.5 rounded-full transition-all ${i === index ? 'bg-gold-400 w-8' : 'w-2.5 bg-white/50'}`}
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={i === index}
                    />
                ))}
                <button
                    type="button"
                    onClick={() => go(index + 1)}
                    className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
                    aria-label="Next slide"
                >
                    <ChevronRight className="size-5" />
                </button>
            </div>
        </section>
    );
}

export default function Home({ home, message, events, news, projects }: Props) {
    return (
        <PublicLayout title="Home">
            <Hero slides={home.slides} />

            <section className="bg-gold-400 text-maroon-950">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left">
                    <p className="text-2xl font-bold">{home.anniversary.title}</p>
                    <p className="font-medium">
                        {formatDate(home.anniversary.from)} – {formatDate(home.anniversary.to)}
                    </p>
                </div>
            </section>

            <Section className="grid gap-10 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <SectionTitle kicker="Message">From our former principal and president</SectionTitle>
                    <figure className="relative rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
                        <Quote className="text-maroon-100 absolute top-6 right-6 size-10" />
                        <blockquote className="text-lg leading-relaxed text-neutral-800">{message.text}</blockquote>
                        <figcaption className="mt-6 border-t pt-4">
                            <p className="text-maroon-900 font-semibold">{message.name}</p>
                            <p className="text-sm text-neutral-600">{message.role}</p>
                        </figcaption>
                    </figure>
                </div>

                <div className="bg-maroon-900 flex flex-col justify-center rounded-2xl bg-[url('/images/brand/maroon-waves.jpg')] bg-cover p-8 text-white lg:col-span-2">
                    <div className="grid grid-cols-2 gap-6 text-center">
                        {home.stats.map((s) => (
                            <div key={s.label}>
                                <p className="text-gold-300 text-5xl font-bold">{s.value}</p>
                                <p className="mt-1 text-sm tracking-wide uppercase">{s.label}</p>
                            </div>
                        ))}
                    </div>
                    <h2 className="mt-8 text-2xl font-bold">{home.join.title}</h2>
                    <p className="mt-2 text-white/85">{home.join.text}</p>
                    <Button asChild size="lg" className="bg-gold-400 text-maroon-950 hover:bg-gold-300 mt-6 self-start">
                        <Link href="/register">Register now, it's free</Link>
                    </Button>
                </div>
            </Section>

            {events.length > 0 && (
                <section className="bg-white">
                    <Section>
                        <SectionTitle kicker="Upcoming event">Join us</SectionTitle>
                        {events.map((e) => (
                            <article key={e.slug} className="grid items-center gap-8 md:grid-cols-[20rem_1fr]">
                                {e.image && <img src={e.image} alt={e.title} className="w-full rounded-xl shadow-md" loading="lazy" />}
                                <div>
                                    {e.date && (
                                        <p className="bg-gold-300/40 text-maroon-900 inline-block rounded-full px-3 py-1 text-sm font-semibold">
                                            {formatDate(e.date)}
                                        </p>
                                    )}
                                    <h3 className="text-maroon-900 mt-3 text-2xl font-bold">
                                        <Link href={`/news/${e.slug}`} className="hover:underline">
                                            {e.title}
                                        </Link>
                                    </h3>
                                    <div className="mt-4 space-y-2 text-lg text-neutral-800">
                                        {e.body.map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                    <Link href="/contact" className="text-maroon-800 mt-6 inline-block font-semibold hover:underline">
                                        Contact the committee for details →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </Section>
                </section>
            )}

            <Section>
                <div className="flex items-end justify-between gap-4">
                    <SectionTitle kicker="News and events">From the college</SectionTitle>
                    <Link href="/news" className="text-maroon-800 mb-8 text-sm font-semibold hover:underline">
                        All news →
                    </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {news.map((n) => (
                        <Link
                            key={n.slug}
                            href={`/news/${n.slug}`}
                            className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
                        >
                            {n.image && <img src={n.image} alt="" className="aspect-video w-full object-cover" loading="lazy" />}
                            <div className="p-5">
                                {n.date && <p className="text-sm text-neutral-500">{formatDate(n.date)}</p>}
                                <h3 className="text-maroon-900 mt-1 text-lg font-semibold group-hover:underline">{n.title}</h3>
                                <p className="mt-2 line-clamp-3 text-sm text-neutral-700">{n.body[0]}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </Section>

            <section className="bg-white">
                <Section>
                    <div className="flex items-end justify-between gap-4">
                        <SectionTitle kicker="Giving back">School projects</SectionTitle>
                        <Link href="/projects" className="text-maroon-800 mb-8 text-sm font-semibold hover:underline">
                            How to support →
                        </Link>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {projects.map((p) => (
                            <Link
                                key={p.slug}
                                href={`/projects/${p.slug}`}
                                className="group overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-black/5"
                            >
                                <img
                                    src={p.image}
                                    alt=""
                                    className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
                                    loading="lazy"
                                />
                                <h3 className="text-maroon-900 p-5 font-semibold">{p.title}</h3>
                            </Link>
                        ))}
                    </div>
                </Section>
            </section>
        </PublicLayout>
    );
}
