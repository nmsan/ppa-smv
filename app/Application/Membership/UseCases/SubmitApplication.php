<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\DTO\SubmitApplicationData;
use App\Application\Ports\Clock;
use App\Application\Ports\EventDispatcher;
use App\Application\Ports\MemberRepository;
use App\Application\Shared\ConflictException;
use App\Domain\Membership\Batch;
use App\Domain\Membership\Member;

final readonly class SubmitApplication
{
    public function __construct(
        private MemberRepository $members,
        private Clock $clock,
        private EventDispatcher $events,
    ) {}

    /** @return string the new member's id */
    public function execute(SubmitApplicationData $data): string
    {
        if ($data->userId !== null && $this->members->findByUserId($data->userId)) {
            throw new ConflictException('You already have a membership record.');
        }

        if ($this->members->existsByNic($data->nic)) {
            throw new ConflictException('This NIC is already registered. If you are already a member, use "Find my record" instead.');
        }

        $member = Member::apply(
            $this->members->nextId(),
            $data->userId,
            $data->fullName,
            $data->email,
            $data->phone,
            $data->nic,
            Batch::of($data->olYear, $data->alYear),
            $this->clock->now(),
        );

        $this->members->save($member);
        $this->events->dispatch(...$member->releaseEvents());

        return $member->id;
    }
}
