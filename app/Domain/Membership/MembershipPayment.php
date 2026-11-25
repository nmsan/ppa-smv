<?php

namespace App\Domain\Membership;

use App\Domain\Shared\DomainRuleViolation;
use App\Domain\Shared\Money;
use DateTimeImmutable;

/**
 * A membership fee an office bearer collected and the treasurer recorded.
 * A ledger line: never edited. Online payments will be recorded the same way.
 */
final readonly class MembershipPayment
{
    private function __construct(
        public string $id,
        public string $memberId,
        public MembershipCategory $category,
        public Money $amount,
        public PaymentChannel $channel,
        public DateTimeImmutable $receivedOn,
        public ?string $reference,
        public ?string $note,
        public ?int $recordedBy,
    ) {}

    public static function record(
        string $id,
        string $memberId,
        MembershipCategory $category,
        Money $amount,
        PaymentChannel $channel,
        DateTimeImmutable $receivedOn,
        ?string $reference,
        ?string $note,
        ?int $recordedBy,
        DateTimeImmutable $now,
    ): self {
        if (! $amount->isPositive()) {
            throw new DomainRuleViolation('The amount must be more than zero.');
        }
        if ($receivedOn->format('Y-m-d') > $now->format('Y-m-d')) {
            throw new DomainRuleViolation('The date received cannot be in the future.');
        }

        $blank = fn (?string $v) => $v === null || trim($v) === '' ? null : trim($v);

        return new self($id, $memberId, $category, $amount, $channel, $receivedOn, $blank($reference), $blank($note), $recordedBy);
    }
}
