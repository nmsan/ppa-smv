<?php

namespace App\Application\Membership\DTO;

use App\Domain\Membership\Member;
use App\Domain\Membership\MembershipStatus;

/** What a person sees about their own membership. */
final readonly class MyMembershipView
{
    public function __construct(
        public string $id,
        public string $status,
        public ?string $number,
        public string $category,
        public bool $locked,
        public string $fullName,
        public ?string $email,
        public ?string $phone,
        public ?string $whatsapp,
        public ?string $nic,
        public ?int $olYear,
        public ?int $alYear,
        public ?int $batchKey,
        public ?string $country,
        public string $since,
        public bool $fromRegister,
        public ?int $feeCents = null,
    ) {}

    public static function from(Member $m): self
    {
        $locked = $m->status() !== MembershipStatus::Applied;

        return new self(
            id: $m->id,
            status: $m->status()->value,
            number: $m->membershipNumber()?->value,
            category: $m->category()->value,
            locked: $locked,
            fullName: $m->fullName,
            email: $m->email,
            phone: $m->phone,
            whatsapp: $m->profile->whatsapp,
            // Once locked, show only the last digits so it is not on screen in full.
            nic: $locked && $m->nic ? str_repeat('•', max(0, strlen($m->nic) - 4)).substr($m->nic, -4) : $m->nic,
            olYear: $m->batch?->olYear,
            alYear: $m->batch?->alYear,
            batchKey: $m->batch?->key(),
            country: $m->profile->country,
            since: ($m->approvedAt() ?? $m->appliedAt)->format('Y-m-d'),
            fromRegister: $m->source === 'register',
            feeCents: $m->fee()?->cents,
        );
    }
}
