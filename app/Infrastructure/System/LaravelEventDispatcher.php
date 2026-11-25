<?php

namespace App\Infrastructure\System;

use App\Application\Ports\EventDispatcher;
use App\Domain\Shared\DomainEvent;

/** Hands domain events to Laravel's event system, so listeners can react to them. */
final class LaravelEventDispatcher implements EventDispatcher
{
    public function dispatch(DomainEvent ...$events): void
    {
        foreach ($events as $event) {
            event($event);
        }
    }
}
