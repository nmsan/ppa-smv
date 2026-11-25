<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\RequiresTreasurer;
use App\Application\Ports\MembershipPlanRepository;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Membership\MembershipCategory;
use App\Domain\Membership\MembershipPlan;
use App\Domain\Shared\Money;

/** The treasurer changes a plan's name, fee or whether it takes new requests. Requests already made keep their fee. */
final readonly class UpdateMembershipPlan
{
    use RequiresTreasurer;

    public function __construct(private MembershipPlanRepository $plans) {}

    public function execute(MembershipCategory $category, string $name, ?string $nameSi, int $feeCents, bool $active, Actor $actor): MembershipPlan
    {
        $this->authorise($actor);

        $plan = $this->plans->findByCategory($category) ?? throw new NotFoundException('Membership plan not found.');
        $plan->change($name, $nameSi, Money::fromCents($feeCents), $active);
        $this->plans->save($plan);

        return $plan;
    }
}
