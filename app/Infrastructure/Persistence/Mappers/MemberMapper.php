<?php

namespace App\Infrastructure\Persistence\Mappers;

use App\Domain\Membership\Batch;
use App\Domain\Membership\Member;
use App\Domain\Membership\MemberProfile;
use App\Domain\Membership\MembershipCategory;
use App\Domain\Membership\MembershipNumber;
use App\Domain\Membership\MembershipStatus;
use App\Domain\Shared\Money;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;

final class MemberMapper
{
    public static function toDomain(MemberModel $row): Member
    {
        return Member::reconstitute(
            id: $row->id,
            userId: $row->user_id,
            fullName: $row->full_name,
            email: $row->email,
            phone: $row->phone,
            nic: $row->nic,
            batch: $row->ol_year || $row->al_year ? Batch::of($row->ol_year, $row->al_year) : null,
            category: MembershipCategory::from($row->category),
            status: MembershipStatus::from($row->status),
            membershipNumber: $row->membership_number ? MembershipNumber::fromString($row->membership_number) : null,
            appliedAt: $row->applied_at,
            approvedAt: $row->approved_at,
            approvedBy: $row->approved_by,
            rejectionReason: $row->rejection_reason,
            profile: new MemberProfile(
                gender: $row->gender,
                whatsapp: $row->whatsapp,
                country: $row->country,
                admissionNumber: $row->admission_number,
                joinedVia: $row->joined_via,
                fee2024: $row->fee_2024,
            ),
            source: $row->source,
            fee: $row->fee_cents !== null ? Money::fromCents((int) $row->fee_cents) : null,
        );
    }

    /** @return array<string, mixed> */
    public static function toRow(Member $member): array
    {
        return [
            'user_id' => $member->userId,
            'membership_number' => $member->membershipNumber()?->value,
            'full_name' => $member->fullName,
            'email' => $member->email,
            'phone' => $member->phone,
            'nic' => $member->nic,
            'nic_hash' => $member->nic ? self::nicHash($member->nic) : null,
            'ol_year' => $member->batch?->olYear,
            'al_year' => $member->batch?->alYear,
            'batch_key' => $member->batch?->key(),
            'source' => $member->source,
            'gender' => $member->profile->gender,
            'whatsapp' => $member->profile->whatsapp,
            'country' => $member->profile->country,
            'admission_number' => $member->profile->admissionNumber,
            'joined_via' => $member->profile->joinedVia,
            'fee_2024' => $member->profile->fee2024,
            'category' => $member->category()->value,
            'fee_cents' => $member->fee()?->cents,
            'status' => $member->status()->value,
            'applied_at' => $member->appliedAt,
            'approved_at' => $member->approvedAt(),
            'approved_by' => $member->approvedBy(),
            'rejection_reason' => $member->rejectionReason(),
        ];
    }

    public static function nicHash(string $nic): string
    {
        return hash_hmac('sha256', strtoupper(trim($nic)), (string) config('app.key'));
    }
}
