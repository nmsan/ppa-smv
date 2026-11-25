import ConfirmDialog from '@/components/confirm-dialog';
import FlashMessage from '@/components/domain/flash-message';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Applicants', href: '/admin/applicants' }];

interface Applicant {
    id: string;
    fullName: string;
    email: string;
    olYear: number | null;
    alYear: number | null;
    batchKey: number | null;
    appliedAt: string;
    canApprove: boolean;
}

function formatDate(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Applicants({ applicants, nextNumber }: { applicants: Applicant[]; nextNumber: string }) {
    const { errors } = usePage().props as { errors: Record<string, string> };
    const [selected, setSelected] = useState<Applicant | null>(null);
    const [processing, setProcessing] = useState(false);

    const approve = () => {
        if (!selected) return;
        setProcessing(true);
        router.post(
            route('admin.applicants.approve', selected.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setSelected(null),
                onFinish: () => setProcessing(false),
            },
        );
    };

    const batch = (a: Applicant) => [a.olYear && `O/L ${a.olYear}`, a.alYear && `A/L ${a.alYear}`].filter(Boolean).join(', ') || 'Not given';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Applicants" />
            <div className="space-y-6 p-4">
                <HeadingSmall title="Applicants waiting for approval" description="Approving an applicant issues the next membership number." />
                <FlashMessage />
                <InputError message={errors.form} />
                {applicants.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No applicants are waiting.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Name</th>
                                    <th className="px-4 py-2 font-medium">Email</th>
                                    <th className="px-4 py-2 font-medium">O/L</th>
                                    <th className="px-4 py-2 font-medium">A/L</th>
                                    <th className="px-4 py-2 font-medium">Batch</th>
                                    <th className="px-4 py-2 font-medium">Applied</th>
                                    <th className="px-4 py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {applicants.map((a) => (
                                    <tr key={a.id} className="border-t">
                                        <td className="px-4 py-2">{a.fullName}</td>
                                        <td className="px-4 py-2">{a.email}</td>
                                        <td className="px-4 py-2">{a.olYear ?? '–'}</td>
                                        <td className="px-4 py-2">{a.alYear ?? '–'}</td>
                                        <td className="px-4 py-2">{a.batchKey}</td>
                                        <td className="px-4 py-2">{a.appliedAt}</td>
                                        <td className="px-4 py-2 text-right">
                                            {a.canApprove && (
                                                <Button size="sm" onClick={() => setSelected(a)}>
                                                    Approve
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <ConfirmDialog
                    open={selected !== null}
                    onOpenChange={(open) => !open && setSelected(null)}
                    title="Approve this applicant?"
                    description="They become a member of the association straight away."
                    confirmLabel={`Approve as ${nextNumber}`}
                    processing={processing}
                    onConfirm={approve}
                >
                    {selected && (
                        <dl className="bg-muted/40 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border p-4 text-sm">
                            <dt className="text-muted-foreground">Name</dt>
                            <dd className="font-medium">{selected.fullName}</dd>
                            <dt className="text-muted-foreground">Email</dt>
                            <dd>{selected.email}</dd>
                            <dt className="text-muted-foreground">Batch</dt>
                            <dd>{batch(selected)}</dd>
                            <dt className="text-muted-foreground">Applied</dt>
                            <dd>{formatDate(selected.appliedAt)}</dd>
                            <dt className="text-muted-foreground">Membership number</dt>
                            <dd className="font-semibold">{nextNumber}</dd>
                        </dl>
                    )}
                </ConfirmDialog>
            </div>
        </AppLayout>
    );
}
