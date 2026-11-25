import { Field, getIn, setIn, type Path } from '@/components/admin/content-fields';
import FlashMessage from '@/components/domain/flash-message';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatStamp } from '@/lib/content-stamp';
import { type ContentTypeDef, type Data, type Stamp } from '@/types/content';
import { Head, useForm } from '@inertiajs/react';
import { ExternalLink, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    type: ContentTypeDef;
    entry: { id: string; data: Data; updated: Stamp | null } | null;
    blank: Data;
    action: string;
    method: 'post' | 'put';
}

export default function ContentEdit({ type, entry, blank, action, method }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nested content of any shape
    const form = useForm<Record<string, any>>({ data: { ...blank, ...(entry?.data ?? {}) } });
    const errors = form.errors as Record<string, string>;
    const errorCount = Object.keys(errors).length;
    const isNew = type.kind === 'collection' && !entry;

    useEffect(() => {
        const warn = (e: BeforeUnloadEvent) => {
            if (form.isDirty) e.preventDefault();
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [form.isDirty]);

    const ctx = {
        get: (path: Path) => getIn(form.data.data, path),
        set: (path: Path, value: unknown) =>
            form.setData((prev: Record<string, unknown>) => setIn(prev, ['data', ...path], value) as Record<string, unknown>),
        error: (path: Path) => errors[['data', ...path].join('.')],
        errorsUnder: (path: Path) => {
            const prefix = ['data', ...path].join('.');
            return Object.keys(errors).filter((k) => k === prefix || k.startsWith(prefix + '.')).length;
        },
        disabled: form.processing,
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form[method](action, { preserveScroll: true, onSuccess: () => form.setDefaults() });
    };

    const breadcrumbs = [
        { title: 'Website content', href: '/admin/content' },
        { title: type.label, href: `/admin/content/${type.key}` },
        ...(type.kind === 'collection' ? [{ title: isNew ? 'Add new' : 'Edit', href: '#' }] : []),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${isNew ? 'Add' : 'Edit'}: ${type.label}`} />
            <form onSubmit={submit} className="w-full max-w-4xl min-w-0 space-y-6 p-4 pb-28">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <HeadingSmall title={isNew ? `Add to ${type.label.toLowerCase()}` : type.label} description={type.description ?? undefined} />
                    <Button variant="outline" asChild>
                        <a href={type.url} target="_blank" rel="noreferrer">
                            View on website <ExternalLink className="size-4" />
                        </a>
                    </Button>
                </div>
                {entry && <p className="text-muted-foreground text-xs">{formatStamp(entry.updated)}</p>}
                <FlashMessage />
                {errorCount > 0 && (
                    <div role="alert" className="border-destructive/40 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">
                        {errorCount === 1 ? 'One field needs' : `${errorCount} fields need`} fixing before this can be saved. Items with problems are
                        marked in red.
                    </div>
                )}

                <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
                    {type.fields.map((f) => (
                        <Field key={f.name} field={f} path={[f.name]} ctx={ctx} />
                    ))}
                </div>

                <div className="bg-background/95 fixed inset-x-0 bottom-0 z-20 border-t px-4 py-3 backdrop-blur md:left-[var(--sidebar-width,16rem)]">
                    <div className="flex max-w-4xl items-center gap-3">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                            {isNew ? 'Add to website' : 'Save changes'}
                        </Button>
                        {form.isDirty ? (
                            <span className="text-muted-foreground text-sm">You have unsaved changes</span>
                        ) : (
                            form.recentlySuccessful && <span className="text-sm text-green-700">Saved</span>
                        )}
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
