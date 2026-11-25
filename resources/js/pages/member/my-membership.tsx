import FlashMessage from '@/components/domain/flash-message';
import FormErrorSummary, { focusFirstError } from '@/components/domain/form-error-summary';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { lkr } from '@/lib/money';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, Clock, HandHeart, IdCard, LoaderCircle, Lock, Search, UserPlus } from 'lucide-react';
import { type ComponentProps, type FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'My membership', href: '/my-membership' }];

interface Membership {
    status: 'applied' | 'approved' | 'active' | 'expiring' | 'lapsed' | 'rejected';
    number: string | null;
    category: string;
    locked: boolean;
    fullName: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    nic: string | null;
    olYear: number | null;
    alYear: number | null;
    batchKey: number | null;
    country: string | null;
    since: string;
    fromRegister: boolean;
}

type FormData = Record<string, string>;

const statusText: Record<Membership['status'], { title: string; text: string }> = {
    applied: {
        title: 'Waiting for approval',
        text: 'Your batch representative will review your application. You can still correct your details below.',
    },
    approved: { title: 'Member', text: 'Your membership is approved.' },
    active: { title: 'Member', text: 'Your membership is active.' },
    expiring: { title: 'Renewal due soon', text: 'Your membership is due for renewal.' },
    lapsed: { title: 'Membership lapsed', text: 'Please contact the treasurer to renew.' },
    rejected: { title: 'Application not approved', text: 'Please contact the secretary for details.' },
};

function formatDate(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function TextField({
    of: form,
    name,
    label,
    help,
    ...props
}: { of: ReturnType<typeof useForm<FormData>>; name: string; label: string; help?: string } & ComponentProps<typeof Input>) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                value={form.data[name] ?? ''}
                onChange={(e) => form.setData(name, e.target.value)}
                disabled={form.processing}
                {...props}
            />
            {help && <p className="text-muted-foreground text-xs">{help}</p>}
            <InputError message={form.errors[name]} />
        </div>
    );
}

function LockedField({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="grid gap-2">
            <Label className="flex items-center gap-1.5">
                {label} <Lock className="text-muted-foreground size-3" aria-label="locked" />
            </Label>
            <p className="bg-muted/50 rounded-md border px-3 py-2 text-sm">{value || '–'}</p>
        </div>
    );
}

function SubmitButton({ processing, children }: { processing: boolean; children: React.ReactNode }) {
    return (
        <Button type="submit" disabled={processing}>
            {processing && <LoaderCircle className="size-4 animate-spin" />}
            {children}
        </Button>
    );
}

/** Not a member yet: apply, or link an existing record from the old register. */
function Join() {
    const { auth } = usePage<SharedData>().props;
    const [mode, setMode] = useState<'new' | 'existing'>('new');
    const apply = useForm<FormData>({ full_name: auth.user.name, email: auth.user.email, phone: '', nic: '', ol_year: '', al_year: '' });
    const claim = useForm<FormData>({ membership_number: '', phone: '', nic: '' });

    const submitApply: FormEventHandler = (e) => {
        e.preventDefault();
        apply.post(route('my-membership.apply'), { preserveScroll: 'errors', onError: focusFirstError });
    };
    const submitClaim: FormEventHandler = (e) => {
        e.preventDefault();
        claim.post(route('my-membership.claim'), { preserveScroll: 'errors', onError: focusFirstError });
    };

    const choice = (key: 'new' | 'existing', Icon: typeof UserPlus, title: string, text: string) => (
        <button
            type="button"
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
            className={cn(
                'flex gap-3 rounded-xl border p-4 text-left transition-colors',
                mode === key ? 'border-primary ring-primary ring-1' : 'hover:bg-muted/50',
            )}
        >
            <Icon className="mt-0.5 size-5 shrink-0" />
            <span>
                <span className="block font-semibold">{title}</span>
                <span className="text-muted-foreground text-sm">{text}</span>
            </span>
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="rounded-xl border p-5">
                <p className="text-muted-foreground text-sm">Your account is ready</p>
                <p className="mt-1 text-xl font-semibold">One more step to become a member</p>
                <p className="text-muted-foreground mt-1 text-sm">
                    Membership is open to anyone who studied at Senanayake Central College for at least one year.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {choice('new', UserPlus, "I'm joining for the first time", 'Send your details to your batch representative for approval.')}
                {choice('existing', Search, "I'm already a member", 'Find your record from the association register with your membership number.')}
            </div>

            {mode === 'new' ? (
                <form onSubmit={submitApply} className="space-y-5 rounded-xl border p-5" noValidate>
                    <FormErrorSummary errors={apply.errors} action="sent" />
                    <TextField of={apply} name="full_name" label="Full name" required autoComplete="name" />
                    <TextField of={apply} name="email" label="Email" type="email" required autoComplete="email" />
                    <TextField of={apply} name="phone" label="Mobile number" required placeholder="0771234567" autoComplete="tel" />
                    <TextField of={apply} name="nic" label="NIC number" required placeholder="199812345678 or 981234567V" />
                    <div className="grid grid-cols-2 gap-4">
                        <TextField of={apply} name="ol_year" label="O/L year" type="number" min={1940} max={2100} />
                        <TextField of={apply} name="al_year" label="A/L year" type="number" min={1940} max={2100} />
                    </div>
                    <p className="text-muted-foreground text-sm">Enter at least one year. Leave A/L blank if you left school after O/L.</p>
                    <SubmitButton processing={apply.processing}>Submit for approval</SubmitButton>
                </form>
            ) : (
                <form onSubmit={submitClaim} className="space-y-5 rounded-xl border p-5" noValidate>
                    <FormErrorSummary errors={claim.errors} action="found" />
                    <TextField
                        of={claim}
                        name="membership_number"
                        label="Membership number"
                        required
                        placeholder="M-123"
                        help="On your membership card or receipt. Ask the secretary if you don't know it."
                    />
                    <p className="text-sm">To prove it's you, enter one of the details the association has on file:</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField of={claim} name="phone" label="Mobile number" placeholder="0771234567" autoComplete="tel" />
                        <TextField of={claim} name="nic" label="or NIC number" />
                    </div>
                    <SubmitButton processing={claim.processing}>Find my record</SubmitButton>
                </form>
            )}
        </div>
    );
}

