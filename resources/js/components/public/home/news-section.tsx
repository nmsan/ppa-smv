import { formatDate, newsTypeLabel, SectionTitle } from '@/components/public/section';
import { langOf } from '@/lib/lang';
import { cn } from '@/lib/utils';
import { type NewsItem } from '@/types/public';
import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Megaphone } from 'lucide-react';

const badge: Record<NewsItem['type'], string> = {
    news: 'bg-maroon-50 text-maroon-700',
    notice: 'bg-gold-100 text-gold-text',
    event: 'bg-maroon-50 text-maroon-700',
};

/**
 * Magazine grid: one featured story and up to two compact items. With a single
 * post the feature takes the full width, so the block never looks half empty.
 */
export default function NewsSection({ items }: { items: NewsItem[] }) {
    if (items.length === 0) return null;
    const [featured, ...side] = items;

    return (
        <section className="bg-neutral-100">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
                <SectionTitle
                    kicker="From the college"
                    action={
                        <Link href="/news" className="text-maroon-700 inline-flex items-center gap-1.5 font-semibold hover:underline">
                            All news
                            <ArrowRight className="size-4" />
                        </Link>
                    }
                >
                    News and highlights
                </SectionTitle>

                <div className={cn('grid gap-6', side.length > 0 && 'lg:grid-cols-[1.25fr_1fr]')}>
                    <Link
                        href={`/news/${featured.slug}`}
                        className="group bg-maroon-900 relative isolate flex min-h-[420px] items-end overflow-hidden rounded-[22px] text-white lg:min-h-[520px]"
                    >
                        {featured.image && (
                            <img
                                src={featured.image}
                                alt=""
                                className="absolute inset-0 -z-20 size-full object-cover object-[center_25%] transition duration-700 group-hover:scale-[1.03]"
                                loading="lazy"
                            />
                        )}
                        <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent from-30% to-[rgb(30_6_10/0.92)]" />
                        <div className="p-6 sm:p-8">
                            <span className="bg-gold-500 text-gold-ink rounded-full px-2.5 py-0.5 text-[13px] font-semibold">
                                {newsTypeLabel[featured.type]}
                            </span>
                            <h3
                                {...langOf(featured.title)}
                                className="mt-3.5 mb-2.5 text-2xl leading-tight font-bold sm:text-[32px] [&[lang=si]]:leading-snug"
                            >
                                {featured.title}
                            </h3>
                            {featured.body[0] && (
                                <p {...langOf(featured.body[0])} className="line-clamp-3 max-w-xl text-white/85">
                                    {featured.body[0]}
                                </p>
                            )}
                            {featured.date && (
                                <p className="mt-3.5 flex items-center gap-2 text-sm text-white/75">
                                    <CalendarDays className="size-4" />
                                    {formatDate(featured.date)}
                                </p>
                            )}
                        </div>
                    </Link>

                    {side.length > 0 && (
                        <div className={cn('grid gap-6', side.length > 1 && 'lg:grid-rows-2')}>
                            {side.slice(0, 2).map((n) => (
                                <Link
                                    key={n.slug}
                                    href={`/news/${n.slug}`}
                                    className={cn(
                                        'grid overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-sm transition hover:shadow-[var(--shadow-card)]',
                                        // A lone side story stacks vertically so it fills the column instead of leaving a tall empty panel.
                                        side.length > 1 ? 'sm:grid-cols-[42%_1fr]' : 'grid-rows-[auto_1fr]',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'bg-maroon-50',
                                            side.length > 1 ? 'aspect-video sm:aspect-auto sm:min-h-[200px]' : n.image ? 'aspect-video' : 'h-28',
                                        )}
                                    >
                                        {n.image ? (
                                            <img src={n.image} alt="" className="size-full object-cover" loading="lazy" />
                                        ) : (
                                            <span className="text-maroon-700/70 grid size-full place-items-center">
                                                <Megaphone className="size-10" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2.5 p-5 sm:p-6">
                                        <span className={cn('self-start rounded-full px-2.5 py-0.5 text-[13px] font-semibold', badge[n.type])}>
                                            {newsTypeLabel[n.type]}
                                        </span>
                                        <h3 {...langOf(n.title)} className="text-lg leading-snug font-bold text-neutral-900">
                                            {n.title}
                                        </h3>
                                        {n.body[0] && (
                                            <p {...langOf(n.body[0])} className="line-clamp-3 text-[15px] text-neutral-600">
                                                {n.body[0]}
                                            </p>
                                        )}
                                        {(n.date || n.deadline) && (
                                            <p className="mt-auto text-sm text-neutral-500">
                                                {n.date ? formatDate(n.date) : `Closes ${formatDate(n.deadline!)}`}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
