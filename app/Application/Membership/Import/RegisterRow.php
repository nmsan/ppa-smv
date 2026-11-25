<?php

namespace App\Application\Membership\Import;

/** One row of the old Google Sheet register, as text, before cleaning. */
final readonly class RegisterRow
{
    public function __construct(
        public int $line,
        public ?string $membershipNumber,
        public ?string $category,
        public ?string $joinedVia,
        public ?string $fee2024,
        public ?string $timestamp,
        public ?string $fullName,
        public ?string $gender,
        public ?string $phone,
        public ?string $whatsapp,
        public ?string $nic,
        public ?string $email,
        public ?string $country,
        public ?string $admissionNumber,
        public ?string $olYear,
        public ?string $alYear,
    ) {}
}
