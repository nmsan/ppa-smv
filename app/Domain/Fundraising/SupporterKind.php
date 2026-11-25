<?php

namespace App\Domain\Fundraising;

enum SupporterKind: string
{
    case Business = 'business';
    case Individual = 'individual';
}
