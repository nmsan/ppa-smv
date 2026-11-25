import ContributorBoard, { type BoardRow } from '@/components/public/contributor-board';
import PublicLayout from '@/layouts/public-layout';
import { type BankDetails } from '@/types/public';

export default function Donors({ donors, bank }: { donors: BoardRow[]; bank: BankDetails }) {
    return (
        <PublicLayout title="Best donors">
            <ContributorBoard
                header={{
                    title: 'Our donors',
                    subtitle: 'Past pupils and well-wishers who give back to Senanayake Central College. Thank you for every rupee.',
                    crumbs: [{ title: 'Projects', href: '/projects' }, { title: 'Best donors' }],
                }}
                rows={donors}
                bank={bank}
                labels={{
                    people: 'Donors',
                    given: 'Donated',
                    cause: 'Cause supported',
                    podiumTitle: 'Our leading donors',
                    ctaTitle: 'Give back to your school',
                    ctaText:
                        "Every donation helps a school project. Donations can be paid to the association's official bank account; please tell the treasurer so it is recorded against your name.",
                    empty: 'Donors will be listed here soon.',
                }}
            />
        </PublicLayout>
    );
}
