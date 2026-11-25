import { type BankDetails } from '@/types/public';
import { Landmark } from 'lucide-react';

export default function BankDetailsCard({ bank }: { bank: BankDetails }) {
    const rows = [
        ['Account number', bank.account_number],
        ['Account name', bank.account_name],
        ['Bank', bank.bank],
        ['Branch', bank.branch],
    ];

    return (
        <div id="give" className="bg-maroon-900 scroll-mt-24 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2">
                <Landmark className="text-gold-300 size-5" />
                <h2 className="font-semibold">Official bank account</h2>
            </div>
            <p className="mt-3 text-sm text-white/85">{bank.note}</p>
            <dl className="mt-4 space-y-2">
                {rows.map(([k, v]) => (
                    <div key={k}>
                        <dt className="text-gold-300 text-xs tracking-wide uppercase">{k}</dt>
                        <dd className="font-medium">{v}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
