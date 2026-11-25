<?php

namespace App\Domain\Membership;

use App\Domain\Shared\DomainRuleViolation;
use App\Domain\Shared\Money;

/**
 * A kind of paid membership people can ask for (annual or life) and its fee.
 * There is one plan per category; the treasurer sets the name and fee, and
 * can stop new requests for a plan by switching it off.
 */
final class MembershipPlan
{
    private function __construct(
        public readonly string $id,
        public readonly MembershipCategory $category,
        private string $name,
        private ?string $nameSi,
        private Money $fee,
        private bool $active,
    ) {}

    public static function create(string $id, MembershipCategory $category, string $name, ?string $nameSi, Money $fee, bool $active = true): self
    {
        if ($category === MembershipCategory::Honorary) {
            throw new DomainRuleViolation('Honorary membership is given by the committee, not requested.');
        }

        $plan = new self($id, $category, '', null, Money::zero(), $active);
        $plan->change($name, $nameSi, $fee, $active);

        return $plan;
    }

    public static function reconstitute(string $id, MembershipCategory $category, string $name, ?string $nameSi, Money $fee, bool $active): self
    {
        return new self($id, $category, $name, $nameSi, $fee, $active);
    }

    public function change(string $name, ?string $nameSi, Money $fee, bool $active): void
    {
        if (trim($name) === '') {
            throw new DomainRuleViolation('The plan needs a name.');
        }
        if (! $fee->isPositive()) {
            throw new DomainRuleViolation('The fee must be more than zero.');
        }

        $this->name = trim($name);
        $this->nameSi = $nameSi === null || trim($nameSi) === '' ? null : trim($nameSi);
        $this->fee = $fee;
        $this->active = $active;
    }

    /** Annual membership is paid every year; life membership once. */
    public function isRecurring(): bool
    {
        return $this->category === MembershipCategory::Annual;
    }

    public function name(): string
    {
        return $this->name;
    }

    public function nameSi(): ?string
    {
        return $this->nameSi;
    }

    public function fee(): Money
    {
        return $this->fee;
    }

    public function isActive(): bool
    {
        return $this->active;
    }
}
