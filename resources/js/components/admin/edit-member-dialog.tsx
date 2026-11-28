import FormErrorSummary, { focusFirstError } from '@/components/domain/form-error-summary';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { categoryLabel } from '@/types/membership';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { type FormEventHandler, type ReactNode, useEffect, useState } from 'react';

const selectClass = 'border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm';

/** What the server sends for the form (see App\Application\Membership\UseCases\EditMember::details). The NIC itself never comes back. */
interface EditableMember {
    id: string;
    number: string | null;
    status: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    has_nic: boolean;
    ol_year: number | null;
    al_year: number | null;
    country: string | null;
    gender: string | null;
    admission_number: string | null;
    category: string;
    linked_account: boolean;
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: ReactNode; children: ReactNode }) {
    return (
        <div className="grid content-start gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
            <InputError message={error} />
        </div>
    );
}

/** The secretary's member form. Without a member it adds a new one; with one it corrects that record. */
function MemberForm({ member, categories, onClose }: { member?: EditableMember; categories: string[]; onClose: () => void }) {
    const adding = member === undefined;
    const form = useForm({
        full_name: member?.full_name ?? '',
        email: member?.email ?? '',
        phone: member?.phone ?? '',
        whatsapp: member?.whatsapp ?? '',
        nic: '',
        clear_nic: false as boolean,
        ol_year: member?.ol_year ? String(member.ol_year) : '',
        al_year: member?.al_year ? String(member.al_year) : '',
        country: member?.country ?? (adding ? 'Sri Lanka' : ''),
        gender: member?.gender ?? '',
        admission_number: member?.admission_number ?? '',
        category: member?.category ?? (categories.includes('annual') ? 'annual' : categories[0]),
        give_number: true as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, preserveState: true, onSuccess: onClose, onError: focusFirstError };
        // Each endpoint ignores the other's field (give_number on edit, clear_nic on add).
        if (member) form.put(route('admin.members.update', member.id), options);
        else form.post(route('admin.members.store'), options);
    };

    const set = (key: keyof typeof form.data) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        form.setData(key, e.target.value as never);

    return (
        <form onSubmit={submit} className="space-y-4" noValidate>
            <DialogHeader>
                <DialogTitle>{member ? 'Edit member' : 'Add member'}</DialogTitle>
                <DialogDescription>
                    {member ? (
                        <>
                            {member.number ?? 'No membership number'}
                            {member.linked_account ? ' · linked to a website account' : ' · not linked to an account yet'}. Changes are recorded in
                            the activity log.
                        </>
                    ) : (
                        'For someone who joined in person. Only the name and a batch year are required. They can link this record to a website account later with "Find my record".'
                    )}
                </DialogDescription>
            </DialogHeader>
            <FormErrorSummary errors={form.errors} action={member ? 'saved' : 'added'} />

            <Field id="e-full_name" label="Full name" error={form.errors.full_name}>
                <Input id="e-full_name" value={form.data.full_name} onChange={set('full_name')} autoFocus />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field id="e-email" label="Email" error={form.errors.email}>
                    <Input id="e-email" type="email" value={form.data.email} onChange={set('email')} />
                </Field>
                <Field id="e-phone" label="Mobile" error={form.errors.phone}>
                    <Input id="e-phone" inputMode="tel" placeholder="0771234567" value={form.data.phone} onChange={set('phone')} />
                </Field>
                <Field id="e-whatsapp" label="WhatsApp" error={form.errors.whatsapp}>
                    <Input id="e-whatsapp" inputMode="tel" value={form.data.whatsapp} onChange={set('whatsapp')} />
                </Field>
                <Field id="e-country" label="Country" error={form.errors.country}>
                    <Input id="e-country" placeholder="Sri Lanka" value={form.data.country} onChange={set('country')} />
                </Field>
                <Field id="e-ol_year" label="O/L year" error={form.errors.ol_year}>
                    <Input id="e-ol_year" inputMode="numeric" maxLength={4} value={form.data.ol_year} onChange={set('ol_year')} />
                </Field>
                <Field id="e-al_year" label="A/L year" error={form.errors.al_year} hint="The batch is the A/L year, or O/L + 3.">
                    <Input id="e-al_year" inputMode="numeric" maxLength={4} value={form.data.al_year} onChange={set('al_year')} />
                </Field>
                <Field id="e-gender" label="Gender" error={form.errors.gender}>
                    <select id="e-gender" className={selectClass} value={form.data.gender} onChange={set('gender')}>
                        <option value="">Not recorded</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </Field>
                <Field id="e-admission_number" label="School admission no." error={form.errors.admission_number}>
                    <Input id="e-admission_number" value={form.data.admission_number} onChange={set('admission_number')} />
                </Field>
                <Field
                    id="e-category"
                    label="Membership"
                    error={form.errors.category}
                    hint={
                        adding
                            ? "The member owes this plan's current fee."
                            : form.data.category !== member.category
                              ? "The agreed fee changes to the new plan's current fee."
                              : undefined
                    }
                >
                    <select id="e-category" className={selectClass} value={form.data.category} onChange={set('category')}>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {categoryLabel[c] ?? c}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field
                    id="e-nic"
                    label={member?.has_nic ? 'Replace NIC' : 'NIC'}
                    error={form.errors.nic}
                    hint={
                        adding
                            ? 'Optional. Helps the person prove the record is theirs.'
                            : member.has_nic
                              ? 'A NIC is on file. It is never shown; leave blank to keep it.'
                              : 'No NIC on file.'
                    }
                >
                    <Input id="e-nic" autoComplete="off" value={form.data.nic} disabled={form.data.clear_nic} onChange={set('nic')} />
                </Field>
            </div>

            {member?.has_nic && (
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                        checked={form.data.clear_nic}
                        onCheckedChange={(v) => {
                            form.setData({ ...form.data, clear_nic: v === true, nic: '' });
                        }}
                    />
                    Remove the NIC on file
                </label>
            )}

            {adding && (
                <label className="flex items-start gap-2 text-sm">
                    <Checkbox className="mt-0.5" checked={form.data.give_number} onCheckedChange={(v) => form.setData('give_number', v === true)} />
                    <span>
                        Approve now and give the next membership number
                        <span className="text-muted-foreground block text-xs">Untick to send them to Applicants for the committee to approve.</span>
                    </span>
                </label>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={onClose} disabled={form.processing}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                    {member ? 'Save changes' : 'Add member'}
                </Button>
            </DialogFooter>
        </form>
    );
}

/** Loads the member's current details when it opens, so the list itself never carries the edit-only fields. */
export default function EditMemberDialog({ memberId, categories, onClose }: { memberId: string; categories: string[]; onClose: () => void }) {
    const [member, setMember] = useState<EditableMember | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        fetch(route('admin.members.show', memberId), { headers: { Accept: 'application/json' }, signal: controller.signal })
            .then((r) => (r.ok ? r.json() : Promise.reject(r)))
            .then(setMember)
            .catch((e) => e?.name !== 'AbortError' && setFailed(true));
        return () => controller.abort();
    }, [memberId]);

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                {member ? (
                    <MemberForm member={member} categories={categories} onClose={onClose} />
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Edit member</DialogTitle>
                            <DialogDescription>
                                {failed ? 'This record could not be loaded. Close and try again.' : 'Loading the record…'}
                            </DialogDescription>
                        </DialogHeader>
                        {!failed && <LoaderCircle className="text-muted-foreground mx-auto size-5 animate-spin" />}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

export function AddMemberDialog({ categories, onClose }: { categories: string[]; onClose: () => void }) {
    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <MemberForm categories={categories} onClose={onClose} />
            </DialogContent>
        </Dialog>
    );
}
