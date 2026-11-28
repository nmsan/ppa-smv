import EditMemberDialog, { AddMemberDialog } from '@/components/admin/edit-member-dialog';
import FilterSelect from '@/components/admin/filter-select';
import FlashMessage from '@/components/domain/flash-message';
import HeadingSmall from '@/components/heading-small';
import PersonAvatar from '@/components/person-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { categoryLabel } from '@/types/membership';
import { Head, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, LoaderCircle, Pencil, Phone, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Members', href: '/admin/members' }];

interface MemberRow {
    id: string;
    name: string;
    avatar: string | null;
    number: string | null;
    email: string | null;
    phone: string | null;
    batch: number | null;
    country: string | null;
    category: string;
    status: string;
    source: string;
    joined_on: string | null;
}

interface Filters {
    search: string;
    status: string;
    category: string;
    batch: string;
    source: string;
    country: string;
    sort: 'name' | 'number' | 'batch' | 'joined';
    direction: 'asc' | 'desc';
    per_page: number;
}

interface Props {
    members: {
        data: MemberRow[];
        total: number;
        page: number;
        per_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
    };
    options: { batches: number[]; countries: string[] };
    lockedBatch: number | null;
    filters: Filters;
    statuses: string[];
    categories: string[];
    canEdit: boolean;
}

const statusLabel: Record<string, string> = {
    applied: 'Applied',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    expiring: 'Expiring',
    lapsed: 'Lapsed',
};

const statusTone: Record<string, string> = {
    applied: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
    approved: 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
    active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
    expiring: 'bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100',
    lapsed: 'bg-muted text-muted-foreground',
    rejected: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
};

function formatDate(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Only the filters that differ from the defaults go into the address, so links stay short and shareable. */
function toQuery(f: Filters, page = 1): Record<string, string | number> {
    const q: Record<string, string | number> = {};
    (['search', 'status', 'category', 'batch', 'source', 'country'] as const).forEach((k) => {
        if (f[k]) q[k] = f[k];
    });
    if (f.sort !== 'number') q.sort = f.sort;
    if (f.direction !== 'asc') q.direction = f.direction;
    if (f.per_page !== 25) q.per_page = f.per_page;
    if (page > 1) q.page = page;
    return q;
}

/** Page numbers to show around the current page, with gaps marked as null. */
function pageWindow(current: number, last: number): (number | null)[] {
    const pages = new Set([1, last, current - 1, current, current + 1].filter((p) => p >= 1 && p <= last));
    const sorted = [...pages].sort((a, b) => a - b);
    return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]));
}

