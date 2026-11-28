import FlashMessage from '@/components/domain/flash-message';
import FormErrorSummary, { focusFirstError } from '@/components/domain/form-error-summary';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { lkr } from '@/lib/money';
import { type BreadcrumbItem } from '@/types';
import { type MembershipPlan } from '@/types/membership';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { type FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Membership plans', href: '/admin/membership/plans' }];

function PlanForm({ plan }: { plan: MembershipPlan }) {
    const form = useForm({
        name: plan.name,
        name_si: plan.nameSi ?? '',
        fee: String(plan.feeCents / 100),
        active: plan.active,
    });
    const id = (field: string) => `${plan.category}-${field}`;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(route('admin.membership.plans.update', plan.category), { preserveScroll: true, onError: focusFirstError });
    };

    return (
        <form onSubmit={submit} className="admin-panel space-y-5 rounded-xl border p-5" noValidate>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{plan.recurring ? 'Annual membership' : 'Life membership'}</h2>
                <p className="text-muted-foreground text-sm">
                    Now {lkr(plan.feeCents)} {plan.recurring ? 'a year' : 'once'} · {plan.active ? 'open for requests' : 'closed'}
                </p>
            </div>
            <FormErrorSummary errors={form.errors} action="saved" />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={id('name')}>Name</Label>
                    <Input id={id('name')} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                    <InputError message={form.errors.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={id('name_si')}>Name in Sinhala</Label>
                    <Input id={id('name_si')} lang="si" value={form.data.name_si} onChange={(e) => form.setData('name_si', e.target.value)} />
                    <InputError message={form.errors.name_si} />
                </div>
            </div>

            <div className="grid max-w-xs gap-2">
                <Label htmlFor={id('fee')}>Fee (LKR){plan.recurring ? ', per year' : ', one payment'}</Label>
                <Input
                    id={id('fee')}
                    inputMode="decimal"
                    value={form.data.fee}
                    onChange={(e) => form.setData('fee', e.target.value.replace(/[^\d.]/g, ''))}
                    required
                />
                <InputError message={form.errors.fee} />
            </div>

            <label htmlFor={id('active')} className="flex items-start gap-3">
                <Checkbox
                    id={id('active')}
                    checked={form.data.active}
                    onCheckedChange={(v) => form.setData('active', v === true)}
                    className="mt-0.5"
                />
                <span>
                    <span className="block text-sm font-medium">Open for new requests</span>
                    <span className="text-muted-foreground text-sm">When off, this plan is hidden on the website and cannot be requested.</span>
                </span>
            </label>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={form.processing || !form.isDirty}>
                    {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                    Save {plan.recurring ? 'annual' : 'life'} plan
                </Button>
                {form.recentlySuccessful && <span className="text-sm text-green-700">Saved</span>}
            </div>
        </form>
    );
}

export default function MembershipPlans({ plans }: { plans: MembershipPlan[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Membership plans" />
            <div className="max-w-3xl space-y-6 p-4">
                <HeadingSmall
                    title="Membership plans and fees"
                    description="These fees appear on the website's Membership page and are used for new requests. Requests already made keep the fee agreed at the time."
                />
                <FlashMessage />
                {plans.map((p) => (
                    <PlanForm key={p.category} plan={p} />
                ))}
            </div>
        </AppLayout>
    );
}
