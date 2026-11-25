<?php

namespace App\Domain\Membership;

enum MembershipCategory: string
{
    case Annual = 'annual';
    case Life = 'life';
    case Honorary = 'honorary';
}
