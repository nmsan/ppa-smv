import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Welcome back" description="Log in to your member account.">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-[15px] font-semibold">
                            Email address
                        </Label>
                        <Input
                            className="focus-visible:ring-maroon-700 h-12 rounded-xl border-neutral-300 bg-white px-4 text-base"
                            id="email"
                            type="email"
                            required
                            autoFocus
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-[15px] font-semibold">
                                Password
                            </Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="text-maroon-700 ml-auto text-sm">
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            className="focus-visible:ring-maroon-700 h-12 rounded-xl border-neutral-300 bg-white px-4 text-base"
                            id="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(v) => setData('remember', v === true)}
                            className="data-[state=checked]:bg-maroon-800 data-[state=checked]:border-maroon-800"
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" variant="maroon" size="brand" className="mt-2 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-center text-[15px] text-neutral-600">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} className="text-maroon-700 decoration-maroon-700/30 font-semibold">
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
