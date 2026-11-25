import BankDetailsCard from '@/components/public/bank-details';
import PageHeader from '@/components/public/page-header';
import { Section } from '@/components/public/section';
import PublicLayout from '@/layouts/public-layout';
import { type BankDetails, type Project } from '@/types/public';
import { Link } from '@inertiajs/react';

const projectStatus: Record<NonNullable<Project['status']>, string> = {
    planned: 'Planned',
    ongoing: 'Ongoing',
    completed: 'Completed',
};

export default function ProjectShow({ project, others, bank }: { project: Project; others: Project[]; bank: BankDetails }) {
    const body = project.body ?? [];
    const gallery = project.gallery ?? [];

    return (
        <PublicLayout title={project.title}>
            <PageHeader
                title={project.title}
                subtitle={project.summary ?? undefined}
                crumbs={[{ title: 'Projects', href: '/projects' }, { title: project.title }]}
            />
            <Section className="grid gap-10 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                    <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                        <img src={project.image} alt="" className="aspect-video w-full object-cover" />
                        <div className="space-y-4 p-6 sm:p-8">
                            {(project.status || project.estimate) && (
                                <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                                    {project.status && (
                                        <div>
                                            <dt className="text-neutral-500">Status</dt>
                                            <dd className="text-maroon-900 font-semibold">{projectStatus[project.status]}</dd>
                                        </div>
                                    )}
                                    {project.estimate && (
                                        <div>
                                            <dt className="text-neutral-500">Estimated cost</dt>
                                            <dd className="text-maroon-900 font-semibold">{project.estimate}</dd>
                                        </div>
                                    )}
                                </dl>
                            )}
                            {body.length > 0 ? (
                                <div className="space-y-3 leading-relaxed text-neutral-800">
                                    {body.map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            ) : (
                                !project.summary && (
                                    <p className="text-neutral-700">
                                        Details of this project will be added soon. To contribute, use the official bank account shown here.
                                    </p>
                                )
                            )}
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

                    <Link href="/projects" className="text-maroon-800 inline-block text-sm font-semibold hover:underline">
                        ← All projects
                    </Link>
                </div>

                <aside className="space-y-6 self-start lg:sticky lg:top-24">
                    <BankDetailsCard bank={bank} />
                    {others.length > 0 && (
                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                            <h2 className="text-maroon-900 font-semibold">Other projects</h2>
                            <ul className="mt-4 space-y-4">
                                {others.map((p) => (
                                    <li key={p.slug}>
                                        <Link href={`/projects/${p.slug}`} className="group flex items-center gap-3">
                                            <img src={p.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" loading="lazy" />
                                            <span className="text-maroon-800 text-sm font-medium group-hover:underline">{p.title}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>
            </Section>
        </PublicLayout>
    );
}
