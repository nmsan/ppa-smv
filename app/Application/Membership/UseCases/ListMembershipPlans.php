<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\DTO\MembershipPlanView;
use App\Application\Ports\MembershipPlanRepository;

/** The plans and fees: all of them for the treasurer, only the open ones for the public and applicants. */
final readonly class ListMembershipPlans
{
    public function __construct(private MembershipPlanRepository $plans) {}

    /** @return list<MembershipPlanView> */
    public function execute(bool $onlyOpen = true): array
    {
        $plans = $this->plans->all();
        if ($onlyOpen) {
            $plans = array_values(array_filter($plans, fn ($p) => $p->isActive()));
        }

        return array_map(fn ($p) => MembershipPlanView::from($p), $plans);
    }
}
