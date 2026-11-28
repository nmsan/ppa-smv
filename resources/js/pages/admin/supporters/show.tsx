import ConfirmDialog from '@/components/confirm-dialog';
import FlashMessage from '@/components/domain/flash-message';
import FormErrorSummary, { focusFirstError } from '@/components/domain/form-error-summary';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import PersonAvatar from '@/components/person-avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { lkr } from '@/lib/money';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { BadgeCheck, Ban, Link2, LoaderCircle } from 'lucide-react';
import { type FormEventHandler, type ReactNode, useState } from 'react';

interface Line {
    id: string;
    type: 'sponsorship' | 'donation';
    event: string | null;
    cents: number;
    received_on: string | null;
    reference: string | null;
    note: string | null;
    recorded_by: string | null;
    voided: { at: string; by: string | null; reason: string } | null;
}

interface Account {
    supporter: {
        id: string;
        name: string;
        kind: 'business' | 'individual';
        contact_name: string | null;
        phone: string | null;
        email: string | null;
        public_note: string | null;
        notes: string | null;
        show_publicly: boolean;
    };
    member: { number: string; name: string; avatar: string | null; batch: number | null; status: string } | null;
    total_cents: number;
    sponsorship_cents: number;
    donation_cents: number;
    by_event: { name: string; cents: number; count: number }[];
    contributions: Line[];
}

interface EventOption {
    id: string;
    name: string;
}

const selectClass = 'border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm';

function formatDate(iso: string | null) {
    return iso
        ? new Date(iso.length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function RecordContribution({ account, events, today }: { account: Account; events: EventOption[]; today: string }) {
    const form = useForm({
        type: account.supporter.kind === 'individual' ? 'donation' : 'sponsorship',
        amount: '',
        received_on: today,
        event_id: events[0]?.id ?? '',
        new_event: '',
        reference: '',
        note: '',
    });
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('admin.supporters.contribute', account.supporter.id), {
            preserveScroll: true,
            onError: focusFirstError,
            onSuccess: () => form.reset('amount', 'reference', 'note', 'new_event'),
        });
    };
    const invalid = (k: keyof typeof form.data) => (form.errors[k] ? true : undefined);

    return (
        <form onSubmit={submit} className="admin-panel space-y-4 rounded-xl border p-5" noValidate>
            <h2 className="font-semibold">Record a contribution</h2>
            <FormErrorSummary errors={form.errors} action="recorded" />
            <div className="flex gap-2" role="radiogroup" aria-label="Type">
                {(['donation', 'sponsorship'] as const).map((t) => (
                    <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={form.data.type === t}
                        onClick={() => form.setData('type', t)}
                        className={cn(
                            'rounded-full px-4 py-1.5 text-sm font-medium',
                            form.data.type === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border',
                        )}
                    >
                        {t === 'donation' ? 'Donation' : 'Sponsorship'}
                    </button>
                ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <Field id="amount" label="Amount (LKR)" error={form.errors.amount}>
                    <Input
                        id="amount"
                        inputMode="decimal"
                        placeholder="25,000"
                        value={form.data.amount}
                        onChange={(e) => form.setData('amount', e.target.value)}
                        aria-invalid={invalid('amount')}
                    />
                </Field>
                <Field id="received_on" label="Date received" error={form.errors.received_on}>
                    <Input
                        id="received_on"
                        type="date"
                        max={today}
                        value={form.data.received_on}
                        onChange={(e) => form.setData('received_on', e.target.value)}
                        aria-invalid={invalid('received_on')}
                    />
                </Field>
                <Field id="event_id" label="For event or project" error={form.errors.event_id}>
                    <select
                        id="event_id"
                        className={selectClass}
                        value={form.data.event_id}
                        onChange={(e) => form.setData('event_id', e.target.value)}
                    >
                        {events.map((e) => (
                            <option key={e.id} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                        <option value="">General {form.data.type} (no event)</option>
                        <option value="new">+ A new event or project…</option>
                    </select>
                </Field>
                {form.data.event_id === 'new' ? (
                    <Field id="new_event" label="New event or project name" error={form.errors.new_event}>
                        <Input
                            id="new_event"
                            value={form.data.new_event}
                            onChange={(e) => form.setData('new_event', e.target.value)}
                            placeholder="e.g. Swimming pool renovation"
                            aria-invalid={invalid('new_event')}
                        />
                    </Field>
                ) : (
                    <Field id="reference" label="Receipt or cheque number" error={form.errors.reference}>
                        <Input id="reference" value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} />
                    </Field>
                )}
            </div>
            {form.data.event_id === 'new' && (
                <Field id="reference2" label="Receipt or cheque number" error={form.errors.reference}>
                    <Input id="reference2" value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} />
                </Field>
            )}
            <Field id="note" label="Note (optional)" error={form.errors.note}>
                <Input id="note" value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} />
            </Field>
            <Button type="submit" disabled={form.processing}>
                {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                Record {form.data.type}
            </Button>
        </form>
    );
}

function MemberLink({ account }: { account: Account }) {
    const form = useForm({ membership_number: '' });
    const { member, supporter } = account;
    const save = (number: string | null) => {
        form.transform(() => ({ membership_number: number }));
        form.put(route('admin.supporters.link', supporter.id), { preserveScroll: true, onSuccess: () => form.reset() });
    };

    if (supporter.kind === 'business') return null;

    return (
        <div className="admin-panel rounded-xl border p-5">
            <h2 className="flex items-center gap-2 font-semibold">
                <Link2 className="size-4" /> Membership
            </h2>
            {member ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm">
                        <BadgeCheck className="size-4 text-green-700" />
                        <span>
                            Linked to <span className="font-medium">{member.name}</span> ({member.number}
                            {member.batch && `, A/L ${member.batch}`}). Their batch shows on the public pages and their giving on their My membership
                            page.
                        </span>
                    </p>
                    <Button variant="outline" size="sm" onClick={() => save(null)} disabled={form.processing}>
                        Unlink
                    </Button>
                </div>
            ) : (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        save(form.data.membership_number);
                    }}
                    className="mt-3 space-y-2"
                    noValidate
                >
                    <p className="text-muted-foreground text-sm">Is this supporter a PPA member? Link them by membership number.</p>
                    <div className="flex flex-wrap gap-2">
                        <Input
                            className="max-w-40"
                            placeholder="M-123"
                            value={form.data.membership_number}
                            onChange={(e) => form.setData('membership_number', e.target.value)}
                            aria-label="Membership number"
                        />
                        <Button type="submit" variant="outline" disabled={form.processing || !form.data.membership_number.trim()}>
                            Link to member
                        </Button>
                    </div>
                    <InputError message={form.errors.membership_number ?? (form.errors as Record<string, string>).form} />
                </form>
            )}
        </div>
    );
}

function VoidButton({ line }: { line: Line }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ reason: '' });

    return (
        <>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setOpen(true)}>
                <Ban className="size-4" /> Void
            </Button>
            <ConfirmDialog
                open={open}
                onOpenChange={setOpen}
                title="Void this contribution?"
                description="It stays in the account history, marked as voided, and stops counting towards any total. If the amount was wrong, record the correct one afterwards."
                confirmLabel="Void contribution"
                tone="danger"
                processing={form.processing}
                onConfirm={() =>
                    form.post(route('admin.supporters.contributions.void', line.id), { preserveScroll: true, onSuccess: () => setOpen(false) })
                }
            >
                <div className="space-y-2">
                    <p className="text-sm">
                        <span className="font-semibold">{lkr(line.cents, true)}</span> {line.type} {line.event ? `for ${line.event}` : ''}
                    </p>
                    <Label htmlFor={`reason-${line.id}`}>Reason</Label>
                    <Input
                        id={`reason-${line.id}`}
                        value={form.data.reason}
                        onChange={(e) => form.setData('reason', e.target.value)}
                        placeholder="e.g. Entered twice"
                        autoFocus
                    />
                    <InputError message={form.errors.reason ?? (form.errors as Record<string, string>).form} />
                </div>
            </ConfirmDialog>
        </>
    );
}

