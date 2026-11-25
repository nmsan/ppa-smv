<?php

namespace App\Application\Membership\UseCases;

use App\Application\Ports\MemberRepository;
use App\Application\Shared\ConflictException;
use App\Domain\Membership\Member;
use App\Domain\Membership\MembershipNumber;
use App\Domain\Shared\DomainRuleViolation;

/**
 * Someone already in the old register links their new account to their record,
 * proving it is theirs with the phone number or NIC on file. Every failure gives
 * the same answer, so the form cannot be used to discover who is a member.
 */
final readonly class ClaimRegisterRecord
{
    private const NO_MATCH = 'We could not match those details to a membership record. Check your membership number, or contact the secretary.';

    public function __construct(private MemberRepository $members) {}

    public function execute(int $userId, ?string $accountEmail, string $membershipNumber, ?string $phone, ?string $nic): Member
    {
        if ($this->members->findByUserId($userId)) {
            throw new ConflictException('Your account is already linked to a membership.');
        }

        try {
            $number = (string) MembershipNumber::fromSequence((int) preg_replace('/\D/', '', $membershipNumber));
        } catch (DomainRuleViolation) {
            throw new ConflictException(self::NO_MATCH);
        }

        $record = $this->members->findByMembershipNumber($number);

        if (! $record || $record->userId !== null || ! $record->matchesClaim($phone, $nic)) {
            throw new ConflictException(self::NO_MATCH);
        }

        $linked = $record->linkToAccount($userId, $accountEmail);
        $this->members->save($linked);

        return $linked;
    }
}
