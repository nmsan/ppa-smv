<?php

namespace App\Application\Fundraising\UseCases;

use App\Application\Fundraising\DTO\SupporterData;
use App\Application\Fundraising\RequiresTreasurer;
use App\Application\Ports\MemberRepository;
use App\Application\Ports\SupporterRepository;
use App\Application\Shared\ConflictException;
use App\Domain\Access\Actor;
use App\Domain\Fundraising\Supporter;
use App\Domain\Fundraising\SupporterKind;

/** Opens an account for a sponsor or donor. Given a membership number, it is linked to that member. */
final readonly class CreateSupporter
{
    use RequiresTreasurer;

    public function __construct(private SupporterRepository $supporters, private MemberRepository $members) {}

    public function execute(SupporterData $d, Actor $actor): Supporter
    {
        $this->authorise($actor);

        $memberId = null;
        $name = $d->name;
        if ($d->membershipNumber) {
            $member = $this->members->findByMembershipNumber(LinkSupporterToMember::normalise($d->membershipNumber))
                ?? throw new ConflictException("No member has the number {$d->membershipNumber}. Check the number and try again.");
            if ($existing = $this->supporters->findSupporterByMember($member->id)) {
                throw new ConflictException("{$member->fullName} already has a supporter account ({$existing->name}). Add the contribution there.");
            }
            $memberId = $member->id;
            $name = trim($name) !== '' ? $name : $member->fullName;
        }

        if ($this->supporters->findSupporterByName($name)) {
            throw new ConflictException("A supporter called \"{$name}\" already exists. Add the contribution to their account instead.");
        }

        $supporter = Supporter::create(
            $this->supporters->nextId(), $name, $memberId ? SupporterKind::Individual : $d->kind, $memberId,
            $d->contactName, $d->phone, $d->email, $d->publicNote, $d->notes, $d->showPublicly,
        );
        $this->supporters->saveSupporter($supporter);

        return $supporter;
    }
}