function SupporterDetails({ account }: { account: Account }) {
    const { supporter, member } = account;
    const form = useForm({
        name: supporter.name,
        kind: supporter.kind,
        contact_name: supporter.contact_name ?? '',
        phone: supporter.phone ?? '',
        email: supporter.email ?? '',
        public_note: supporter.public_note ?? '',
        notes: supporter.notes ?? '',
        show_publicly: supporter.show_publicly,
    });
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(route('admin.supporters.update', supporter.id), { preserveScroll: true, onError: focusFirstError });
    };

    return (
        <form onSubmit={submit} className="admin-panel space-y-4 rounded-xl border p-5" noValidate>
            <h2 className="font-semibold">Supporter details</h2>
            <FormErrorSummary errors={form.errors} action="saved" />
            <div className="grid gap-4 sm:grid-cols-2">
                <Field id="s-name" label="Name as shown publicly" error={form.errors.name}>
                    <Input
                        id="s-name"
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        aria-invalid={form.errors.name ? true : undefined}
                    />
                </Field>
                <Field id="s-kind" label="Type">
                    <select
                        id="s-kind"
                        className={selectClass}
                        value={form.data.kind}
                        onChange={(e) => form.setData('kind', e.target.value as 'business' | 'individual')}
                        disabled={!!member}
                    >
                        <option value="business">Business or organisation</option>
                        <option value="individual">Individual</option>
                    </select>
                </Field>
                <Field
                    id="s-note"
                    label={member ? 'Public note (their batch shows automatically)' : 'Public note, e.g. A/L 1996'}
                    error={form.errors.public_note}
                >
                    <Input
                        id="s-note"
                        value={form.data.public_note}
                        onChange={(e) => form.setData('public_note', e.target.value)}
                        disabled={!!member}
                    />
                </Field>
                <Field id="s-contact" label="Contact person" error={form.errors.contact_name}>
                    <Input id="s-contact" value={form.data.contact_name} onChange={(e) => form.setData('contact_name', e.target.value)} />
                </Field>
                <Field id="s-phone" label="Phone" error={form.errors.phone}>
                    <Input id="s-phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                </Field>
                <Field id="s-email" label="Email" error={form.errors.email}>
                    <Input id="s-email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                </Field>
            </div>
            <Field id="s-notes" label="Notes (only the committee sees these)" error={form.errors.notes}>
                <Input id="s-notes" value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
            </Field>
            <div className="flex items-center gap-2">
                <Checkbox id="s-public" checked={form.data.show_publicly} onCheckedChange={(c) => form.setData('show_publicly', c === true)} />
                <Label htmlFor="s-public">Show on the public sponsors and donors pages</Label>
            </div>
            <Button type="submit" variant="outline" disabled={form.processing}>
                Save details
            </Button>
        </form>
    );
}

