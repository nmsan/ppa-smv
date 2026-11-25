<?php

namespace App\Domain\Membership;

use App\Domain\Membership\Events\ApplicationSubmitted;
use App\Domain\Membership\Events\MemberApproved;
use App\Domain\Shared\DomainEvent;
use App\Domain\Shared\DomainRuleViolation;
use DateTimeImmutable;

final class Member
{
    /** @var list<DomainEvent> */
    private array $events = [];

    private function __construct(
        public readonly string $id,
        public readonly ?int $userId,
        public readonly string $fullName,
        public readonly ?string $email,
        public readonly ?string $phone,
        public readonly ?string $nic,
        public readonly ?Batch $batch,
        private MembershipCategory $category,
        private MembershipStatus $status,
        private ?MembershipNumber $membershipNumber,
        public readonly DateTimeImmutable $appliedAt,
        private ?DateTimeImmutable $approvedAt,
        private ?int $approvedBy,
        private ?string $rejectionReason,
        public readonly MemberProfile $profile = new MemberProfile,
        public readonly string $source = 'application',
    ) {}

    public static function apply(
        string $id,
        ?int $userId,
        string $fullName,
        string $email,
        string $phone,
        string $nic,
        Batch $batch,
        DateTimeImmutable $now,
    ): self {
        if (trim($fullName) === '') {
            throw new DomainRuleViolation('Full name is required.');
        }

        $member = new self(
            $id, $userId, trim($fullName), strtolower(trim($email)), trim($phone), strtoupper(trim($nic)),
            $batch, MembershipCategory::Annual, MembershipStatus::Applied, null, $now, null, null, null,
        );
        $member->record(new ApplicationSubmitted($id, $now));

        return $member;
    }

    /** Rebuilds a member from storage. Records no events. */
    public static function reconstitute(
        string $id,
        ?int $userId,
        string $fullName,
        ?string $email,
        ?string $phone,
        ?string $nic,
        ?Batch $batch,
        MembershipCategory $category,
        MembershipStatus $status,
        ?MembershipNumber $membershipNumber,
        DateTimeImmutable $appliedAt,
        ?DateTimeImmutable $approvedAt,
        ?int $approvedBy,
        ?string $rejectionReason,
        MemberProfile $profile = new MemberProfile,
        string $source = 'application',
    ): self {
        return new self(
            $id, $userId, $fullName, $email, $phone, $nic, $batch, $category, $status,
            $membershipNumber, $appliedAt, $approvedAt, $approvedBy, $rejectionReason, $profile, $source,
        );
    }

    /**
     * A person carried over from the old Google Sheet register. With a
     * membership number they start approved (not active: no fee has been paid
     * through the platform yet). Without one they wait as an applicant.
     */
    public static function fromRegister(
        string $id,
        ?MembershipNumber $number,
        MembershipCategory $category,
        string $fullName,
        ?string $email,
        ?string $phone,
        ?string $nic,
        ?Batch $batch,
        MemberProfile $profile,
        DateTimeImmutable $registeredAt,
    ): self {
        if (trim($fullName) === '') {
            throw new DomainRuleViolation('Full name is required.');
        }

        return new self(
            $id, null, trim($fullName), $email ? strtolower(trim($email)) : null, $phone, $nic ? strtoupper(trim($nic)) : null,
            $batch, $category, $number ? MembershipStatus::Approved : MembershipStatus::Applied, $number,
            $registeredAt, null, null, null, $profile, 'register',
        );
    }

    public function approve(MembershipNumber $number, int $approverId, DateTimeImmutable $now): void
    {
        $this->moveTo(MembershipStatus::Approved);
        $this->membershipNumber = $number;
        $this->approvedAt = $now;
        $this->approvedBy = $approverId;
        $this->record(new MemberApproved($this->id, $number, $approverId, $now));
    }

