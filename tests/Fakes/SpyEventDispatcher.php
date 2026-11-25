<?php

namespace Tests\Fakes;

use App\Application\Ports\EventDispatcher;
use App\Domain\Shared\DomainEvent;

final class SpyEventDispatcher implements EventDispatcher
{
    /** @var list<DomainEvent> */
    public array $dispatched = [];

    public function dispatch(DomainEvent ...$events): void
    {
        array_push($this->dispatched, ...$events);
    }
}
