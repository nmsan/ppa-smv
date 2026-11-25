<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\DTO\ApplicantView;
use App\Application\Ports\MemberRepository;
use App\Application\Shared\ForbiddenException;
use App\Domain\Access\Actor;
use App\Domain\Access\Role;

/** Applicants waiting for approval. Batch representatives see only their own batch. */
final readonly class ListApplicants
{
    public function __construct(private MemberRepository $members) {}

    /** @return list<ApplicantView> */
    public function execute(Actor $actor): array
    {
        if (! $actor->canReviewApplicants()) {
            throw new ForbiddenException('You cannot review applicants.');
        }

        $seesAll = $actor->has(Role::SuperAdmin) || $actor->has(Role::MembershipSecretary);
        $applicants = $this->members->listApplicants($seesAll ? null : $actor->batchKey);

        return array_map(
            fn ($member) => ApplicantView::from($member, $actor->canApproveApplicant($member->batch)),
            $applicants,
        );
    }
}
