<?php

namespace App\Application\Membership;

use App\Application\Shared\ForbiddenException;
use App\Domain\Access\Actor;
use App\Domain\Access\Role;

/** Membership fees and plans are money: only the treasurer (or a super admin) changes them. */
trait RequiresTreasurer
{
    private function authorise(Actor $actor): void
    {
        if (! $actor->has(Role::Treasurer) && ! $actor->has(Role::SuperAdmin)) {
            throw new ForbiddenException('Only the treasurer can manage membership fees.');
        }
    }
}
