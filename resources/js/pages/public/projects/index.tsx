import BankDetailsCard from '@/components/public/bank-details';
import PageHeader from '@/components/public/page-header';
import { Section } from '@/components/public/section';
import PublicLayout from '@/layouts/public-layout';
import { type BankDetails, type Project } from '@/types/public';
import { Link } from '@inertiajs/react';

export default function Projects({ projects, bank }: { projects: Project[]; bank: BankDetails }) {
    return (
        <PublicLayout title="Projects">
            <PageHeader
                title="School projects"
                subtitle="Projects the association is carrying out for Senanayake Central College."
                crumbs={[{ title: 'Projects' }]}
            />
            <Section className="grid gap-10 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                    {projects.map((p) => (
                        <article
                            key={p.slug}
                            className="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
                        >
                            <div className="overflow-hidden">
                                <img
                                    src={p.image}
                                    alt=""
                                    className="aspect-video w-full object-cover transition group-hover:scale-105"
                                    loading="lazy"
                                />
                            </div>
                            <div className="p-6">
                                <h2 className="text-maroon-900 text-xl font-bold">
                                    <Link href={`/projects/${p.slug}`} className="group-hover:underline after:absolute after:inset-0">
                                        {p.title}
                                    </Link>
                                </h2>
                                {p.summary && <p className="mt-2 text-neutral-700">{p.summary}</p>}
                                <p className="text-maroon-800 mt-3 text-sm font-semibold">View project →</p>
                            </div>
                        </article>
                    ))}
                </div>
                <aside className="space-y-6 self-start lg:sticky lg:top-24">
                    <div id="give" className="scroll-mt-24">
                        <BankDetailsCard bank={bank} />
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                        <h2 className="text-maroon-900 font-semibold">Thank you to our supporters</h2>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li>
                                <Link href="/projects/sponsors" className="text-maroon-800 hover:underline">
                                    Main sponsors →
                                </Link>
                            </li>
                            <li>
                                <Link href="/projects/donors" className="text-maroon-800 hover:underline">
                                    Best donors →
                                </Link>
                            </li>
                        </ul>
                    </div>
                </aside>
            </Section>
        </PublicLayout>
    );
}
