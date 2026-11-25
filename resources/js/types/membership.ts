/** A membership plan as the treasurer set it (see app/Application/Membership/DTO/MembershipPlanView.php). */
export interface MembershipPlan {
    category: 'annual' | 'life';
    name: string;
    nameSi: string | null;
    feeCents: number;
    /** Annual membership is paid every year; life membership once. */
    recurring: boolean;
    active: boolean;
}

export const categoryLabel: Record<string, string> = { annual: 'Annual', life: 'Life', honorary: 'Honorary' };
