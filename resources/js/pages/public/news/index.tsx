import PageHeader from '@/components/public/page-header';
import { formatDate, newsTypeLabel, Section } from '@/components/public/section';
import PublicLayout from '@/layouts/public-layout';
import { type NewsItem } from '@/types/public';
import { Link } from '@inertiajs/react';

export default function News({ items }: { items: NewsItem[] }) {
    return (
        <PublicLayout title="News and events">
            <PageHeader title="News and events" crumbs={[{ title: 'News and events' }]} />
            <Section className="max-w-5xl space-y-8">
                {items.map((n) => (
                    <article
                        key={n.slug}
                        className={`group relative grid overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md ${n.image ? 'md:grid-cols-[16rem_1fr]' : ''}`}
                    >
                        {n.image && <img src={n.image} alt="" className="h-full max-h-96 w-full object-cover object-top" loading="lazy" />}
                        <div className="p-6">
                            <p className="text-maroon-700 text-xs font-semibold tracking-wider uppercase">{newsTypeLabel[n.type]}</p>
                            <h2 className="text-maroon-900 mt-1 text-xl font-bold">
                                <Link href={`/news/${n.slug}`} className="group-hover:underline after:absolute after:inset-0">
                                    {n.title}
                                </Link>
                            </h2>
                            {n.date && <p className="mt-1 text-sm text-neutral-500">{formatDate(n.date)}</p>}
                            {n.deadline && <p className="mt-1 text-sm text-neutral-500">Closing date: {formatDate(n.deadline)}</p>}
                            <p className="mt-4 line-clamp-3 text-neutral-800">{n.body.join(' ')}</p>
                            <p className="text-maroon-800 mt-3 text-sm font-semibold">Read more →</p>
                        </div>
                    </article>
                ))}
            </Section>
        </PublicLayout>
    );
}