/** Applicant or member: status, and the details they can keep up to date. */
function Details({ m }: { m: Membership }) {
    const form = useForm<FormData>({
        full_name: m.fullName,
        email: m.email ?? '',
        phone: m.phone ?? '',
        whatsapp: m.whatsapp ?? '',
        nic: m.locked ? '' : (m.nic ?? ''),
        ol_year: m.olYear ? String(m.olYear) : '',
        al_year: m.alYear ? String(m.alYear) : '',
        country: m.country ?? '',
    });
    const status = statusText[m.status];
    const isMember = ['approved', 'active', 'expiring'].includes(m.status);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(route('my-membership.update'), { preserveScroll: 'errors', onError: focusFirstError });
    };

    return (
        <div className="space-y-6">
            <div className={cn('flex gap-4 rounded-xl border p-5', m.status === 'applied' && 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/30')}>
                {isMember ? <BadgeCheck className="size-8 shrink-0 text-green-700" /> : <Clock className="size-8 shrink-0 text-amber-600" />}
                <div>
                    <p className="text-muted-foreground text-sm">{status.title}</p>
                    <p className="text-2xl font-semibold">{m.number ?? 'No number yet'}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {status.text}
                        {isMember && ` ${m.category.charAt(0).toUpperCase() + m.category.slice(1)} member`}
                        {m.batchKey && ` · A/L ${m.batchKey} batch`}
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-6 rounded-xl border p-5" noValidate>
                <h2 className="font-semibold">Your details</h2>
                <FormErrorSummary errors={form.errors} action="saved" />

                {m.locked ? (
                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <LockedField label="Full name" value={m.fullName} />
                            <LockedField label="NIC number" value={m.nic} />
                            <LockedField label="O/L year" value={m.olYear ? String(m.olYear) : null} />
                            <LockedField label="A/L year" value={m.alYear ? String(m.alYear) : null} />
                        </div>
                        <p className="text-muted-foreground text-xs">
                            These decide your batch and identify you, so only the membership secretary can change them. Please contact the secretary
                            if something is wrong.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField of={form} name="full_name" label="Full name" required />
                        <TextField of={form} name="nic" label="NIC number" />
                        <TextField of={form} name="ol_year" label="O/L year" type="number" min={1940} max={2100} />
                        <TextField of={form} name="al_year" label="A/L year" type="number" min={1940} max={2100} />
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                        of={form}
                        name="email"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        help="Receipts and renewal reminders are sent here."
                    />
                    <TextField of={form} name="phone" label="Mobile number" placeholder="0771234567" autoComplete="tel" />
                    <TextField of={form} name="whatsapp" label="WhatsApp number" placeholder="0771234567" />
                    <TextField of={form} name="country" label="Country you live in" placeholder="Sri Lanka" />
                </div>

                <div className="flex items-center gap-3">
                    <SubmitButton processing={form.processing}>Save my details</SubmitButton>
                    {form.recentlySuccessful && <span className="text-sm text-green-700">Saved</span>}
                </div>
            </form>
        </div>
    );
}

interface Giving {
    donation_cents: number;
    sponsorship_cents: number;
    count: number;
}

function GivingCard({ giving }: { giving: Giving }) {
    const total = giving.donation_cents + giving.sponsorship_cents;
    if (giving.count === 0) return null;

    return (
        <div className="border-gold-400/60 bg-gold-300/10 flex gap-4 rounded-xl border p-5">
            <HandHeart className="text-maroon-700 size-8 shrink-0" />
            <div>
                <p className="text-muted-foreground text-sm">Thank you for giving back</p>
                <p className="text-2xl font-semibold whitespace-nowrap tabular-nums">{lkr(total)}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                    {giving.count === 1 ? 'One contribution' : `${giving.count} contributions`} recorded by the treasurer
                    {giving.donation_cents > 0 &&
                        giving.sponsorship_cents > 0 &&
                        ` (${lkr(giving.donation_cents)} donated, ${lkr(giving.sponsorship_cents)} sponsored)`}
                    .
                </p>
            </div>
        </div>
    );
}

export default function MyMembership({ membership, giving }: { membership: Membership | null; giving: Giving | null }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My membership" />
            <div className="max-w-3xl space-y-6 p-4">
                <div className="flex items-center gap-3">
                    <IdCard className="text-muted-foreground size-6" />
                    <HeadingSmall
                        title="My membership"
                        description={
                            !membership
                                ? 'Join the association, or link your existing membership.'
                                : membership.status === 'applied'
                                  ? `Applied on ${formatDate(membership.since)}`
                                  : membership.fromRegister
                                    ? "Member of the Past Pupils' Association, carried over from the association register"
                                    : `Member of the Past Pupils' Association since ${formatDate(membership.since)}`
                        }
                    />
                </div>
                <FlashMessage />
                {giving && <GivingCard giving={giving} />}
                {membership ? <Details m={membership} /> : <Join />}
            </div>
        </AppLayout>
    );
}
