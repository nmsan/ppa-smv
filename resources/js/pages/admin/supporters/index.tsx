import StatTile from '@/components/dashboard/stat-tile';
import FlashMessage from '@/components/domain/flash-message';
import FormErrorSummary from '@/components/domain/form-error-summary';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { lkr } from '@/lib/money';
import { cn } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import { BadgeCheck, EyeOff, LoaderCircle, Pencil, Plus } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';

interface SupporterRow {
    id: string;
    name: string;
    kind: string;
    member_number: string | null;
    note: string | null;
    show_publicly: boolean;
    sponsorship_cents: number;
    donation_cents: number;
    total_cents: number;
    contributions: number;
    events: string[];
    last_received: string | null;
}

interface EventRow {
    id: string;
    name: string;
    held_on: string | null;
    sponsorship_cents: number;
    donation_cents: number;
    supporters: number;
}

type Tab = 'all' | 'sponsors' | 'donors';

const selectClass = 'border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm';

function formatDate(iso: string | null) {
    return iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '–';
}

function AddSupporter() {
    const [open, setOpen] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const form = useForm({ name: '', kind: 'business', membership_number: '', phone: '', show_publicly: true });
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.transform((d) => (isMember ? { ...d, kind: 'individual' } : { ...d, membership_number: '' }));
        form.post(route('admin.supporters.store'));
    };
    const choice = (value: boolean, title: string, text: string) => (
        <button
            type="button"
            aria-pressed={isMember === value}
            onClick={() => setIsMember(value)}
            className={cn('rounded-lg border p-3 text-left text-sm', isMember === value ? 'border-primary ring-primary ring-1' : 'hover:bg-muted/50')}
        >
            <span className="block font-medium">{title}</span>
            <span className="text-muted-foreground text-xs">{text}</span>
        </button>
    );

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="size-4" /> Add supporter
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <form onSubmit={submit} className="space-y-4" noValidate>
                        <DialogHeader>
                            <DialogTitle>Add a supporter</DialogTitle>
                            <DialogDescription>A sponsor or donor. Create their account, then record what they gave.</DialogDescription>
                        </DialogHeader>
                        <FormErrorSummary errors={form.errors} action="added" />
                        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Is this a member?">
                            {choice(false, 'Not a member', 'A business or well-wisher')}
                            {choice(true, 'A PPA member', 'Linked to their membership')}
                        </div>

                        {isMember ? (
                            <div className="grid gap-2">
                                <Label htmlFor="membership_number">Membership number</Label>
                                <Input
                                    id="membership_number"
                                    placeholder="M-123"
                                    value={form.data.membership_number}
                                    onChange={(e) => form.setData('membership_number', e.target.value)}
                                    autoFocus
                                />
                                <p className="text-muted-foreground text-xs">Their name and batch are taken from their membership.</p>
                                <InputError message={form.errors.membership_number} />
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoFocus />
                                    <InputError message={form.errors.name} />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="kind">Type</Label>
                                        <select
                                            id="kind"
                                            className={selectClass}
                                            value={form.data.kind}
                                            onChange={(e) => form.setData('kind', e.target.value)}
                                        >
                                            <option value="business">Business or organisation</option>
                                            <option value="individual">Individual</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                                Add supporter
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function RenameEvent({ event }: { event: EventRow }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ name: event.name, held_on: event.held_on ?? '' });
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(route('admin.supporters.events.update', event.id), { preserveScroll: true, onSuccess: () => setOpen(false) });
    };

    return (
        <>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setOpen(true)} aria-label={`Edit ${event.name}`}>
                <Pencil className="size-4" />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <form onSubmit={submit} className="space-y-4" noValidate>
                        <DialogHeader>
                            <DialogTitle>Edit event or project</DialogTitle>
                            <DialogDescription>Every contribution to it shows the new name.</DialogDescription>
                        </DialogHeader>
                        <FormErrorSummary errors={form.errors} action="saved" />
                        <div className="grid gap-2">
                            <Label htmlFor="event-name">Name</Label>
                            <Input id="event-name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="held-on">Date (optional)</Label>
                            <Input id="held-on" type="date" value={form.data.held_on} onChange={(e) => form.setData('held_on', e.target.value)} />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function SupportersIndex({ supporters, events }: { supporters: SupporterRow[]; events: EventRow[] }) {
    const [tab, setTab] = useState<Tab>('all');
    const amount = (s: SupporterRow) => (tab === 'sponsors' ? s.sponsorship_cents : tab === 'donors' ? s.donation_cents : s.total_cents);
    const shown = supporters.filter((s) => amount(s) > 0 || (tab === 'all' && s.contributions === 0)).sort((a, b) => amount(b) - amount(a));
    const sponsorTotal = supporters.reduce((n, s) => n + s.sponsorship_cents, 0);
    const donationTotal = supporters.reduce((n, s) => n + s.donation_cents, 0);
    const tabClass = (t: Tab) =>
        cn('rounded-full px-4 py-1.5 text-sm font-medium', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border');

    return (
        <AppLayout breadcrumbs={[{ title: 'Supporters', href: '/admin/supporters' }]}>
            <Head title="Supporters" />
            <div className="space-y-8 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <HeadingSmall title="Supporter accounts" description="Sponsors and donors. Each account adds up everything they have given." />
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <a href="/projects/sponsors" target="_blank" rel="noreferrer">
                                Sponsors page
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="/projects/donors" target="_blank" rel="noreferrer">
                                Donors page
                            </a>
                        </Button>
                        <AddSupporter />
                    </div>
                </div>
                <FlashMessage />

                <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-4">
                    <StatTile
                        label="Sponsorships"
                        value={lkr(sponsorTotal)}
                        detail={`${supporters.filter((s) => s.sponsorship_cents > 0).length} sponsors`}
                    />
                    <StatTile
                        label="Donations"
                        value={lkr(donationTotal)}
                        detail={`${supporters.filter((s) => s.donation_cents > 0).length} donors`}
                    />
                    <StatTile
                        label="Linked to members"
                        value={supporters.filter((s) => s.member_number).length}
                        detail={`of ${supporters.filter((s) => s.kind === 'individual').length} individual supporters`}
                    />
                </div>

                <section className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">Supporters, largest first</h2>
                        <div role="tablist" className="flex gap-2">
                            {(['all', 'sponsors', 'donors'] as Tab[]).map((t) => (
                                <button key={t} role="tab" aria-selected={tab === t} className={tabClass(t)} onClick={() => setTab(t)}>
                                    {t === 'all' ? 'All' : t === 'sponsors' ? 'Sponsors' : 'Donors'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Supporter</th>
                                    <th className="px-4 py-2 font-medium">Events and projects</th>
                                    <th className="px-4 py-2 font-medium">Last received</th>
                                    <th className="px-4 py-2 text-right font-medium">
                                        {tab === 'sponsors' ? 'Sponsored' : tab === 'donors' ? 'Donated' : 'Total'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {shown.map((s) => (
                                    <tr key={s.id} className="hover:bg-muted/30 border-t">
                                        <td className="px-4 py-2">
                                            <Link href={route('admin.supporters.show', s.id)} className="font-medium hover:underline">
                                                {s.name}
                                            </Link>
                                            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                                                {s.member_number && (
                                                    <span className="inline-flex items-center gap-1 text-green-700">
                                                        <BadgeCheck className="size-3" /> {s.member_number}
                                                    </span>
                                                )}
                                                {s.note && <span>{s.note}</span>}
                                                {!s.show_publicly && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <EyeOff className="size-3" /> hidden
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex flex-wrap gap-1">
                                                {s.events.map((e) => (
                                                    <span key={e} className="bg-muted rounded-full px-2 py-0.5 text-xs">
                                                        {e}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{formatDate(s.last_received)}</td>
                                        <td className="px-4 py-2 text-right font-semibold whitespace-nowrap tabular-nums">{lkr(amount(s))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">By event or project</h2>
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Event or project</th>
                                    <th className="px-4 py-2 font-medium">Date</th>
                                    <th className="px-4 py-2 font-medium">Supporters</th>
                                    <th className="px-4 py-2 text-right font-medium">Sponsorships</th>
                                    <th className="px-4 py-2 text-right font-medium">Donations</th>
                                    <th className="px-4 py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((e) => (
                                    <tr key={e.id} className="border-t">
                                        <td className="px-4 py-2 font-medium">{e.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{formatDate(e.held_on)}</td>
                                        <td className="px-4 py-2 tabular-nums">{e.supporters}</td>
                                        <td className="px-4 py-2 text-right whitespace-nowrap tabular-nums">{lkr(e.sponsorship_cents)}</td>
                                        <td className="px-4 py-2 text-right whitespace-nowrap tabular-nums">{lkr(e.donation_cents)}</td>
                                        <td className="px-2 py-1 text-right">
                                            <RenameEvent event={e} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
