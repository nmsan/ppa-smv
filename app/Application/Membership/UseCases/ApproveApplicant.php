<?php

namespace App\Application\Membership\UseCases;

use App\Application\Ports\Clock;
use App\Application\Ports\EventDispatcher;
use App\Application\Ports\MemberRepository;
use App\Application\Ports\MembershipNumberGenerator;
use App\Application\Ports\MembershipPlanRepository;
use App\Application\Ports\Notifier;
use App\Application\Ports\UnitOfWork;
use App\Application\Shared\ForbiddenException;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Membership\Member;
use App\Domain\Membership\MembershipCategory;

final readonly class ApproveApplicant
{
    public function __construct(
        private MemberRepository $members,
        private MembershipNumberGenerator $numbers,
        private MembershipPlanRepository $plans,
        private UnitOfWork $unitOfWork,
        private Clock $clock,
        private EventDispatcher $events,
        private Notifier $notifier,
    ) {}

    /** $as: approve on another plan than the one requested (for example annual instead of life). */
    public function execute(string $applicantId, Actor $actor, ?MembershipCategory $as = null): Member
    {
        $member = $this->unitOfWork->run(function () use ($applicantId, $actor, $as): Member {
            $member = $this->members->findById($applicantId)
                ?? throw new NotFoundException('Applicant not found.');

            if (! $actor->canApproveApplicant($member->batch)) {
                throw new ForbiddenException('You can only approve applicants from your own batch.');
            }

            $plan = $as ? ($this->plans->findByCategory($as) ?? throw new NotFoundException('Membership plan not found.')) : null;
            $member->approve($this->numbers->next(), $actor->userId, $this->clock->now(), $plan);
            $this->members->save($member);

            return $member;
        });

        $this->events->dispatch(...$member->releaseEvents());
        $this->notifier->notifyMember($member->id, 'membership.approved', [
            'membership_number' => (string) $member->membershipNumber(),
            'category' => $member->category()->value,
            'fee' => $member->fee()?->format(),
        ]);

        return $member;
    }
}
