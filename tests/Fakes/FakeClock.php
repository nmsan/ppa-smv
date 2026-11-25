<?php

namespace Tests\Fakes;

use App\Application\Ports\Clock;
use DateTimeImmutable;

final class FakeClock implements Clock
{
    public function __construct(public DateTimeImmutable $now = new DateTimeImmutable('2026-11-25 10:00:00')) {}

    public function now(): DateTimeImmutable
    {
        return $this->now;
    }
}
