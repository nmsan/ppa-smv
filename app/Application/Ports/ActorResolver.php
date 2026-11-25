<?php

namespace App\Application\Ports;

use App\Domain\Access\Actor;

interface ActorResolver
{
    public function forUser(int $userId): Actor;
}
