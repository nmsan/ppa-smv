<?php

namespace App\Domain\Access;

use App\Domain\Membership\Batch;

/** The person performing a use case: who they are, their roles, and their own batch. */
final readonly class Actor
{
    /** @param list<Role> $roles */
    public function __construct(
        public int $userId,
        public array $roles,
        public ?int $batchKey = null,
    ) {}

    public function has(Role $role): bool
    {
        return in_array($role, $this->roles, true);
    }

    public function canApproveApplicant(?Batch $batch): bool
    {
        if ($this->has(Role::SuperAdmin) || $this->has(Role::MembershipSecretary)) {
            return true;
        }

        return $batch !== null && $this->has(Role::BatchRepresentative) && $this->batchKey === $batch->key();
    }

    public function canReviewApplicants(): bool
    {
        return $this->has(Role::SuperAdmin)
            || $this->has(Role::MembershipSecretary)
            || $this->has(Role::BatchRepresentative);
    }
}
