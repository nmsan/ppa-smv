<?php

namespace App\Infrastructure\Persistence;

use App\Application\Ports\MembershipPlanRepository;
use App\Domain\Membership\MembershipCategory;
use App\Domain\Membership\MembershipPlan;
use App\Domain\Shared\Money;
use App\Infrastructure\Persistence\Eloquent\Models\MembershipPlanModel;

final class EloquentMembershipPlanRepository implements MembershipPlanRepository
{
    public function all(): array
    {
        return MembershipPlanModel::query()->orderBy('position')->get()->map(fn ($row) => $this->toDomain($row))->all();
    }

    public function findByCategory(MembershipCategory $category): ?MembershipPlan
    {
        $row = MembershipPlanModel::query()->where('category', $category->value)->first();

        return $row ? $this->toDomain($row) : null;
    }

    public function save(MembershipPlan $plan): void
    {
        MembershipPlanModel::query()->updateOrCreate(['id' => $plan->id], [
            'category' => $plan->category->value,
            'name' => $plan->name(),
            'name_si' => $plan->nameSi(),
            'fee_cents' => $plan->fee()->cents,
            'active' => $plan->isActive(),
        ]);
    }

    private function toDomain(MembershipPlanModel $row): MembershipPlan
    {
        return MembershipPlan::reconstitute(
            $row->id, MembershipCategory::from($row->category), $row->name, $row->name_si, Money::fromCents($row->fee_cents), $row->active,
        );
    }
}
