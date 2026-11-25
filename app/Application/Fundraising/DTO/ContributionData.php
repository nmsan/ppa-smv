<?php

namespace App\Application\Fundraising\DTO;

use App\Domain\Fundraising\ContributionType;
use DateTimeImmutable;

final readonly class ContributionData
{
    /** Either an existing $eventId, or $newEventName to create one, or neither (general). */
    public function __construct(
        public string $supporterId,
        public ContributionType $type,
        public int $amountCents,
        public ?DateTimeImmutable $receivedOn,
        public ?string $eventId = null,
        public ?string $newEventName = null,
        public ?string $reference = null,
        public ?string $note = null,
    ) {}
}
