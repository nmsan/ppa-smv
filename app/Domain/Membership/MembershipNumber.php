<?php

namespace App\Domain\Membership;

use App\Domain\Shared\DomainRuleViolation;

/** The association's existing format: M-001, M-002 ... */
final readonly class MembershipNumber
{
    private function __construct(public string $value) {}

    public static function fromString(string $value): self
    {
        if (! preg_match('/^M-\d{3,}$/', $value)) {
            throw new DomainRuleViolation("Invalid membership number: {$value}");
        }

        return new self($value);
    }

    public static function fromSequence(int $sequence): self
    {
        if ($sequence < 1) {
            throw new DomainRuleViolation('Membership sequence must start at 1.');
        }

        return new self(sprintf('M-%03d', $sequence));
    }

    public function sequence(): int
    {
        return (int) substr($this->value, 2);
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
