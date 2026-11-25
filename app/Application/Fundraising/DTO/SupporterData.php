<?php

namespace App\Application\Fundraising\DTO;

use App\Domain\Fundraising\SupporterKind;

final readonly class SupporterData
{
    public function __construct(
        public string $name,
        public SupporterKind $kind,
        public ?string $contactName = null,
        public ?string $phone = null,
        public ?string $email = null,
        public ?string $publicNote = null,
        public ?string $notes = null,
        public bool $showPublicly = true,
        /** Set when the supporter is a member: the account is linked to their record. */
        public ?string $membershipNumber = null,
    ) {}
}
