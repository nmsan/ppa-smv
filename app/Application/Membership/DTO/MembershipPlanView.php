<?php

namespace App\Application\Membership\DTO;

use App\Domain\Membership\MembershipPlan;

final readonly class MembershipPlanView
{
    public function __construct(
        public string $category,
        public string $name,
        public ?string $nameSi,
        public int $feeCents,
        public bool $recurring,
        public bool $active,
    ) {}

    public static function from(MembershipPlan $plan): self
    {
        return new self(
            $plan->category->value,
            $plan->name(),
            $plan->nameSi(),
            $plan->fee()->cents,
            $plan->isRecurring(),
            $plan->isActive(),
        );
    }
}
