<?php

namespace App\Domain\Membership\Events;

use App\Domain\Shared\DomainEvent;
use DateTimeImmutable;

final readonly class ApplicationSubmitted implements DomainEvent
{
    public function __construct(public string $memberId, private DateTimeImmutable $at) {}

    public function occurredAt(): DateTimeImmutable
    {
        return $this->at;
    }
}
