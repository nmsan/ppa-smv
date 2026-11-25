<?php

namespace Tests\Fakes;

use App\Application\Ports\MembershipPlanRepository;
use App\Domain\Membership\MembershipCategory;
use App\Domain\Membership\MembershipPlan;
use App\Domain\Shared\Money;

/** Starts with the association's two plans: Rs. 1,000 a year and Rs. 15,000 for life. */
final class InMemoryMembershipPlanRepository implements MembershipPlanRepository
{
    /** @var array<string, MembershipPlan> */
    public array $plans = [];

    public function __construct()
    {
        $this->save(MembershipPlan::create('p-annual', MembershipCategory::Annual, 'Annual member', 'ස්ථිර සාමාජික', Money::fromRupees(1000)));
        $this->save(MembershipPlan::create('p-life', MembershipCategory::Life, 'Life member', 'යාවජීව සාමාජික', Money::fromRupees(15000)));
    }

    public function all(): array
    {
        return array_values($this->plans);
    }

    public function findByCategory(MembershipCategory $category): ?MembershipPlan
    {
        return $this->plans[$category->value] ?? null;
    }

    public function save(MembershipPlan $plan): void
    {
        $this->plans[$plan->category->value] = $plan;
    }
}
