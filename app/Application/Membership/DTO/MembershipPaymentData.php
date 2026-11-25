<?php

namespace App\Application\Membership\DTO;

use App\Domain\Membership\PaymentChannel;
use DateTimeImmutable;

final readonly class MembershipPaymentData
{
    public function __construct(
        public string $memberId,
        public int $amountCents,
        public PaymentChannel $channel,
        public DateTimeImmutable $receivedOn,
        public ?string $reference = null,
        public ?string $note = null,
    ) {}
}
