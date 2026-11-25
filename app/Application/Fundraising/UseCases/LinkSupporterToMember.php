<?php

namespace App\Application\Fundraising\UseCases;

use App\Application\Fundraising\RequiresTreasurer;
use App\Application\Ports\MemberRepository;
use App\Application\Ports\SupporterRepository;
use App\Application\Shared\ConflictException;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Fundraising\Supporter;
use App\Domain\Membership\MembershipNumber;

/** Links a supporter to the member they are (or unlinks, with no number). */
final readonly class LinkSupporterToMember
{
    use RequiresTreasurer;

    public function __construct(private SupporterRepository $supporters, private MemberRepository $members) {}

    public function execute(string $supporterId, ?string $membershipNumber, Actor $actor): Supporter
    {
        $this->authorise($actor);
        $supporter = $this->supporters->findSupporter($supporterId) ?? throw new NotFoundException('Supporter not found.');

        $memberId = null;
        if ($membershipNumber !== null && trim($membershipNumber) !== '') {
            $member = $this->members->findByMembershipNumber(self::normalise($membershipNumber))
                ?? throw new ConflictException("No member has the number {$membershipNumber}. Check the number and try again.");
            $other = $this->supporters->findSupporterByMember($member->id);
            if ($other && $other->id !== $supporterId) {
                throw new ConflictException("{$member->fullName} is already linked to the supporter \"{$other->name}\".");
            }
            $memberId = $member->id;
        }

        $linked = $supporter->linkedTo($memberId);
        $this->supporters->saveSupporter($linked);

        return $linked;
    }

    /** "m-12", "M12", "12" → "M-012". */
    public static function normalise(string $number): string
    {
        return (string) MembershipNumber::fromSequence((int) preg_replace('/\D/', '', $number));
    }
}
