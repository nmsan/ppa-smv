<?php

namespace App\Application\Membership\DTO;

use App\Domain\Membership\Member;

/** What the admin screen may show about an applicant. Deliberately excludes the NIC. */
final readonly class ApplicantView
{
    public function __construct(
        public string $id,
        public string $fullName,
        public string $email,
        public ?int $olYear,
        public ?int $alYear,
        public ?int $batchKey,
        public string $appliedAt,
        public bool $canApprove,
    ) {}

    public static function from(Member $member, bool $canApprove): self
    {
        return new self(
            $member->id,
            $member->fullName,
            $member->email,
            $member->batch?->olYear,
            $member->batch?->alYear,
            $member->batch?->key(),
            $member->appliedAt->format('Y-m-d'),
            $canApprove,
        );
    }
}
