<?php

namespace App\Domain\Membership;

/** The details a person keeps up to date about themselves. */
final readonly class MemberDetails
{
    public function __construct(
        public string $fullName,
        public ?string $email,
        public ?string $phone,
        public ?string $whatsapp,
        public ?string $nic,
        public ?Batch $batch,
        public ?string $country,
    ) {}
}
