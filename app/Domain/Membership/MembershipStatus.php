<?php

namespace App\Domain\Membership;

/**
 * applied → approved → active → expiring → lapsed
 *         ↘ rejected            ↖ renewed ↙
 */
enum MembershipStatus: string
{
    case Applied = 'applied';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Active = 'active';
    case Expiring = 'expiring';
    case Lapsed = 'lapsed';

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, match ($this) {
            self::Applied => [self::Approved, self::Rejected],
            self::Approved => [self::Active],
            self::Active => [self::Expiring],
            self::Expiring => [self::Active, self::Lapsed],
            self::Lapsed => [self::Active],
            self::Rejected => [],
        }, true);
    }
}
