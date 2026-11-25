<?php

namespace App\Infrastructure\Access;

use App\Application\Ports\ActorResolver;
use App\Domain\Access\Actor;
use App\Domain\Access\Role;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Models\User;

final class EloquentActorResolver implements ActorResolver
{
    public function forUser(int $userId): Actor
    {
        $user = User::query()->findOrFail($userId);

        $roles = $user->getRoleNames()
            ->map(fn (string $name) => Role::tryFrom($name))
            ->filter()
            ->values()
            ->all();

        $batchKey = MemberModel::query()->where('user_id', $userId)->value('batch_key');

        return new Actor($userId, $roles, $batchKey);
    }
}
