<?php

namespace App\Application\Membership\DTO;

final readonly class SubmitApplicationData
{
    public function __construct(
        public ?int $userId,
        public string $fullName,
        public string $email,
        public string $phone,
        public string $nic,
        public ?int $olYear,
        public ?int $alYear,
    ) {}
}
