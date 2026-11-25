<?php

namespace App\Domain\Membership;

/** Optional details about a member. All may be unknown, especially for imported members. */
final readonly class MemberProfile
{
    public function __construct(
        public ?string $gender = null,
        public ?string $whatsapp = null,
        public ?string $country = null,
        public ?string $admissionNumber = null,
        public ?string $joinedVia = null,
        public ?string $fee2024 = null,
    ) {}
}
