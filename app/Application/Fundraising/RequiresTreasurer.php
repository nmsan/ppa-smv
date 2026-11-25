<?php

namespace App\Application\Fundraising;

use App\Application\Shared\ForbiddenException;
use App\Domain\Access\Actor;
use App\Domain\Access\Role;

trait RequiresTreasurer
{
    private function authorise(Actor $actor): void
    {
        if (! $actor->has(Role::Treasurer) && ! $actor->has(Role::SuperAdmin)) {
            throw new ForbiddenException('Only the treasurer can change supporter accounts.');
        }
    }
}