    /**
     * The person's own update. While waiting for approval everything can be
     * corrected. After approval the name, NIC and batch are locked: the batch
     * decides who approves and the NIC identifies the person, so only the
     * secretary changes those.
     */
    public function withDetails(MemberDetails $d): self
    {
        $name = trim(preg_replace('/\s+/', ' ', $d->fullName));
        $nic = $d->nic ? strtoupper(preg_replace('/\s+/', '', $d->nic)) : null;

        if ($name === '') {
            throw new DomainRuleViolation('Full name is required.');
        }

        if ($this->status !== MembershipStatus::Applied) {
            $batchChanged = ($this->batch?->key()) !== ($d->batch?->key())
                || $this->batch?->olYear !== $d->batch?->olYear
                || $this->batch?->alYear !== $d->batch?->alYear;

            if ($name !== $this->fullName || $nic !== $this->nic || $batchChanged) {
                throw new DomainRuleViolation('Your name, NIC and batch years can only be changed by the membership secretary.');
            }
        }

        return $this->copy([
            'fullName' => $name,
            'email' => $d->email ? strtolower(trim($d->email)) : null,
            'phone' => $d->phone ? trim($d->phone) : null,
            'nic' => $nic,
            'batch' => $d->batch,
            'profile' => new MemberProfile(
                gender: $this->profile->gender,
                whatsapp: $d->whatsapp ? trim($d->whatsapp) : null,
                country: $d->country ? trim($d->country) : null,
                admissionNumber: $this->profile->admissionNumber,
                joinedVia: $this->profile->joinedVia,
                fee2024: $this->profile->fee2024,
            ),
        ]);
    }

    /** Links a record from the old register to the account of the person it belongs to. */
    public function linkToAccount(int $userId, ?string $accountEmail): self
    {
        if ($this->userId !== null) {
            throw new DomainRuleViolation('This membership is already linked to an account.');
        }

        return $this->copy([
            'userId' => $userId,
            'email' => $this->email ?? ($accountEmail ? strtolower(trim($accountEmail)) : null),
        ]);
    }

    /** Whether the phone number or NIC given matches this record, to prove a claim. */
    public function matchesClaim(?string $phone, ?string $nic): bool
    {
        $digits = fn (?string $v) => $v === null ? '' : ltrim(preg_replace('/\D/', '', $v), '0');
        $phoneMatches = $phone !== null && $this->phone !== null && strlen($digits($phone)) >= 9
            && (str_ends_with($digits($this->phone), $digits($phone)) || str_ends_with($digits($phone), $digits($this->phone)));
        $nicMatches = $nic !== null && $this->nic !== null
            && strtoupper(preg_replace('/\s+/', '', $nic)) === $this->nic;

        return $phoneMatches || $nicMatches;
    }

    public function isMember(): bool
    {
        return in_array($this->status, [MembershipStatus::Approved, MembershipStatus::Active, MembershipStatus::Expiring], true);
    }

    public function reject(string $reason): void
    {
        if (trim($reason) === '') {
            throw new DomainRuleViolation('A rejection reason is required.');
        }
        $this->moveTo(MembershipStatus::Rejected);
        $this->rejectionReason = trim($reason);
    }

    public function assignCategory(MembershipCategory $category): void
    {
        $this->category = $category;
    }

    public function status(): MembershipStatus
    {
        return $this->status;
    }

    public function category(): MembershipCategory
    {
        return $this->category;
    }

    public function membershipNumber(): ?MembershipNumber
    {
        return $this->membershipNumber;
    }

    public function approvedAt(): ?DateTimeImmutable
    {
        return $this->approvedAt;
    }

    public function approvedBy(): ?int
    {
        return $this->approvedBy;
    }

    public function rejectionReason(): ?string
    {
        return $this->rejectionReason;
    }

    /** @return list<DomainEvent> */
    public function releaseEvents(): array
    {
        $events = $this->events;
        $this->events = [];

        return $events;
    }

    /** @param array<string, mixed> $changes */
    private function copy(array $changes): self
    {
        $copy = new self(
            id: $this->id,
            userId: array_key_exists('userId', $changes) ? $changes['userId'] : $this->userId,
            fullName: $changes['fullName'] ?? $this->fullName,
            email: array_key_exists('email', $changes) ? $changes['email'] : $this->email,
            phone: array_key_exists('phone', $changes) ? $changes['phone'] : $this->phone,
            nic: array_key_exists('nic', $changes) ? $changes['nic'] : $this->nic,
            batch: array_key_exists('batch', $changes) ? $changes['batch'] : $this->batch,
            category: $this->category,
            status: $this->status,
            membershipNumber: $this->membershipNumber,
            appliedAt: $this->appliedAt,
            approvedAt: $this->approvedAt,
            approvedBy: $this->approvedBy,
            rejectionReason: $this->rejectionReason,
            profile: $changes['profile'] ?? $this->profile,
            source: $this->source,
        );
        $copy->events = $this->events;

        return $copy;
    }

    private function moveTo(MembershipStatus $next): void
    {
        if (! $this->status->canTransitionTo($next)) {
            throw new DomainRuleViolation("Cannot move a member from {$this->status->value} to {$next->value}.");
        }
        $this->status = $next;
    }

    private function record(DomainEvent $event): void
    {
        $this->events[] = $event;
    }
}
