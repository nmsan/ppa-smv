<?php

use App\Domain\Membership\Batch;
use App\Domain\Membership\Events\ApplicationSubmitted;
use App\Domain\Membership\Events\MemberApproved;
use App\Domain\Membership\Member;
use App\Domain\Membership\MembershipNumber;
use App\Domain\Membership\MembershipStatus;
use App\Domain\Shared\DomainRuleViolation;

function applicant(): Member
{
    return Member::apply('m1', 1, ' Kasun Perera ', 'KASUN@example.test', '0771234567', '199812345678V', Batch::of(2014, 2017), new DateTimeImmutable('2026-11-25'));
}

it('starts as an applicant and records the submission', function () {
    $member = applicant();

    expect($member->status())->toBe(MembershipStatus::Applied)
        ->and($member->fullName)->toBe('Kasun Perera')
        ->and($member->email)->toBe('kasun@example.test')
        ->and($member->releaseEvents()[0])->toBeInstanceOf(ApplicationSubmitted::class);
});

it('is approved with a membership number', function () {
    $member = applicant();
    $member->releaseEvents();

    $member->approve(MembershipNumber::fromSequence(271), 9, new DateTimeImmutable('2026-11-26'));

    expect($member->status())->toBe(MembershipStatus::Approved)
        ->and((string) $member->membershipNumber())->toBe('M-271')
        ->and($member->releaseEvents()[0])->toBeInstanceOf(MemberApproved::class);
});

it('cannot be approved twice', function () {
    $member = applicant();
    $member->approve(MembershipNumber::fromSequence(1), 9, new DateTimeImmutable);
    $member->approve(MembershipNumber::fromSequence(2), 9, new DateTimeImmutable);
})->throws(DomainRuleViolation::class);

it('needs a reason to be rejected', function () {
    applicant()->reject('  ');
})->throws(DomainRuleViolation::class);
