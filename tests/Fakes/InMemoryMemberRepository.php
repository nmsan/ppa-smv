<?php

namespace Tests\Fakes;

use App\Application\Ports\MemberRepository;
use App\Domain\Membership\Member;
use App\Domain\Membership\MembershipStatus;

final class InMemoryMemberRepository implements MemberRepository
{
    /** @var array<string, Member> */
    public array $members = [];

    private int $ids = 0;

    public function nextId(): string
    {
        return 'member-'.++$this->ids;
    }

    public function save(Member $member): void
    {
        $this->members[$member->id] = $member;
    }

    public function findById(string $id): ?Member
    {
        return $this->members[$id] ?? null;
    }

    public function existsByNic(string $nic): bool
    {
        foreach ($this->members as $member) {
            if ($member->nic === strtoupper(trim($nic))) {
                return true;
            }
        }

        return false;
    }

    public function nicBelongsToSomeoneElse(string $nic, string $memberId): bool
    {
        foreach ($this->members as $member) {
            if ($member->id !== $memberId && $member->nic === strtoupper(trim($nic))) {
                return true;
            }
        }

        return false;
    }

    public function findByUserId(int $userId): ?Member
    {
        foreach ($this->members as $member) {
            if ($member->userId === $userId) {
                return $member;
            }
        }

        return null;
    }

    public function findByMembershipNumber(string $number): ?Member
    {
        foreach ($this->members as $member) {
            if ((string) $member->membershipNumber() === $number) {
                return $member;
            }
        }

        return null;
    }

    public function existsByMembershipNumber(string $number): bool
    {
        foreach ($this->members as $member) {
            if ((string) $member->membershipNumber() === $number) {
                return true;
            }
        }

        return false;
    }

    public function listApplicants(?int $batchKey = null): array
    {
        return array_values(array_filter(
            $this->members,
            fn (Member $m) => $m->status() === MembershipStatus::Applied && ($batchKey === null || $m->batch?->key() === $batchKey),
        ));
    }
}
