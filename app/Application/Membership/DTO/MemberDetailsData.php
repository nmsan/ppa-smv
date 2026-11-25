<?php

namespace App\Application\Membership\DTO;

final readonly class MemberDetailsData
{
    public function __construct(
        public string $fullName,
        public ?string $email,
        public ?string $phone,
        public ?string $whatsapp,
        public ?string $nic,
        public ?int $olYear,
        public ?int $alYear,
        public ?string $country,
    ) {}
}
