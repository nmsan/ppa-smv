<?php

namespace App\Domain\Fundraising;

use App\Domain\Shared\DomainRuleViolation;
use App\Domain\Shared\Money;
use DateTimeImmutable;

/**
 * One payment from a sponsor: a ledger line. It is never edited or deleted.
 * A mistake is voided with a reason, and the correct amount recorded again.
 */
final class Contribution
{
    private function __construct(
        public readonly string $id,
        public readonly string $supporterId,
        public readonly ContributionType $type,
        public readonly ?string $eventId,
        public readonly Money $amount,
        public readonly ?DateTimeImmutable $receivedOn,
        public readonly ?string $reference,
        public readonly ?string $note,
        public readonly ?int $recordedBy,
        private ?DateTimeImmutable $voidedAt = null,
        private ?int $voidedBy = null,
        private ?string $voidReason = null,
    ) {}

    public static function record(
        string $id,
        string $supporterId,
        ContributionType $type,
        ?string $eventId,
        Money $amount,
        ?DateTimeImmutable $receivedOn,
        ?string $reference,
        ?string $note,
        ?int $recordedBy,
        DateTimeImmutable $now,
    ): self {
        if (! $amount->isPositive()) {
            throw new DomainRuleViolation('A contribution must be more than zero.');
        }
        if ($receivedOn !== null && $receivedOn->format('Y-m-d') > $now->format('Y-m-d')) {
            throw new DomainRuleViolation('The date received cannot be in the future.');
        }

        $blank = fn (?string $v) => $v === null || trim($v) === '' ? null : trim($v);

        return new self($id, $supporterId, $type, $eventId, $amount, $receivedOn, $blank($reference), $blank($note), $recordedBy);
    }

    /** Rebuilds a stored ledger line. */
    public static function reconstitute(
        string $id, string $supporterId, ContributionType $type, ?string $eventId, Money $amount, ?DateTimeImmutable $receivedOn, ?string $reference,
        ?string $note, ?int $recordedBy, ?DateTimeImmutable $voidedAt, ?int $voidedBy, ?string $voidReason,
    ): self {
        return new self($id, $supporterId, $type, $eventId, $amount, $receivedOn, $reference, $note, $recordedBy, $voidedAt, $voidedBy, $voidReason);
    }

    public function void(string $reason, int $by, DateTimeImmutable $now): void
    {
        if ($this->voidedAt !== null) {
            throw new DomainRuleViolation('This contribution is already voided.');
        }
        if (trim($reason) === '') {
            throw new DomainRuleViolation('Say why the contribution is being voided.');
        }
        $this->voidedAt = $now;
        $this->voidedBy = $by;
        $this->voidReason = trim($reason);
    }

    public function isVoided(): bool
    {
        return $this->voidedAt !== null;
    }

    public function voidedAt(): ?DateTimeImmutable
    {
        return $this->voidedAt;
    }

    public function voidedBy(): ?int
    {
        return $this->voidedBy;
    }

    public function voidReason(): ?string
    {
        return $this->voidReason;
    }
}
