import ConfirmDialog from '@/components/confirm-dialog';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { type Data, type FieldDef } from '@/types/content';
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, ImagePlus, LoaderCircle, Plus, Trash2, X } from 'lucide-react';
import { useId, useState } from 'react';

export type Path = (string | number)[];

interface Ctx {
    get: (path: Path) => unknown;
    set: (path: Path, value: unknown) => void;
    error: (path: Path) => string | undefined;
    errorsUnder: (path: Path) => number;
    disabled: boolean;
}

/** An empty value for a field, used when adding a repeater item. */
export function blankFor(field: FieldDef): unknown {
    switch (field.type) {
        case 'boolean':
            return false;
        case 'list':
        case 'repeater':
            return [];
        case 'group':
            return Object.fromEntries((field.fields ?? []).map((f) => [f.name, blankFor(f)]));
        case 'select':
            return Object.keys(field.options ?? {})[0] ?? null;
        default:
            return null;
    }
}

const textarea =
    'border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs focus-visible:ring-1 focus-visible:outline-none md:text-sm';

function FieldLabel({ field, htmlFor }: { field: FieldDef; htmlFor?: string }) {
    return (
        <Label htmlFor={htmlFor}>
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
        </Label>
    );
}

function csrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

function ImageField({ field, path, ctx }: { field: FieldDef; path: Path; ctx: Ctx }) {
    const id = useId();
    const value = ctx.get(path) as string | null;
    const [busy, setBusy] = useState(false);
    const [uploadError, setUploadError] = useState<string>();

    const upload = async (file: File) => {
        setBusy(true);
        setUploadError(undefined);
        const body = new FormData();
        body.append('image', file);
        try {
            const res = await fetch(route('admin.content.upload'), {
                method: 'POST',
                body,
                headers: { 'X-XSRF-TOKEN': csrfToken(), Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.errors?.image?.[0] ?? json.message ?? 'Upload failed');
            ctx.set(path, json.path);
        } catch (e) {
            setUploadError(e instanceof Error ? e.message : 'Upload failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="grid gap-2">
            <FieldLabel field={field} htmlFor={id} />
            <div className="flex items-center gap-4">
                {value ? (
                    <img src={value} alt="" className="h-20 w-32 rounded-md object-cover ring-1 ring-black/10" />
                ) : (
                    <div className="bg-muted text-muted-foreground flex h-20 w-32 items-center justify-center rounded-md text-xs">No image</div>
                )}
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" asChild disabled={busy || ctx.disabled}>
                        <label htmlFor={id} className="cursor-pointer">
                            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                            {value ? 'Replace' : 'Upload'}
                        </label>
                    </Button>
                    <input
                        id={id}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) upload(file);
                            e.target.value = '';
                        }}
                    />
                    {value && !field.required && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => ctx.set(path, null)}>
                            <X className="size-4" /> Remove
                        </Button>
                    )}
                </div>
            </div>
            <p className="text-muted-foreground text-xs">JPG, PNG or WebP, up to 5 MB.</p>
            <InputError message={uploadError ?? ctx.error(path)} />
        </div>
    );
}

function ListField({ field, path, ctx }: { field: FieldDef; path: Path; ctx: Ctx }) {
    const items = (ctx.get(path) as string[] | null) ?? [];
    const set = (next: string[]) => ctx.set(path, next);

    return (
        <fieldset className="grid min-w-0 gap-2">
            <legend className="mb-2 text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive"> *</span>}
            </legend>
            {items.map((text, i) => (
                <div key={i} className="flex gap-2">
                    <textarea
                        aria-label={`${field.label} ${i + 1}`}
                        className={textarea}
                        value={text}
                        disabled={ctx.disabled}
                        onChange={(e) => set(items.map((t, j) => (j === i ? e.target.value : t)))}
                    />
                    <ItemControls
                        index={i}
                        count={items.length}
                        onMove={(to) => set(move(items, i, to))}
                        onRemove={() => set(items.filter((_, j) => j !== i))}
                    />
                </div>
            ))}
            <InputError message={ctx.error(path)} />
            <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => set([...items, ''])}>
                <Plus className="size-4" /> Add paragraph
            </Button>
        </fieldset>
    );
}

