<?php

namespace App\Application\Membership\UseCases;

use App\Application\Ports\Clock;
use App\Application\Ports\EventDispatcher;
use App\Application\Ports\MemberRepository;
use App\Application\Ports\MembershipNumberGenerator;
use App\Application\Ports\Notifier;
use App\Application\Ports\UnitOfWork;
use App\Application\Shared\ForbiddenException;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Membership\Member;

final readonly class ApproveApplicant
{
    public function __construct(
        private MemberRepository $members,
        private MembershipNumberGenerator $numbers,
        private UnitOfWork $unitOfWork,
        private Clock $clock,
        private EventDispatcher $events,
        private Notifier $notifier,
    ) {}

    public function execute(string $applicantId, Actor $actor): Member
    {
        $member = $this->unitOfWork->run(function () use ($applicantId, $actor): Member {
            $member = $this->members->findById($applicantId)
                ?? throw new NotFoundException('Applicant not found.');

            if (! $actor->canApproveApplicant($member->batch)) {
                throw new ForbiddenException('You can only approve applicants from your own batch.');
            }

            $member->approve($this->numbers->next(), $actor->userId, $this->clock->now());
            $this->members->save($member);

            return $member;
        });

        $this->events->dispatch(...$member->releaseEvents());
        $this->notifier->notifyMember($member->id, 'membership.approved', [
            'membership_number' => (string) $member->membershipNumber(),
        ]);

        return $member;
    }
}
