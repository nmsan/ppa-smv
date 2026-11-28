import FlashMessage from '@/components/domain/flash-message';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import { formatStamp } from '@/lib/content-stamp';
import { type Stamp } from '@/types/content';
import { Head, Link } from '@inertiajs/react';
import { ExternalLink, FileText, List } from 'lucide-react';

interface TypeCard {
    key: string;
    label: string;
    description: string | null;
    kind: 'single' | 'collection';
    url: string;
    count: number | null;
    updated: Stamp | null;
}

export default function ContentIndex({ types }: { types: TypeCard[] }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Website content', href: '/admin/content' }]}>
            <Head title="Website content" />
            <div className="space-y-6 p-4">
                <HeadingSmall
                    title="Website content"
                    description="Choose what to update. Changes appear on the public website as soon as you save."
                />
                <FlashMessage />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {types.map((t) => (
                        <div key={t.key} className="admin-panel flex flex-col rounded-xl border p-5">
                            <div className="flex items-start gap-3">
                                {t.kind === 'collection' ? (
                                    <List className="text-muted-foreground mt-0.5 size-5" />
                                ) : (
                                    <FileText className="text-muted-foreground mt-0.5 size-5" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <Link href={`/admin/content/${t.key}`} className="font-semibold hover:underline">
                                        {t.label}
                                    </Link>
                                    {t.count !== null && <span className="text-muted-foreground ml-2 text-sm">({t.count})</span>}
                                    {t.description && <p className="text-muted-foreground mt-1 text-sm">{t.description}</p>}
                                </div>
                            </div>
                            <div className="text-muted-foreground mt-auto flex items-center justify-between gap-2 pt-4 text-xs">
                                <span>{formatStamp(t.updated)}</span>
                                <a href={t.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                                    View <ExternalLink className="size-3" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
