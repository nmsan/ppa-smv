<?php

namespace App\Domain\Membership;

use App\Domain\Shared\DomainRuleViolation;

/**
 * A past pupil's batch, from their O/L and/or A/L year.
 * The batch key is the A/L year, or the expected A/L year (O/L + 3) for
 * pupils who left after O/L. Batch representatives look after one key.
 */
final readonly class Batch
{
    private const FIRST_YEAR = 1940;

    private const LAST_YEAR = 2100;

    private function __construct(public ?int $olYear, public ?int $alYear) {}

    public static function of(?int $olYear, ?int $alYear): self
    {
        if ($olYear === null && $alYear === null) {
            throw new DomainRuleViolation('An O/L or A/L year is required.');
        }

        foreach ([$olYear, $alYear] as $year) {
            if ($year !== null && ($year < self::FIRST_YEAR || $year > self::LAST_YEAR)) {
                throw new DomainRuleViolation("Year {$year} is out of range.");
            }
        }

        if ($olYear !== null && $alYear !== null) {
            $gap = $alYear - $olYear;
            if ($gap < 1 || $gap > 4) {
                throw new DomainRuleViolation('A/L year must be 1 to 4 years after the O/L year.');
            }
        }

        return new self($olYear, $alYear);
    }

    public function key(): int
    {
        return $this->alYear ?? $this->olYear + 3;
    }

    public function equals(self $other): bool
    {
        return $this->key() === $other->key();
    }
}
