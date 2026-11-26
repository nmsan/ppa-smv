<?php

namespace App\Application\Membership\DTO;

use App\Domain\Membership\MembershipCategory;

/** The secretary's corrections to a member record. A null $nic keeps the NIC on file; $clearNic removes it. */
final readonly class MemberCorrectionData
{
    public function __construct(
        public string $fullName,
        public ?string $email,
        public ?string $phone,
        public ?string $whatsapp,
        public ?string $nic,
        public bool $clearNic,
        public ?int $olYear,
        public ?int $alYear,
        public ?string $country,
        public ?string $gender,
        public ?string $admissionNumber,
        public MembershipCategory $category,
    ) {}
}
