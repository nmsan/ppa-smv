<?php

namespace Tests\Fakes;

use App\Application\Ports\MembershipNumberGenerator;
use App\Domain\Membership\MembershipNumber;

final class SequenceNumberGenerator implements MembershipNumberGenerator
{
    public function __construct(private int $last = 0) {}

    public function next(): MembershipNumber
    {
        return MembershipNumber::fromSequence(++$this->last);
    }
}
