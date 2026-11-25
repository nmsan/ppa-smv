<?php

namespace App\Infrastructure\System;

use App\Application\Ports\UnitOfWork;
use Illuminate\Support\Facades\DB;

final class DatabaseUnitOfWork implements UnitOfWork
{
    public function run(callable $work): mixed
    {
        return DB::transaction($work);
    }
}