function move<T>(items: T[], from: number, to: number): T[] {
    if (to < 0 || to >= items.length) return items;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

function ItemControls({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
    const [confirming, setConfirming] = useState(false);

    return (
        <div className="flex shrink-0 gap-1">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={index === 0}
                onClick={() => onMove(index - 1)}
                aria-label="Move up"
            >
                <ArrowUp className="size-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={index === count - 1}
                onClick={() => onMove(index + 1)}
                aria-label="Move down"
            >
                <ArrowDown className="size-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive size-8"
                onClick={() => setConfirming(true)}
                aria-label="Remove"
            >
                <Trash2 className="size-4" />
            </Button>
            <ConfirmDialog
                open={confirming}
                onOpenChange={setConfirming}
                title="Remove this item?"
                description="It is taken out of the form. The website does not change until you press Save changes."
                confirmLabel="Remove"
                tone="danger"
                onConfirm={() => {
                    setConfirming(false);
                    onRemove();
                }}
            />
        </div>
    );
}

/** A short title for a collapsed repeater item: its first two filled text fields. */
function summary(field: FieldDef, item: Data): string {
    const parts = (field.fields ?? [])
        .map((f) => item?.[f.name])
        .filter((v): v is string => typeof v === 'string' && v.trim() !== '')
        .slice(0, 2);
    const text = parts.join(' · ');
    return text.length > 90 ? text.slice(0, 90) + '…' : text;
}

function RepeaterField({ field, path, ctx }: { field: FieldDef; path: Path; ctx: Ctx }) {
    const items = (ctx.get(path) as Data[] | null) ?? [];
    const lastIndex = items.length - 1;
    const highlight = field.highlight_last && lastIndex >= 0 ? field.highlight_last : null;
    const [open, setOpen] = useState<Record<number, boolean>>(() =>
        items.length <= 3 ? Object.fromEntries(items.map((_, i) => [i, true])) : highlight ? { [lastIndex]: true } : {},
    );
    const itemLabel = field.item_label ?? 'Item';
    // "Principal No. 29" from the item's own number field; an item without one (e.g. a gap period) says "No number".
    const itemTitle = (item: Data, i: number) => {
        if (!field.number_field) return `${itemLabel} ${i + 1}`;
        const n = item?.[field.number_field];
        return n === null || n === undefined || n === '' ? 'No number' : `${itemLabel} No. ${n}`;
    };
    const set = (next: Data[]) => ctx.set(path, next);
    // Stored order never changes; newest_first only flips what the editor shows (and where "Add" sits).
    const reversed = field.newest_first === true;
    const order = items.map((_, i) => (reversed ? lastIndex - i : i));
    const toStorage = (shown: number) => (reversed ? lastIndex - shown : shown);

    const addButton = (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="justify-self-start"
            onClick={() => {
                set([...items, blankFor({ ...field, type: 'group' }) as Data]);
                setOpen({ ...open, [items.length]: true });
            }}
        >
            <Plus className="size-4" /> Add {itemLabel.toLowerCase()}
        </Button>
    );

    return (
        <fieldset className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3">
            <legend className="mb-2 text-sm font-semibold">
                {field.label} <span className="text-muted-foreground font-normal">({items.length})</span>
            </legend>
            {reversed && addButton}
            {order.map((i, shown) => {
                const item = items[i];
                const isOpen = open[i] ?? false;
                const errors = ctx.errorsUnder([...path, i]);
                const highlighted = highlight !== null && i === lastIndex;
                return (
                    <div
                        key={i}
                        className={cn(
                            'min-w-0 rounded-lg border bg-white dark:bg-neutral-900',
                            highlighted && 'border-primary ring-primary/20 ring-2',
                            errors > 0 && 'border-destructive',
                        )}
                    >
                        <div className="flex items-center gap-2 px-3 py-2">
                            <button
                                type="button"
                                className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
                                onClick={() => setOpen({ ...open, [i]: !isOpen })}
                                aria-expanded={isOpen}
                            >
                                {isOpen ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                                <span className="shrink-0 font-medium whitespace-nowrap">{itemTitle(item, i)}</span>
                                {highlighted && (
                                    <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                                        {highlight}
                                    </span>
                                )}
                                <span className="text-muted-foreground truncate">{summary(field, item)}</span>
                                {errors > 0 && <span className="text-destructive shrink-0 text-xs">{errors} to fix</span>}
                            </button>
                            <ItemControls
                                index={shown}
                                count={items.length}
                                onMove={(toShown) => {
                                    const to = toStorage(toShown);
                                    set(move(items, i, to));
                                    setOpen({ ...open, [i]: open[to] ?? false, [to]: isOpen });
                                }}
                                onRemove={() => {
                                    set(items.filter((_, j) => j !== i));
                                    setOpen({});
                                }}
                            />
                        </div>
                        {isOpen && (
                            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 border-t p-4">
                                {(field.fields ?? []).map((f) => (
                                    <Field key={f.name} field={f} path={[...path, i, f.name]} ctx={ctx} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
            <InputError message={ctx.error(path)} />
            {!reversed && addButton}
        </fieldset>
    );
}

export function Field({ field, path, ctx }: { field: FieldDef; path: Path; ctx: Ctx }) {
    const id = useId();
    const value = ctx.get(path);

    switch (field.type) {
        case 'group':
            return (
                <fieldset className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 rounded-lg border border-dashed p-4">
                    <legend className="px-1 text-sm font-semibold">{field.label}</legend>
                    {(field.fields ?? []).map((f) => (
                        <Field key={f.name} field={f} path={[...path, f.name]} ctx={ctx} />
                    ))}
                </fieldset>
            );
        case 'repeater':
            return <RepeaterField field={field} path={path} ctx={ctx} />;
        case 'list':
            return <ListField field={field} path={path} ctx={ctx} />;
        case 'image':
            return <ImageField field={field} path={path} ctx={ctx} />;
        case 'boolean':
            return (
                <div className="flex items-center gap-2">
                    <Checkbox id={id} checked={Boolean(value)} onCheckedChange={(c) => ctx.set(path, c === true)} disabled={ctx.disabled} />
                    <Label htmlFor={id}>{field.label}</Label>
                </div>
            );
        case 'select':
            return (
                <div className="grid gap-2">
                    <FieldLabel field={field} htmlFor={id} />
                    <select
                        id={id}
                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs"
                        value={(value as string) ?? ''}
                        disabled={ctx.disabled}
                        onChange={(e) => ctx.set(path, e.target.value === '' ? null : e.target.value)}
                    >
                        {!field.required && <option value="">Not set</option>}
                        {Object.entries(field.options ?? {}).map(([k, label]) => (
                            <option key={k} value={k}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <InputError message={ctx.error(path)} />
                </div>
            );
        case 'textarea':
            return (
                <div className="grid gap-2">
                    <FieldLabel field={field} htmlFor={id} />
                    <textarea
                        id={id}
                        className={textarea}
                        value={(value as string) ?? ''}
                        disabled={ctx.disabled}
                        onChange={(e) => ctx.set(path, e.target.value)}
                    />
                    <InputError message={ctx.error(path)} />
                </div>
            );
        default:
            return (
                <div className="grid gap-2">
                    <FieldLabel field={field} htmlFor={id} />
                    <Input
                        id={id}
                        type={field.type === 'text' ? 'text' : field.type}
                        value={value === null || value === undefined ? '' : String(value)}
                        disabled={ctx.disabled}
                        onChange={(e) =>
                            ctx.set(path, field.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)
                        }
                    />
                    <InputError message={ctx.error(path)} />
                </div>
            );
    }
}

/** Immutably sets a value deep inside nested objects and arrays. */
export function setIn(target: unknown, path: Path, value: unknown): unknown {
    if (path.length === 0) return value;
    const [head, ...rest] = path;
    if (Array.isArray(target)) {
        const next = [...target];
        next[head as number] = setIn(next[head as number], rest, value);
        return next;
    }
    const obj = (target ?? {}) as Data;
    return { ...obj, [head]: setIn(obj[head as string], rest, value) };
}

export function getIn(target: unknown, path: Path): unknown {
    return path.reduce<unknown>((acc, key) => (acc == null ? undefined : (acc as Record<string | number, unknown>)[key]), target);
}
