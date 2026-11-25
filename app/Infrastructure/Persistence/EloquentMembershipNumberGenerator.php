<?php

namespace App\Infrastructure\Persistence;

use App\Application\Ports\MembershipNumberGenerator;
use App\Domain\Membership\MembershipNumber;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;

/** Continues after the highest existing number, including imported legacy numbers. */
final class EloquentMembershipNumberGenerator implements MembershipNumberGenerator
{
    public function next(): MembershipNumber
    {
        $highest = MemberModel::query()
            ->whereNotNull('membership_number')
            ->lockForUpdate()
            ->pluck('membership_number')
            ->map(fn (string $n) => MembershipNumber::fromString($n)->sequence())
            ->max() ?? 0;

        return MembershipNumber::fromSequence($highest + 1);
    }
}
