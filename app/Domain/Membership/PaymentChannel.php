<?php

namespace App\Domain\Membership;

/** How an office bearer collected a membership fee. Online payment can be added here later. */
enum PaymentChannel: string
{
    case Cash = 'cash';
    case BankTransfer = 'bank_transfer';
    case Cheque = 'cheque';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Cash',
            self::BankTransfer => 'Bank transfer or deposit',
            self::Cheque => 'Cheque',
            self::Other => 'Other',
        };
    }
}
