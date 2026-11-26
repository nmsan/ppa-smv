import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Choose a new password" description="Pick a new password for your member account.">
            <Head title="Reset password" />

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-[15px] font-semibold">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="focus-visible:ring-maroon-700 h-12 rounded-xl border-neutral-300 bg-neutral-100 px-4 text-base text-neutral-600"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-[15px] font-semibold">
                            New password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="focus-visible:ring-maroon-700 h-12 rounded-xl border-neutral-300 bg-white px-4 text-base"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="New password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-[15px] font-semibold">
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="focus-visible:ring-maroon-700 h-12 rounded-xl border-neutral-300 bg-white px-4 text-base"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm new password"
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <Button type="submit" variant="maroon" size="brand" className="mt-2 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Save new password
                    </Button>
                </div>

                <div className="mt-6 text-center text-[15px] text-neutral-600">
                    Remembered it?{' '}
                    <TextLink href={route('login')} className="text-maroon-700 decoration-maroon-700/30 font-semibold">
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
