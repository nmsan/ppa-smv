import { Kicker } from '@/components/public/section';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';

// Mirrors the claim flow in ClaimRegisterRecord: membership number plus the phone or NIC on file.
const steps = [
    'Create a free account with your email',
    'Enter your membership number from the association register',
    'Confirm it is you with the phone number or NIC we hold',
];

/** Callout for past pupils at home and abroad to claim their record and reconnect. */
export default function BatchConnect() {
    return (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-24">
            <div className="bg-maroon-800 relative isolate grid overflow-hidden rounded-[28px] text-white lg:grid-cols-[1.15fr_1fr]">
                <span
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_100%_0%,rgb(229_185_76/0.22),transparent_60%),radial-gradient(50%_70%_at_0%_100%,rgb(122_26_42/0.9),transparent_70%)]"
                />
                <div className="p-6 sm:p-10 lg:p-14">
                    <Kicker className="text-gold-400">Batch connect</Kicker>
                    <h2 className="mt-3.5 text-[28px] leading-tight font-bold tracking-tight sm:text-4xl">
                        Wherever life took you, find your class again.
                    </h2>
                    <p className="mt-4 max-w-xl text-white/85">
                        Past pupils in Madampe, Colombo, the UK, Australia, the Middle East and beyond: already on the register? Claim your record
                        online. New to the association? Apply in a few minutes, with no paper forms.
                    </p>
                    <ol className="mt-7 grid gap-3">
                        {steps.map((s, i) => (
                            <li key={s} className="flex items-start gap-3.5">
                                <span className="border-gold-400/40 bg-gold-400/15 text-gold-400 grid size-[30px] shrink-0 place-items-center rounded-full border text-sm font-bold">
                                    {i + 1}
                                </span>
                                <span className="pt-0.5">{s}</span>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild variant="gold" size="brand" className="max-sm:w-full">
                            <Link href="/my-membership">
                                <ShieldCheck />
                                Find my record
                            </Link>
                        </Button>
                        <Button asChild variant="glass" size="brand" className="max-sm:w-full">
                            <Link href="/membership">Membership categories</Link>
                        </Button>
                    </div>
                </div>
                <div className="hidden items-center justify-center p-10 lg:flex">
                    <div className="relative grid size-72 place-items-center">
                        <span aria-hidden className="border-gold-400/25 absolute inset-0 rounded-full border" />
                        <span aria-hidden className="border-gold-400/15 absolute inset-8 rounded-full border" />
                        <img src="/images/brand/logo.png" alt="" className="size-40 rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
