import ContributorBoard, { type BoardRow } from '@/components/public/contributor-board';
import PublicLayout from '@/layouts/public-layout';
import { type BankDetails } from '@/types/public';

export default function Sponsors({ sponsors, bank }: { sponsors: BoardRow[]; bank: BankDetails }) {
    return (
        <PublicLayout title="Main sponsors">
            <ContributorBoard
                header={{
                    title: 'Our main sponsors',
                    subtitle: "The businesses and well-wishers whose generosity makes the association's events and school projects possible.",
                    crumbs: [{ title: 'Projects', href: '/projects' }, { title: 'Main sponsors' }],
                }}
                rows={sponsors}
                bank={bank}
                labels={{
                    people: 'Main sponsors',
                    given: 'Contributed',
                    cause: 'Event supported',
                    podiumTitle: 'Our leading sponsors',
                    ctaTitle: 'Become a sponsor',
                    ctaText:
                        "Support the next event or school project and join this list. Sponsorships can be paid to the association's official bank account.",
                    empty: 'Sponsors will be listed here soon.',
                }}
            />
        </PublicLayout>
    );
}
