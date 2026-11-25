<?php

namespace App\Application\Ports;

use App\Domain\Membership\MembershipCategory;
use App\Domain\Membership\MembershipPlan;

interface MembershipPlanRepository
{
    /** @return list<MembershipPlan> annual first, then life */
    public function all(): array;

    public function findByCategory(MembershipCategory $category): ?MembershipPlan;

    public function save(MembershipPlan $plan): void;
}
