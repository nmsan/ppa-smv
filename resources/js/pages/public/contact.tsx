import BankDetailsCard from '@/components/public/bank-details';
import PageHeader from '@/components/public/page-header';
import { Section } from '@/components/public/section';
import PublicLayout from '@/layouts/public-layout';
import { type BankDetails, type SiteInfo } from '@/types/public';
import { usePage } from '@inertiajs/react';
import { Facebook, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

function waLink(phone: string) {
    return `https://wa.me/94${phone.replace(/\D/g, '').replace(/^0/, '')}`;
}

export default function Contact({ bank }: { bank: BankDetails }) {
    const { site } = usePage<{ site: SiteInfo }>().props;

    return (
        <PublicLayout title="Contact">
            <PageHeader title="Contact us" crumbs={[{ title: 'Contact' }]} />
            <Section>
                <div className="grid gap-6 md:grid-cols-3">
                    {site.contacts.map((c) => (
                        <div key={c.role} className="rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
                            <img
                                src={c.image}
                                alt={c.name}
                                className="ring-gold-300 mx-auto size-28 rounded-full object-cover ring-4"
                                loading="lazy"
                            />
                            <p className="text-maroon-700 mt-4 text-sm font-semibold tracking-wide uppercase">{c.role}</p>
                            <p className="mt-1 font-semibold">{c.name}</p>
                            <p className="text-sm text-neutral-600">{c.note}</p>
                            <div className="mt-4 flex justify-center gap-2">
                                <a
                                    href={`tel:${c.phone.replace(/\s/g, '')}`}
                                    className="bg-maroon-800 hover:bg-maroon-700 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-white"
                                >
                                    <Phone className="size-4" /> {c.phone}
                                </a>
                                {c.whatsapp && (
                                    <a
                                        href={waLink(c.phone)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center rounded-full bg-green-600 p-2 text-white hover:bg-green-700"
                                        aria-label={`WhatsApp ${c.name}`}
                                    >
                                        <MessageCircle className="size-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                        <h2 className="text-maroon-900 font-semibold">The association</h2>
                        <ul className="mt-4 space-y-4">
                            <li className="flex gap-3">
                                <MapPin className="text-maroon-700 size-5 shrink-0" />
                                {site.address}
                            </li>
                            <li className="flex gap-3">
                                <Mail className="text-maroon-700 size-5 shrink-0" />
                                <a href={`mailto:${site.email}`} className="text-maroon-800 hover:underline">
                                    {site.email}
                                </a>
                            </li>
                            <li className="flex gap-3">
                                <Facebook className="text-maroon-700 size-5 shrink-0" />
                                <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="text-maroon-800 hover:underline">
                                    facebook.com/PPASENANAYAKE
                                </a>
                            </li>
                        </ul>
                    </div>
                    <BankDetailsCard bank={bank} />
                </div>
            </Section>
        </PublicLayout>
    );
}
