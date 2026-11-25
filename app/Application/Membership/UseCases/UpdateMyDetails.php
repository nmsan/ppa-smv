<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\DTO\MemberDetailsData;
use App\Application\Ports\MemberRepository;
use App\Application\Shared\ConflictException;
use App\Application\Shared\NotFoundException;
use App\Domain\Membership\Batch;
use App\Domain\Membership\Member;
use App\Domain\Membership\MemberDetails;
use App\Domain\Membership\MembershipStatus;

/** A member or applicant updates their own details. The Member entity decides what is locked. */
final readonly class UpdateMyDetails
{
    public function __construct(private MemberRepository $members) {}

    public function execute(int $userId, MemberDetailsData $data): Member
    {
        $member = $this->members->findByUserId($userId) ?? throw new NotFoundException('You do not have a membership record yet.');

        // After approval the name, NIC and batch are kept as they are, whatever was sent.
        $locked = $member->status() !== MembershipStatus::Applied;

        $nic = $locked ? $member->nic : ($data->nic ? strtoupper(preg_replace('/\s+/', '', $data->nic)) : null);
        if (! $locked && $nic !== null && $nic !== $member->nic && $this->members->nicBelongsToSomeoneElse($nic, $member->id)) {
            throw new ConflictException('This NIC is already registered to another member. Please contact the secretary.');
        }

        $updated = $member->withDetails(new MemberDetails(
            fullName: $locked ? $member->fullName : $data->fullName,
            email: $data->email,
            phone: $data->phone,
            whatsapp: $data->whatsapp,
            nic: $nic,
            batch: $locked ? $member->batch : ($data->olYear || $data->alYear ? Batch::of($data->olYear, $data->alYear) : null),
            country: $data->country,
        ));

        $this->members->save($updated);

        return $updated;
    }
}
