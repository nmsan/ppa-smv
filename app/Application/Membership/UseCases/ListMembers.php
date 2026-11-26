<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\DTO\MemberListQuery;
use App\Application\Ports\MemberDirectory;
use App\Application\Shared\ForbiddenException;
use App\Domain\Access\Actor;
use App\Domain\Access\Role;

/** The member list. Super admins and the membership secretary see everyone; batch representatives see only their own batch. */
final readonly class ListMembers
{
    public function __construct(private MemberDirectory $directory) {}

    /** @return array{members: array<string, mixed>, options: array{batches: list<int>, countries: list<string>}, lockedBatch: ?int} */
    public function execute(MemberListQuery $query, Actor $actor): array
    {
        if (! $actor->canReviewApplicants()) {
            throw new ForbiddenException('You cannot view the member list.');
        }

        $seesAll = $actor->has(Role::SuperAdmin) || $actor->has(Role::MembershipSecretary);
        $lockedBatch = $seesAll ? null : $actor->batchKey;

        if (! $seesAll && $lockedBatch === null) {
            throw new ForbiddenException('Your account is not linked to a batch yet.');
        }

        if ($lockedBatch !== null) {
            $query = $query->forBatch($lockedBatch);
        }

        return [
            'members' => $this->directory->page($query),
            'options' => $this->directory->filterOptions($lockedBatch),
            'lockedBatch' => $lockedBatch,
        ];
    }
}
