import ConfirmDialog from '@/components/confirm-dialog';
import FlashMessage from '@/components/domain/flash-message';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatStamp } from '@/lib/content-stamp';
import { type ContentTypeDef, type Stamp } from '@/types/content';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Entry {
    id: string;
    columns: Record<string, string | null>;
    updated: Stamp | null;
}

export default function ContentList({ type, entries }: { type: ContentTypeDef; entries: Entry[] }) {
    const columns = type.columns ?? [];
    const label = (name: string) => type.fields.find((f) => f.name === name)?.label.replace(/\s*\(.*\)$/, '') ?? name;

    const [toDelete, setToDelete] = useState<Entry | null>(null);
    const [deleting, setDeleting] = useState(false);
    const remove = () => {
        if (!toDelete) return;
        setDeleting(true);
        router.delete(`/admin/content/${type.key}/${toDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setToDelete(null),
            onFinish: () => setDeleting(false),
        });
    };
    const move = (entry: Entry, direction: 'up' | 'down') =>
        router.post(`/admin/content/${type.key}/${entry.id}/move`, { direction }, { preserveScroll: true });

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Website content', href: '/admin/content' },
                { title: type.label, href: `/admin/content/${type.key}` },
            ]}
        >
            <Head title={type.label} />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <HeadingSmall title={type.label} description={type.description ?? undefined} />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href={type.url} target="_blank" rel="noreferrer">
                                View on website <ExternalLink className="size-4" />
                            </a>
                        </Button>
                        <Button asChild>
                            <Link href={`/admin/content/${type.key}/create`}>
                                <Plus className="size-4" /> Add new
                            </Link>
                        </Button>
                    </div>
                </div>
                <FlashMessage />
                <p className="text-muted-foreground text-sm">The website shows these in this order. Use the arrows to reorder.</p>
                <div className="admin-panel overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                {columns.map((c) => (
                                    <th key={c} className="px-4 py-2 font-medium">
                                        {label(c)}
                                    </th>
                                ))}
                                <th className="px-4 py-2 font-medium">Last edited</th>
                                <th className="px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + 2} className="text-muted-foreground px-4 py-6 text-center">
                                        Nothing here yet.
                                    </td>
                                </tr>
                            )}
                            {entries.map((e, i) => (
                                <tr key={e.id} className="border-t">
                                    {columns.map((c, ci) => (
                                        <td key={c} className="px-4 py-2">
                                            {ci === 0 ? (
                                                <Link href={`/admin/content/${type.key}/${e.id}/edit`} className="font-medium hover:underline">
                                                    {e.columns[c] || '(untitled)'}
                                                </Link>
                                            ) : (
                                                (e.columns[c] ?? '–')
                                            )}
                                        </td>
                                    ))}
                                    <td className="text-muted-foreground px-4 py-2 text-xs">{formatStamp(e.updated)}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                disabled={i === 0}
                                                onClick={() => move(e, 'up')}
                                                aria-label="Move up"
                                            >
                                                <ArrowUp className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                disabled={i === entries.length - 1}
                                                onClick={() => move(e, 'down')}
                                                aria-label="Move down"
                                            >
                                                <ArrowDown className="size-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/content/${type.key}/${e.id}/edit`}>
                                                    <Pencil className="size-4" /> Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive size-8"
                                                onClick={() => setToDelete(e)}
                                                aria-label="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ConfirmDialog
                    open={toDelete !== null}
                    onOpenChange={(open) => !open && setToDelete(null)}
                    title="Delete from the website?"
                    description={
                        <>
                            <span className="font-medium">{toDelete ? toDelete.columns[columns[0]] || '(untitled)' : ''}</span> will be removed from
                            the website straight away. This cannot be undone.
                        </>
                    }
                    confirmLabel="Delete"
                    tone="danger"
                    processing={deleting}
                    onConfirm={remove}
                />
            </div>
        </AppLayout>
    );
}
