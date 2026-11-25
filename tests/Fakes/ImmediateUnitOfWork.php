<?php

namespace Tests\Fakes;

use App\Application\Ports\UnitOfWork;

final class ImmediateUnitOfWork implements UnitOfWork
{
    public function run(callable $work): mixed
    {
        return $work();
    }
}
