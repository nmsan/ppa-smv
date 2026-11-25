<?php

namespace App\Application\Ports;

use App\Domain\Membership\MembershipNumber;

interface MembershipNumberGenerator
{
    /** Must be called inside a UnitOfWork so two approvals never get the same number. */
    public function next(): MembershipNumber;
}
