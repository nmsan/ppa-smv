<?php

namespace App\Application\Ports;

use App\Domain\Shared\DomainEvent;

interface EventDispatcher
{
    public function dispatch(DomainEvent ...$events): void;
}