export default function SupporterAccount({ account, events, today }: { account: Account; events: EventOption[]; today: string }) {
    const { supporter } = account;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Supporters', href: '/admin/supporters' },
                { title: supporter.name, href: `/admin/supporters/${supporter.id}` },
            ]}
        >
            <Head title={supporter.name} />
            <div className="max-w-5xl space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <PersonAvatar
                        name={supporter.name}
                        src={account.member?.avatar}
                        organisation={supporter.kind !== 'individual'}
                        className="size-14 [&>span]:text-base"
                    />
                    <HeadingSmall
                        title={supporter.name}
                        description={supporter.kind === 'individual' ? 'Individual supporter' : 'Business or organisation'}
                    />
                </div>
                <FlashMessage />

                <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
                    <div className="admin-panel space-y-3 rounded-xl border p-5">
                        <div>
                            <p className="text-muted-foreground text-sm">Total given</p>
                            <p className="mt-1 text-3xl font-semibold whitespace-nowrap tabular-nums">{lkr(account.total_cents)}</p>
                        </div>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                            <dt className="text-muted-foreground">Donations</dt>
                            <dd className="text-right whitespace-nowrap tabular-nums">{lkr(account.donation_cents)}</dd>
                            <dt className="text-muted-foreground">Sponsorships</dt>
                            <dd className="text-right whitespace-nowrap tabular-nums">{lkr(account.sponsorship_cents)}</dd>
                        </dl>
                        <p className="text-muted-foreground text-xs">Voided lines are not counted.</p>
                    </div>
                    <div className="admin-panel rounded-xl border p-5">
                        <p className="text-muted-foreground mb-3 text-sm">By event or project</p>
                        {account.by_event.length === 0 ? (
                            <p className="text-sm">Nothing recorded yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {account.by_event.map((e) => (
                                    <li key={e.name}>
                                        <div className="flex justify-between gap-3 text-sm">
                                            <span>
                                                {e.name}{' '}
                                                <span className="text-muted-foreground">· {e.count === 1 ? '1 payment' : `${e.count} payments`}</span>
                                            </span>
                                            <span className="whitespace-nowrap tabular-nums">{lkr(e.cents)}</span>
                                        </div>
                                        <div className="bg-muted mt-1 h-2 rounded-full">
                                            <div
                                                className="h-2 rounded-full bg-[var(--viz-bar)]"
                                                style={{ width: `${(e.cents / Math.max(1, account.total_cents)) * 100}%` }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <MemberLink account={account} />
                <RecordContribution account={account} events={events} today={today} />

                <section className="space-y-3">
                    <h2 className="font-semibold">Account history</h2>
                    <div className="admin-panel overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Received</th>
                                    <th className="px-4 py-2 font-medium">Type</th>
                                    <th className="px-4 py-2 font-medium">Event or project</th>
                                    <th className="px-4 py-2 font-medium">Reference</th>
                                    <th className="px-4 py-2 font-medium">Recorded by</th>
                                    <th className="px-4 py-2 text-right font-medium">Amount</th>
                                    <th className="px-4 py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {account.contributions.map((c) => (
                                    <tr key={c.id} className={cn('border-t align-top', c.voided && 'text-muted-foreground bg-muted/30')}>
                                        <td className="px-4 py-2 whitespace-nowrap">{formatDate(c.received_on) ?? 'Date not recorded'}</td>
                                        <td className="px-4 py-2 capitalize">{c.type}</td>
                                        <td className="px-4 py-2">
                                            {c.event ?? `General ${c.type}`}
                                            {c.note && <p className="text-muted-foreground text-xs">{c.note}</p>}
                                            {c.voided && (
                                                <p className="text-destructive text-xs">
                                                    Voided {formatDate(c.voided.at)}
                                                    {c.voided.by && ` by ${c.voided.by}`}: {c.voided.reason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">{c.reference ?? '–'}</td>
                                        <td className="px-4 py-2">{c.recorded_by ?? 'Imported'}</td>
                                        <td
                                            className={cn(
                                                'px-4 py-2 text-right font-medium whitespace-nowrap tabular-nums',
                                                c.voided && 'line-through',
                                            )}
                                        >
                                            {lkr(c.cents, true)}
                                        </td>
                                        <td className="px-2 py-1 text-right">{!c.voided && <VoidButton line={c} />}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <SupporterDetails account={account} />
            </div>
        </AppLayout>
    );
}
