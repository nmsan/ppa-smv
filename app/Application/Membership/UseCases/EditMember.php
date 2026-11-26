<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\DTO\MemberCorrectionData;
use App\Application\Ports\MemberRepository;
use App\Application\Ports\MembershipPlanRepository;
use App\Application\Shared\ConflictException;
use App\Application\Shared\ForbiddenException;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Membership\Batch;
use App\Domain\Membership\Member;
use App\Domain\Membership\MemberDetails;
use App\Domain\Membership\MemberProfile;
use App\Domain\Membership\MembershipCategory;

/** The membership secretary (or a super admin) corrects a member's record from the member list. */
final readonly class EditMember
{
    public function __construct(private MemberRepository $members, private MembershipPlanRepository $plans) {}

    /** @return array<string, mixed> what the edit form shows. The NIC itself is never returned, only whether one is on file. */
    public function details(string $memberId, Actor $actor): array
    {
        $this->authorise($actor);
        $m = $this->find($memberId);

        return [
            'id' => $m->id,
            'number' => $m->membershipNumber()?->value,
            'status' => $m->status()->value,
            'full_name' => $m->fullName,
            'email' => $m->email,
            'phone' => $m->phone,
            'whatsapp' => $m->profile->whatsapp,
            'has_nic' => $m->nic !== null,
            'ol_year' => $m->batch?->olYear,
            'al_year' => $m->batch?->alYear,
            'country' => $m->profile->country,
            'gender' => $m->profile->gender,
            'admission_number' => $m->profile->admissionNumber,
            'category' => $m->category()->value,
            'linked_account' => $m->userId !== null,
        ];
    }

    public function execute(string $memberId, MemberCorrectionData $data, Actor $actor): Member
    {
        $this->authorise($actor);
        $member = $this->find($memberId);

        $nic = $data->clearNic ? null : ($data->nic !== null ? strtoupper(preg_replace('/\s+/', '', $data->nic)) : $member->nic);
        if ($nic !== null && $nic !== $member->nic && $this->members->nicBelongsToSomeoneElse($nic, $member->id)) {
            throw new ConflictException('This NIC is already registered to another member.');
        }

        // A new plan brings its current fee; honorary has no plan and no fee.
        $fee = $data->category !== $member->category() && $data->category !== MembershipCategory::Honorary
            ? $this->plans->findByCategory($data->category)?->fee()
            : null;

        $updated = $member->correctedBySecretary(
            new MemberDetails(
                fullName: $data->fullName,
                email: $data->email,
                phone: $data->phone,
                whatsapp: $data->whatsapp,
                nic: $nic,
                batch: $data->olYear || $data->alYear ? Batch::of($data->olYear, $data->alYear) : null,
                country: $data->country,
            ),
            new MemberProfile(gender: $data->gender, admissionNumber: $data->admissionNumber),
            $data->category,
            $fee,
        );

        $this->members->save($updated);

        return $updated;
    }

    private function authorise(Actor $actor): void
    {
        if (! $actor->canEditMembers()) {
            throw new ForbiddenException('Only the membership secretary can edit member records.');
        }
    }

    private function find(string $id): Member
    {
        return $this->members->findById($id) ?? throw new NotFoundException('Member not found.');
    }
}
