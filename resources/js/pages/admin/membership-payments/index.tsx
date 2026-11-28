import FlashMessage from '@/components/domain/flash-message';
import FormErrorSummary, { focusFirstError } from '@/components/domain/form-error-summary';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { lkr } from '@/lib/money';
import { type BreadcrumbItem } from '@/types';
import { categoryLabel, type MembershipPlan } from '@/types/membership';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, Phone, Search } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Membership payments', href: '/admin/membership/payments' }];
const selectClass = 'border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm';

interface Awaiting {
    id: string;
    name: string;
    number: string | null;
    category: string;
    fee_cents: number | null;
    phone: string | null;
    email: string | null;
    batch: number | null;
    approved_on: string | null;
}

interface Payment {
    id: string;
    member: string;
    number: string | null;
    category: string;
    amount_cents: number;
    channel: string;
    received_on: string;
    reference: string | null;
    recorded_by: string | null;
}

interface Props {
    awaiting: Awaiting[];
    recent: Payment[];
    search: string;
    channels: { value: string; label: string }[];
    plans: MembershipPlan[];
}

function formatDate(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const today = () => new Date().toISOString().slice(0, 10);

function RecordPayment({
    member,
    channels,
    currentFee,
    onClose,
}: {
    member: Awaiting;
    channels: Props['channels'];
    currentFee: number | null;
    onClose: () => void;
}) {
    const suggested = member.fee_cents ?? currentFee;
    const form = useForm({
        amount: suggested ? String(suggested / 100) : '',
        channel: 'cash',
        received_on: today(),
        reference: '',
        note: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('admin.membership.payments.store', member.id), { preserveScroll: true, onSuccess: onClose, onError: focusFirstError });
    };

    return (
        <Dialog open onOpenChange={(o) => !o && !form.processing && onClose()}>
            <DialogContent>
                <form onSubmit={submit} className="space-y-4" noValidate>
                    <DialogHeader>
                        <DialogTitle>Record a collected fee</DialogTitle>
                        <DialogDescription>
                            {member.name}
                            {member.number && ` · ${member.number}`} · {categoryLabel[member.category] ?? member.category} membership. Saving makes
                            the membership active.
                        </DialogDescription>
                    </DialogHeader>
                    <FormErrorSummary errors={form.errors} action="recorded" />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount received (LKR)</Label>
                            <Input
                                id="amount"
                                inputMode="decimal"
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', e.target.value.replace(/[^\d.]/g, ''))}
                                autoFocus
                            />
                            {suggested !== null && (
                                <p className="text-muted-foreground text-xs">
                                    {member.fee_cents !== null ? 'Agreed fee' : `Current ${categoryLabel[member.category]?.toLowerCase() ?? ''} fee`}:{' '}
                                    {lkr(suggested)}
                                </p>
                            )}
                            <InputError message={form.errors.amount} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="channel">How it was paid</Label>
                            <select
                                id="channel"
                                className={selectClass}
                                value={form.data.channel}
                                onChange={(e) => form.setData('channel', e.target.value)}
                            >
                                {channels.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.channel} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="received_on">Date received</Label>
                            <Input
                                id="received_on"
                                type="date"
                                max={today()}
                                value={form.data.received_on}
                                onChange={(e) => form.setData('received_on', e.target.value)}
                            />
                            <InputError message={form.errors.received_on} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reference">Reference</Label>
                            <Input
                                id="reference"
                                placeholder="Receipt no., slip or cheque no."
                                value={form.data.reference}
                                onChange={(e) => form.setData('reference', e.target.value)}
                            />
                            <InputError message={form.errors.reference} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="note">Note</Label>
                        <Input
                            id="note"
                            placeholder="e.g. collected by the secretary at the AGM"
                            value={form.data.note}
                            onChange={(e) => form.setData('note', e.target.value)}
                        />
                        <InputError message={form.errors.note} />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={onClose} disabled={form.processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                            Record payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function MembershipPayments({ awaiting, recent, search, channels, plans }: Props) {
    const [selected, setSelected] = useState<Awaiting | null>(null);
    const [query, setQuery] = useState(search);
    const channelLabel = (v: string) => channels.find((c) => c.value === v)?.label ?? v;

    const find: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('admin.membership.payments.index'), query.trim() ? { search: query.trim() } : {}, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Membership payments" />
            <div className="space-y-8 p-4">
                <HeadingSmall
                    title="Membership fees to collect"
                    description="Approved members waiting for their fee. An office bearer contacts them and collects it by cash, bank transfer or cheque; record it here to make the membership active."
                />
                <FlashMessage />

                <form onSubmit={find} className="flex max-w-xl gap-2" role="search">
                    <Label htmlFor="search" className="sr-only">
                        Find a member
                    </Label>
                    <Input
                        id="search"
                        placeholder="Find any approved member by name or number (e.g. M-120)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button type="submit" variant="outline">
                        <Search className="size-4" />
                        Find
                    </Button>
                </form>

                <section className="space-y-3">
                    <h2 className="text-sm font-semibold">
                        {search ? `Approved members matching "${search}"` : 'New members waiting for their first payment'}
                        <span className="text-muted-foreground font-normal"> · {awaiting.length}</span>
                    </h2>
                    {awaiting.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            {search ? 'No approved member matches.' : 'Nobody is waiting. New approvals appear here.'}
                        </p>
                    ) : (
                        <div className="admin-panel overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">Member</th>
                                        <th className="px-4 py-2 font-medium">Contact</th>
                                        <th className="px-4 py-2 font-medium">Plan</th>
                                        <th className="px-4 py-2 text-right font-medium">Fee</th>
                                        <th className="px-4 py-2 font-medium">Approved</th>
                                        <th className="px-4 py-2" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {awaiting.map((m) => (
                                        <tr key={m.id} className="border-t">
                                            <td className="px-4 py-2">
                                                <span className="block font-medium">{m.name}</span>
                                                <span className="text-muted-foreground block">
                                                    {m.number ?? 'No number'}
                                                    {m.batch && ` · A/L ${m.batch}`}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                {m.phone && (
                                                    <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:underline">
                                                        <Phone className="size-3.5" />
                                                        {m.phone}
                                                    </a>
                                                )}
                                                {m.email && <span className="text-muted-foreground block">{m.email}</span>}
                                            </td>
                                            <td className="px-4 py-2">{categoryLabel[m.category] ?? m.category}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{m.fee_cents !== null ? lkr(m.fee_cents) : '–'}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{m.approved_on ? formatDate(m.approved_on) : '–'}</td>
                                            <td className="px-4 py-2 text-right">
                                                <Button size="sm" onClick={() => setSelected(m)}>
                                                    Record payment
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="space-y-3">
                    <h2 className="text-sm font-semibold">Recently recorded</h2>
                    {recent.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No membership fees recorded yet.</p>
                    ) : (
                        <div className="admin-panel overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 text-left">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">Received</th>
                                        <th className="px-4 py-2 font-medium">Member</th>
                                        <th className="px-4 py-2 font-medium">Plan</th>
                                        <th className="px-4 py-2 font-medium">How</th>
                                        <th className="px-4 py-2 font-medium">Reference</th>
                                        <th className="px-4 py-2 text-right font-medium">Amount</th>
                                        <th className="px-4 py-2 font-medium">Recorded by</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recent.map((p) => (
                                        <tr key={p.id} className="border-t">
                                            <td className="px-4 py-2 whitespace-nowrap">{formatDate(p.received_on)}</td>
                                            <td className="px-4 py-2">
                                                {p.member}
                                                {p.number && <span className="text-muted-foreground"> · {p.number}</span>}
                                            </td>
                                            <td className="px-4 py-2">{categoryLabel[p.category] ?? p.category}</td>
                                            <td className="px-4 py-2">{channelLabel(p.channel)}</td>
                                            <td className="px-4 py-2">{p.reference ?? '–'}</td>
                                            <td className="px-4 py-2 text-right tabular-nums">{lkr(p.amount_cents)}</td>
                                            <td className="px-4 py-2">{p.recorded_by ?? '–'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {selected && (
                    <RecordPayment
                        member={selected}
                        channels={channels}
                        currentFee={plans.find((p) => p.category === selected.category)?.feeCents ?? null}
                        onClose={() => setSelected(null)}
                    />
                )}
            </div>
        </AppLayout>
    );
}
