import { Kicker } from '@/components/public/section';
import { langOf } from '@/lib/lang';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

interface Props {
    message: { text: string; name: string; role: string; image?: string | null };
}

/** "මොරිස් අත්තනායක" → "මො.අ.": the first written character (grapheme) of each word. */
function initials(name: string): string {
    const first = (word: string) => {
        if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
            const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word)[Symbol.iterator]().next();
            return seg.done ? '' : seg.value.segment;
        }
        return word.charAt(0);
    };
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .map((w) => `${first(w)}.`)
        .join('');
}

/** First two sentences are the pull quote; the rest follows in body size, as in the design. */
function splitQuote(text: string): [string, string] {
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) ?? [text];
    if (sentences.length <= 2) return [text, ''];
    return [sentences.slice(0, 2).join('').trim(), sentences.slice(2).join('').trim()];
}

/** Editorial two-column message from the former principal / president. */
export default function LeadershipMessage({ message }: Props) {
    const [quote, rest] = splitQuote(message.text);

    return (
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[0.75fr_1.25fr] md:gap-[72px] md:py-24">
            {/* The author's photo when one is uploaded in the editor; their initials stand in until then. */}
            <div
                aria-hidden={!message.image}
                className="relative mx-auto grid aspect-square w-full max-w-[360px] place-items-center overflow-hidden rounded-[28px] bg-[radial-gradient(120%_90%_at_30%_20%,var(--color-maroon-600),var(--color-maroon-900))] shadow-[var(--shadow-lift)] md:aspect-[4/5] md:max-w-none"
            >
                {message.image ? (
                    <img src={message.image} alt={message.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
                ) : (
                    <span {...langOf(message.name)} className="text-gold-400 text-[clamp(72px,9vw,120px)] leading-none font-bold">
                        {initials(message.name)}
                    </span>
                )}
                <span className="border-gold-400/35 pointer-events-none absolute inset-3.5 rounded-[20px] border" />
                <img src="/images/brand/logo.png" alt="" className="absolute bottom-[22px] left-[22px] size-[54px] rounded-full" />
            </div>

            <figure>
                <Kicker as="h2">A message to our past pupils</Kicker>
                <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden className="text-gold-500 mt-5 mb-3 size-12">
                    <path d="M10 36c-3.3 0-6-2.9-6-7 0-8.6 5.4-15.4 13.4-19l1.6 2.6C13.9 15.4 11 19.2 10.6 23c.5-.2 1.1-.3 1.8-.3 3.6 0 6.2 2.6 6.2 6.4 0 4-3.3 6.9-8.6 6.9Zm21 0c-3.3 0-6-2.9-6-7 0-8.6 5.4-15.4 13.4-19L40 12.6C34.9 15.4 32 19.2 31.6 23c.5-.2 1.1-.3 1.8-.3 3.6 0 6.2 2.6 6.2 6.4 0 4-3.3 6.9-8.6 6.9Z" />
                </svg>
                <blockquote {...langOf(message.text)}>
                    <p className="text-[19px] font-medium text-neutral-800 sm:text-[22px] [&:is([lang=si]_*)]:leading-[1.95]">{quote}</p>
                    {rest && <p className="mt-4 text-base text-neutral-500">{rest}</p>}
                </blockquote>
                <figcaption className="mt-8 flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-6">
                    <span aria-hidden className="from-gold-500 to-maroon-700 w-1 self-stretch rounded-full bg-gradient-to-b" />
                    <span>
                        <span {...langOf(message.name)} className="block text-[19px] font-bold text-neutral-900">
                            {message.name}
                        </span>
                        <span {...langOf(message.role)} className="block text-[15px] text-neutral-500">
                            {message.role}
                        </span>
                    </span>
                    <Link
                        href="/college/principals"
                        className="text-maroon-700 ml-auto inline-flex items-center gap-1.5 font-semibold hover:underline"
                    >
                        Our principals
                        <ArrowRight className="size-4" />
                    </Link>
                </figcaption>
            </figure>
        </section>
    );
}