export default function Members({ members, options, lockedBatch, filters, statuses, categories, canEdit }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const firstRender = useRef(true);

    const visit = (next: Partial<Filters>, page = 1) => {
        router.get(route('admin.members.index'), toQuery({ ...filters, ...next }, page), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['members', 'filters'],
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

    // Search as the user types, after a short pause.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        if (search.trim() === filters.search) return;
        const t = setTimeout(() => visit({ search: search.trim() }), 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const sortBy = (sort: Filters['sort']) =>
        visit({ sort, direction: filters.sort === sort && filters.direction === 'asc' ? 'desc' : 'asc' }, members.page);

    const activeFilters = (['status', 'category', 'batch', 'source', 'country'] as const).filter(
        (k) => filters[k] && !(k === 'batch' && lockedBatch),
    );
    const hasAnyFilter = activeFilters.length > 0 || filters.search !== '';

    const clearAll = () => {
        setSearch('');
        visit({ search: '', status: '', category: '', batch: '', source: '', country: '' });
    };

    const SortHeader = ({ label, col, className }: { label: string; col: Filters['sort']; className?: string }) => {
        const active = filters.sort === col;
        const Icon = filters.direction === 'asc' ? ArrowUp : ArrowDown;
        return (
            <th
                className={cn('px-4 py-2 font-medium', className)}
                aria-sort={active ? (filters.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
                <button type="button" onClick={() => sortBy(col)} className="hover:text-foreground inline-flex items-center gap-1">
                    {label}
                    {active && <Icon className="size-3.5" />}
                </button>
            </th>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Members" />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <HeadingSmall
                        title="Members"
                        description={
                            lockedBatch
                                ? `Everyone in the ${lockedBatch} A/L batch: register records, applicants and active members.`
                                : 'Everyone in the register: imported records, applicants and active members.'
                        }
                    />
                    {canEdit && (
                        <Button onClick={() => setAdding(true)}>
                            <Plus className="size-4" />
                            Add member
                        </Button>
                    )}
                </div>
                <FlashMessage />

                <div className="admin-panel space-y-3 rounded-xl border p-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                        <div className="relative flex-1 xl:min-w-80" role="search">
                            <Label htmlFor="member-search" className="sr-only">
                                Search members
                            </Label>
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                id="member-search"
                                type="search"
                                className="bg-background h-10 rounded-full pr-9 pl-9"
                                placeholder="Search by name, number (M-120), email or phone"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && visit({ search: search.trim() })}
                            />
                            {loading && (
                                <LoaderCircle className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <SlidersHorizontal className="text-muted-foreground mr-0.5 size-4" aria-hidden />
                            <FilterSelect
                                label="Status"
                                allLabel="All statuses"
                                value={filters.status}
                                options={statuses.map((s) => ({ value: s, label: statusLabel[s] ?? s }))}
                                onChange={(status) => visit({ status })}
                            />
                            <FilterSelect
                                label="Membership"
                                allLabel="All types"
                                value={filters.category}
                                options={categories.map((c) => ({ value: c, label: categoryLabel[c] ?? c }))}
                                onChange={(category) => visit({ category })}
                            />
                            <FilterSelect
                                label="Batch"
                                allLabel="All batches"
                                value={filters.batch}
                                options={options.batches.map((b) => ({ value: String(b), label: String(b) }))}
                                onChange={(batch) => visit({ batch })}
                                disabled={lockedBatch !== null}
                            />
                            <FilterSelect
                                label="Country"
                                allLabel="All countries"
                                value={filters.country}
                                options={options.countries.map((c) => ({ value: c, label: c }))}
                                onChange={(country) => visit({ country })}
                            />
                            <FilterSelect
                                label="Source"
                                allLabel="Anywhere"
                                value={filters.source}
                                options={[
                                    { value: 'register', label: 'Old register' },
                                    { value: 'application', label: 'Online application' },
                                    { value: 'secretary', label: 'Added by the secretary' },
                                ]}
                                onChange={(source) => visit({ source })}
                            />
                        </div>
                    </div>

                    <div className="flex min-h-7 flex-wrap items-center gap-2 border-t pt-3 text-sm">
                        <span className="text-muted-foreground" aria-live="polite">
                            {members.total === 0 ? (
                                'No members found'
                            ) : (
                                <>
                                    Showing{' '}
                                    <span className="text-foreground font-medium tabular-nums">
                                        {members.from}–{members.to}
                                    </span>{' '}
                                    of <span className="text-foreground font-medium tabular-nums">{members.total.toLocaleString()}</span> member
                                    {members.total === 1 ? '' : 's'}
                                </>
                            )}
                        </span>
                        {hasAnyFilter && (
                            <Button variant="ghost" size="sm" className="text-muted-foreground ml-auto h-7 rounded-full" onClick={clearAll}>
                                <X className="size-3.5" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>

                {members.data.length === 0 ? (
                    <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
                        {hasAnyFilter ? 'No member matches these filters. Try a different search or clear the filters.' : 'There are no members yet.'}
                    </div>
                ) : (
                    <div className={cn('admin-panel relative overflow-x-auto rounded-lg border transition-opacity', loading && 'opacity-60')}>
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground text-left">
                                <tr>
                                    <SortHeader label="Number" col="number" />
                                    <SortHeader label="Name" col="name" />
                                    <th className="px-4 py-2 font-medium">Contact</th>
                                    <SortHeader label="Batch" col="batch" />
                                    <th className="px-4 py-2 font-medium">Membership</th>
                                    <th className="px-4 py-2 font-medium">Status</th>
                                    <SortHeader label="Joined" col="joined" />
                                    {canEdit && (
                                        <th className="px-4 py-2">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {members.data.map((m) => (
                                    <tr key={m.id} className="hover:bg-muted/30 border-t">
                                        <td className="px-4 py-2 whitespace-nowrap tabular-nums">
                                            {m.number ?? <span className="text-muted-foreground">–</span>}
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-3">
                                                <PersonAvatar name={m.name} src={m.avatar} />
                                                <div className="min-w-0">
                                                    <span className="block font-medium">{m.name}</span>
                                                    {m.country && m.country !== 'Sri Lanka' && (
                                                        <span className="text-muted-foreground block text-xs">{m.country}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            {m.phone && (
                                                <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 whitespace-nowrap hover:underline">
                                                    <Phone className="size-3.5" />
                                                    {m.phone}
                                                </a>
                                            )}
                                            {m.email && <span className="text-muted-foreground block">{m.email}</span>}
                                            {!m.phone && !m.email && <span className="text-muted-foreground">–</span>}
                                        </td>
                                        <td className="px-4 py-2 tabular-nums">{m.batch ?? '–'}</td>
                                        <td className="px-4 py-2">{categoryLabel[m.category] ?? m.category}</td>
                                        <td className="px-4 py-2">
                                            <Badge className={cn('border-transparent font-medium', statusTone[m.status])}>
                                                {statusLabel[m.status] ?? m.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{m.joined_on ? formatDate(m.joined_on) : '–'}</td>
                                        {canEdit && (
                                            <td className="px-4 py-2 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => setEditing(m.id)} aria-label={`Edit ${m.name}`}>
                                                    <Pencil className="size-3.5" />
                                                    Edit
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {members.total > 0 && (
                    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <span>Rows per page</span>
                            <Select value={String(filters.per_page)} onValueChange={(v) => visit({ per_page: Number(v) })}>
                                <SelectTrigger className="h-8 w-[72px]" aria-label="Rows per page">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[25, 50, 100].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="hidden sm:inline">
                                · Page {members.page} of {members.last_page}
                            </span>
                        </div>
                        <div className={cn('flex items-center gap-1', members.last_page <= 1 && 'hidden')}>
                            <Button variant="outline" size="sm" disabled={members.page <= 1 || loading} onClick={() => visit({}, members.page - 1)}>
                                <ChevronLeft className="size-4" />
                                <span className="sr-only sm:not-sr-only">Previous</span>
                            </Button>
                            {pageWindow(members.page, members.last_page).map((p, i) =>
                                p === null ? (
                                    <span key={`gap-${i}`} className="text-muted-foreground px-1">
                                        …
                                    </span>
                                ) : (
                                    <Button
                                        key={p}
                                        variant={p === members.page ? 'default' : 'ghost'}
                                        size="sm"
                                        className="min-w-9"
                                        aria-current={p === members.page ? 'page' : undefined}
                                        disabled={loading}
                                        onClick={() => visit({}, p)}
                                    >
                                        {p}
                                    </Button>
                                ),
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={members.page >= members.last_page || loading}
                                onClick={() => visit({}, members.page + 1)}
                            >
                                <span className="sr-only sm:not-sr-only">Next</span>
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </nav>
                )}
                {adding && <AddMemberDialog categories={categories} onClose={() => setAdding(false)} />}
                {editing && <EditMemberDialog memberId={editing} categories={categories} onClose={() => setEditing(null)} />}
            </div>
        </AppLayout>
    );
}
