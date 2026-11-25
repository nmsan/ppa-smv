<?php

namespace App\Domain\Payments;

/** created → pending → paid | failed; paid → refunded */
enum PaymentStatus: string
{
    case Created = 'created';
    case Pending = 'pending';
    case Paid = 'paid';
    case Failed = 'failed';
    case Refunded = 'refunded';

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, match ($this) {
            self::Created => [self::Pending, self::Failed],
            self::Pending => [self::Paid, self::Failed],
            self::Paid => [self::Refunded],
            self::Failed, self::Refunded => [],
        }, true);
    }
}
