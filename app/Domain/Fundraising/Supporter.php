<?php

namespace App\Domain\Fundraising;

use App\Domain\Shared\DomainRuleViolation;

/**
 * A business or person who supports the association with sponsorships or
 * donations. A person may also be a member; linking the two shows their batch
 * publicly and their giving on their own My membership page.
 */
final readonly class Supporter
{
    private function __construct(
        public string $id,
        public string $name,
        public SupporterKind $kind,
        public ?string $memberId,
        public ?string $contactName,
        public ?string $phone,
        public ?string $email,
        public ?string $publicNote,
        public ?string $notes,
        public bool $showPublicly,
    ) {}

    public static function create(
        string $id,
        string $name,
        SupporterKind $kind,
        ?string $memberId = null,
        ?string $contactName = null,
        ?string $phone = null,
        ?string $email = null,
        ?string $publicNote = null,
        ?string $notes = null,
        bool $showPublicly = true,
    ): self {
        $name = trim(preg_replace('/\s+/', ' ', $name));
        if ($name === '') {
            throw new DomainRuleViolation('A supporter needs a name.');
        }
        if ($memberId !== null && $kind !== SupporterKind::Individual) {
            throw new DomainRuleViolation('Only an individual can be linked to a membership.');
        }

        $blank = fn (?string $v) => $v === null || trim($v) === '' ? null : trim($v);

        return new self($id, $name, $kind, $memberId, $blank($contactName), $blank($phone), $blank($email) ? strtolower(trim($email)) : null, $blank($publicNote), $blank($notes), $showPublicly);
    }

    public function withDetails(string $name, SupporterKind $kind, ?string $contactName, ?string $phone, ?string $email, ?string $publicNote, ?string $notes, bool $showPublicly): self
    {
        return self::create($this->id, $name, $kind, $kind === SupporterKind::Individual ? $this->memberId : null, $contactName, $phone, $email, $publicNote, $notes, $showPublicly);
    }

    public function linkedTo(?string $memberId): self
    {
        return self::create($this->id, $this->name, $memberId ? SupporterKind::Individual : $this->kind, $memberId, $this->contactName, $this->phone, $this->email, $this->publicNote, $this->notes, $this->showPublicly);
    }
}
