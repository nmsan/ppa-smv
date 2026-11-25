<?php

namespace App\Infrastructure\Persistence;

use App\Application\Ports\MemberRepository;
use App\Domain\Membership\Member;
use App\Domain\Membership\MembershipStatus;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Infrastructure\Persistence\Mappers\MemberMapper;
use Illuminate\Support\Str;

final class EloquentMemberRepository implements MemberRepository
{
    public function nextId(): string
    {
        return (string) Str::ulid();
    }

    public function save(Member $member): void
    {
        MemberModel::query()->updateOrCreate(['id' => $member->id], MemberMapper::toRow($member));
    }

    public function findById(string $id): ?Member
    {
        $row = MemberModel::query()->find($id);

        return $row ? MemberMapper::toDomain($row) : null;
    }

    public function existsByNic(string $nic): bool
    {
        return MemberModel::query()->where('nic_hash', MemberMapper::nicHash($nic))->exists();
    }

    public function nicBelongsToSomeoneElse(string $nic, string $memberId): bool
    {
        return MemberModel::query()->where('nic_hash', MemberMapper::nicHash($nic))->where('id', '!=', $memberId)->exists();
    }

    public function findByUserId(int $userId): ?Member
    {
        $row = MemberModel::query()->where('user_id', $userId)->first();

        return $row ? MemberMapper::toDomain($row) : null;
    }

    public function findByMembershipNumber(string $number): ?Member
    {
        $row = MemberModel::query()->where('membership_number', $number)->first();

        return $row ? MemberMapper::toDomain($row) : null;
    }

    public function existsByMembershipNumber(string $number): bool
    {
        return MemberModel::query()->where('membership_number', $number)->exists();
    }

    public function listApplicants(?int $batchKey = null): array
    {
        return MemberModel::query()
            ->where('status', MembershipStatus::Applied->value)
            ->when($batchKey !== null, fn ($q) => $q->where('batch_key', $batchKey))
            ->orderBy('applied_at')
            ->get()
            ->map(fn (MemberModel $row) => MemberMapper::toDomain($row))
            ->all();
    }
}
