<?php

namespace App\Application\Ports;

use App\Domain\Membership\Member;

interface MemberRepository
{
    public function nextId(): string;

    public function save(Member $member): void;

    public function findById(string $id): ?Member;

    public function existsByNic(string $nic): bool;

    public function nicBelongsToSomeoneElse(string $nic, string $memberId): bool;

    public function findByUserId(int $userId): ?Member;

    public function findByMembershipNumber(string $number): ?Member;

    public function existsByMembershipNumber(string $number): bool;

    /** @return list<Member> */
    public function listApplicants(?int $batchKey = null): array;
}
