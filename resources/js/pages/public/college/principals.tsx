import PageHeader from '@/components/public/page-header';
import { formatDate, Section } from '@/components/public/section';
import PublicLayout from '@/layouts/public-layout';

interface Principal {
    number: number | null;
    from: string | null;
    name: string | null;
    note: string | null;
}

interface Props {
    content: {
        title: string;
        subtitle: string;
        principals: Principal[];
        message: { text: string; name: string; role: string };
    };
}

export default function Principals({ content }: Props) {
    return (
        <PublicLayout title="Principals">
            <PageHeader title="Principals of the college" subtitle={content.subtitle} crumbs={[{ title: 'College' }, { title: 'Principals' }]} />

            <Section className="grid gap-10 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <h2 className="text-maroon-950 mb-6 text-xl font-bold">{content.title}</h2>
                    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                        <table className="w-full text-left">
                            <thead className="bg-maroon-900 text-sm text-white">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        #
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        From
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Name
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {content.principals.map((p, i) =>
                                    p.name === null ? (
                                        <tr key={i} className="bg-neutral-50 text-neutral-600 italic">
                                            <td className="px-4 py-3">–</td>
                                            <td className="px-4 py-3">{p.from}</td>
                                            <td className="px-4 py-3">{p.note}</td>
                                        </tr>
                                    ) : (
                                        <tr key={i} className={p.note?.includes('වත්මන්') ? 'bg-gold-300/20' : undefined}>
                                            <td className="px-4 py-3 text-neutral-500">{p.number}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{p.from ? formatDate(p.from) : '–'}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">{p.name}</span>
                                                {p.note && <span className="ml-2 text-sm text-neutral-600">({p.note})</span>}
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <aside className="bg-maroon-900 self-start rounded-xl p-6 text-white lg:sticky lg:top-24">
                    <p className="leading-relaxed">{content.message.text}</p>
                    <p className="text-gold-300 mt-4 font-semibold">{content.message.name}</p>
                    <p className="text-sm text-white/80">{content.message.role}</p>
                </aside>
            </Section>
        </PublicLayout>
    );
}
