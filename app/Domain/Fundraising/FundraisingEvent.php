<?php

namespace App\Domain\Fundraising;

use App\Domain\Shared\DomainRuleViolation;
use DateTimeImmutable;

/** Something the association raises money for: an event, a tournament, a project drive. */
final readonly class FundraisingEvent
{
    private function __construct(public string $id, public string $name, public ?DateTimeImmutable $heldOn) {}

    public static function create(string $id, string $name, ?DateTimeImmutable $heldOn = null): self
    {
        $name = trim(preg_replace('/\s+/', ' ', $name));
        if ($name === '') {
            throw new DomainRuleViolation('An event needs a name.');
        }

        return new self($id, $name, $heldOn);
    }

    public function renamed(string $name, ?DateTimeImmutable $heldOn): self
    {
        return self::create($this->id, $name, $heldOn);
    }
}
