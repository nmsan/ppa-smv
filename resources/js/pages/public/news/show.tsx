import PageHeader from '@/components/public/page-header';
import { formatDate, newsTypeLabel, Section } from '@/components/public/section';
import ShareButtons, { type ShareMeta } from '@/components/public/share-buttons';
import PublicLayout from '@/layouts/public-layout';
import { type NewsItem } from '@/types/public';
import { Link } from '@inertiajs/react';

export default function NewsShow({ item, others, share }: { item: NewsItem; others: NewsItem[]; share: ShareMeta }) {
    const gallery = item.gallery ?? [];

    return (
        <PublicLayout title={item.title}>
            <PageHeader title={item.title} crumbs={[{ title: 'News and events', href: '/news' }, { title: item.title }]} />
            <Section className="grid gap-10 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                    <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                        {/* Posters and notices are often tall, so show the whole image rather than cropping it. */}
                        {item.image && <img src={item.image} alt="" className="mx-auto max-h-[48rem] w-full bg-neutral-100 object-contain" />}
                        <div className="p-6 sm:p-8">
                            <p className="text-maroon-700 text-xs font-semibold tracking-wider uppercase">{newsTypeLabel[item.type]}</p>
                            {item.date && (
                                <p className="mt-1 text-sm text-neutral-500">
                                    {item.type === 'event' ? 'Event date: ' : ''}
                                    {formatDate(item.date)}
                                </p>
                            )}
                            {item.deadline && <p className="mt-1 text-sm text-neutral-500">Closing date: {formatDate(item.deadline)}</p>}
                            <div className="mt-5 space-y-3 leading-relaxed text-neutral-800">
                                {item.body.map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                            {item.type === 'event' && (
                                <Link href="/contact" className="text-maroon-800 mt-6 inline-block font-semibold hover:underline">
                                    Contact the committee for details →
                                </Link>
                            )}
                            <ShareButtons share={share} className="mt-8 border-t border-neutral-100 pt-6" />
                        </div>
                    </article>

                    {gallery.length > 0 && (
                        <div>
                            <h2 className="text-maroon-900 mb-4 text-xl font-bold">Photos</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {gallery.map((g, i) => (
                                    <figure key={i} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                                        <img src={g.image} alt={g.caption ?? ''} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                                        {g.caption && <figcaption className="p-3 text-sm text-neutral-600">{g.caption}</figcaption>}
                                    </figure>
                                ))}
                            </div>
                        </div>
                    )}

                    <Link href="/news" className="text-maroon-800 inline-block text-sm font-semibold hover:underline">
                        ← All news and events
                    </Link>
                </div>

                {others.length > 0 && (
                    <aside className="self-start rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-24">
                        <h2 className="text-maroon-900 font-semibold">More news and events</h2>
                        <ul className="mt-4 space-y-4">
                            {others.map((n) => (
                                <li key={n.slug}>
                                    <Link href={`/news/${n.slug}`} className="group flex items-center gap-3">
                                        {n.image ? (
                                            <img src={n.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" loading="lazy" />
                                        ) : (
                                            <span className="bg-maroon-50 text-maroon-800 flex size-14 shrink-0 items-center justify-center rounded-lg text-xs font-semibold">
                                                {newsTypeLabel[n.type]}
                                            </span>
                                        )}
                                        <span>
                                            <span className="text-maroon-800 line-clamp-2 text-sm font-medium group-hover:underline">{n.title}</span>
                                            {n.date && <span className="mt-0.5 block text-xs text-neutral-500">{formatDate(n.date)}</span>}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </aside>
                )}
            </Section>
        </PublicLayout>
    );
}
