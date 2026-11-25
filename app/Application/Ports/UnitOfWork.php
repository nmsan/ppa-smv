<?php

namespace App\Application\Ports;

interface UnitOfWork
{
    /**
     * Runs the callback in one transaction: everything is saved, or nothing is.
     *
     * @template T
     *
     * @param  callable(): T  $work
     * @return T
     */
    public function run(callable $work): mixed;
}
