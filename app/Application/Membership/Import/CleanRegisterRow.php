<?php

namespace App\Application\Membership\Import;

use App\Domain\Membership\Batch;
use App\Domain\Membership\MemberProfile;
use App\Domain\Membership\MembershipCategory;
use App\Domain\Membership\MembershipNumber;
use DateTimeImmutable;

/** A register row after cleaning, plus what had to be changed or dropped. */
final readonly class CleanRegisterRow
{
    /** @param list<string> $issues */
    public function __construct(
        public int $line,
        public ?MembershipNumber $number,
        public MembershipCategory $category,
        public string $fullName,
        public ?string $email,
        public ?string $phone,
        public ?string $nic,
        public ?Batch $batch,
        public MemberProfile $profile,
        public ?DateTimeImmutable $registeredAt,
        public array $issues,
    ) {}
}
