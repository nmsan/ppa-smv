// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, MailCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="Check your inbox"
            description="We've emailed you a link to verify your email address. Click it to finish setting up your account."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div
                    role="status"
                    className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-800"
                >
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <div className="flex flex-col items-center text-center">
                <span className="bg-maroon-50 text-maroon-700 grid size-14 place-items-center rounded-full">
                    <MailCheck className="size-7" />
                </span>
                <p className="mt-4 text-[15px] text-neutral-600">Didn't get the email? Check your spam folder, or send a new link.</p>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-6 text-center">
                <Button type="submit" variant="maroon" size="brand" className="w-full" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </Button>

                <TextLink
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-maroon-700 decoration-maroon-700/30 mx-auto block text-[15px] font-semibold"
                >
                    Log out
                </TextLink>
            </form>
        </AuthLayout>
    );
}
