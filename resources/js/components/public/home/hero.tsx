import { formatDate } from '@/components/public/section';
import { Button } from '@/components/ui/button';
import { langOf } from '@/lib/lang';
import { type NewsItem } from '@/types/public';
import { Link } from '@inertiajs/react';
import { ArrowRight, MapPin } from 'lucide-react';

export interface HeroContent {
    headline: string;
    text: string;
    image: string;
    caption?: string | null;
}

interface Props {
    hero: HeroContent;
    anniversary: { title: string; from: string; to: string };
    nextEvent?: NewsItem;
}

/** Splits "80 Years of Pride." so the last word can be set in gold. */
function splitHeadline(headline: string): [string, string] {
    const i = headline.trimEnd().lastIndexOf(' ');
    return i === -1 ? ['', headline] : [headline.slice(0, i), headline.slice(i + 1)];
}

/** Editorial heritage banner: one photo, one headline, two actions. */
export default function Hero({ hero, anniversary, nextEvent }: Props) {
    const [lead, last] = splitHeadline(hero.headline);

    return (
        <section className="bg-maroon-900 relative isolate overflow-hidden text-white">
            <img src={hero.image} alt="" className="absolute inset-0 -z-20 size-full object-cover object-[center_40%]" fetchPriority="high" />
            <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(58_10_18/0.55)_0%,rgb(58_10_18/0.88)_50%,rgb(58_10_18/0.98)_100%)] md:bg-[linear-gradient(90deg,rgb(58_10_18/0.96)_0%,rgb(74_14_23/0.86)_38%,rgb(74_14_23/0.35)_72%,rgb(74_14_23/0.15)_100%),linear-gradient(0deg,rgb(58_10_18/0.7),transparent_40%)]"
            />

            <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-6 md:pt-[88px] md:pb-[168px]">
                <div className="max-w-[660px]">
                    {nextEvent?.date && (
                        <Link
                            href={`/news/${nextEvent.slug}`}
                            className="inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-full border border-white/25 bg-white/10 py-1.5 pr-3 pl-1.5 text-[14.5px] backdrop-blur hover:bg-white/15"
                        >
                            <span className="bg-gold-500 text-gold-ink shrink-0 rounded-full px-2.5 py-0.5 text-[12.5px] font-bold tracking-wide uppercase">
                                {`${Number(anniversary.to.slice(0, 4)) - Number(anniversary.from.slice(0, 4))}th year`}
                            </span>
                            <span {...langOf(nextEvent.title)} className="truncate leading-snug">
                                {nextEvent.title} · {formatDate(nextEvent.date)}
                            </span>
                            <ArrowRight className="size-4 shrink-0" />
                        </Link>
                    )}

                    <h1
                        {...langOf(hero.headline)}
                        className="mt-7 text-[40px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-6xl lg:text-[72px] [&[lang=si]]:leading-[1.3] [&[lang=si]]:tracking-normal"
                    >
                        {lead && (
                            <>
                                {lead}
                                <br />
                            </>
                        )}
                        <em className="text-gold-400 not-italic">{last}</em>
                    </h1>

                    <p className="text-gold-400 mt-[18px] flex items-center gap-3.5 text-[15px] font-semibold tracking-[0.2em] before:h-px before:w-10 before:bg-current/60 before:content-[''] after:h-px after:w-10 after:bg-current/60 after:content-['']">
                        {anniversary.from.slice(0, 4)} — {anniversary.to.slice(0, 4)}
                    </p>

                    <p {...langOf(hero.text)} className="mt-5 max-w-[560px] text-[17px] text-white/85 sm:text-[19px]">
                        {hero.text}
                    </p>

                    <div className="mt-[34px] flex flex-wrap gap-3">
                        <Button asChild variant="gold" size="brandLg" className="max-sm:w-full">
                            <Link href="/register">
                                Become a member
                                <ArrowRight />
                            </Link>
                        </Button>
                        <Button asChild variant="glass" size="brandLg" className="max-sm:w-full">
                            <Link href="/projects">Explore school projects</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {hero.caption && (
                <p className="absolute right-6 bottom-[132px] hidden items-center gap-2 text-[12.5px] text-white/70 md:flex">
                    <MapPin className="size-3.5" />
                    {hero.caption}
                </p>
            )}
        </section>
    );
}
