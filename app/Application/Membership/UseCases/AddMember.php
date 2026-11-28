<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\DTO\MemberCorrectionData;
use App\Application\Ports\Clock;
use App\Application\Ports\EventDispatcher;
use App\Application\Ports\MemberRepository;
use App\Application\Ports\MembershipNumberGenerator;
use App\Application\Ports\MembershipPlanRepository;
use App\Application\Ports\UnitOfWork;
use App\Application\Shared\ConflictException;
use App\Application\Shared\ForbiddenException;
use App\Domain\Access\Actor;
use App\Domain\Membership\Batch;
use App\Domain\Membership\Member;
use App\Domain\Membership\MemberDetails;
use App\Domain\Membership\MemberProfile;
use App\Domain\Membership\MembershipCategory;

/**
 * The membership secretary (or a super admin) adds a member from the admin
 * portal, for people who join in person rather than through the website.
 * $giveNumber approves them at once with the next membership number.
 */
final readonly class AddMember
{
    public function __construct(
        private MemberRepository $members,
        private MembershipPlanRepository $plans,
        private MembershipNumberGenerator $numbers,
        private UnitOfWork $unitOfWork,
        private Clock $clock,
        private EventDispatcher $events,
    ) {}

    public function execute(MemberCorrectionData $data, bool $giveNumber, Actor $actor): Member
    {
        if (! $actor->canEditMembers()) {
            throw new ForbiddenException('Only the membership secretary can add members.');
        }

        $nic = $data->nic !== null ? strtoupper(preg_replace('/\s+/', '', $data->nic)) : null;
        if ($nic !== null && $this->members->existsByNic($nic)) {
            throw new ConflictException('This NIC is already registered to another member. Search for them in the list instead.');
        }

        // Honorary membership has no plan and no fee; the others take the plan's current fee.
        $fee = $data->category === MembershipCategory::Honorary ? null : $this->plans->findByCategory($data->category)?->fee();

        $member = $this->unitOfWork->run(function () use ($data, $nic, $fee, $giveNumber, $actor): Member {
            $member = Member::addedBySecretary(
                $this->members->nextId(),
                new MemberDetails(
                    fullName: $data->fullName,
                    email: $data->email,
                    phone: $data->phone,
                    whatsapp: $data->whatsapp,
                    nic: $nic,
                    batch: Batch::of($data->olYear, $data->alYear),
                    country: $data->country,
                ),
                new MemberProfile(gender: $data->gender, admissionNumber: $data->admissionNumber),
                $data->category,
                $fee,
                $giveNumber ? $this->numbers->next() : null,
                $actor->userId,
                $this->clock->now(),
            );
            $this->members->save($member);

            return $member;
        });

        $this->events->dispatch(...$member->releaseEvents());

        return $member;
    }
}
