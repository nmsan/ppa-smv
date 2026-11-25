<?php

namespace App\Domain\Membership\Events;

use App\Domain\Membership\MembershipNumber;
use App\Domain\Shared\DomainEvent;
use DateTimeImmutable;

final readonly class MemberApproved implements DomainEvent
{
    public function __construct(
        public string $memberId,
        public MembershipNumber $membershipNumber,
        public int $approvedBy,
        private DateTimeImmutable $at,
    ) {}

    public function occurredAt(): DateTimeImmutable
    {
        return $this->at;
    }
}
