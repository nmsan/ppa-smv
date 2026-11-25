<?php

use App\Application\Membership\DTO\SubmitApplicationData;
use App\Application\Membership\UseCases\ApproveApplicant;
use App\Application\Membership\UseCases\SubmitApplication;
use App\Application\Shared\ForbiddenException;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Access\Role;
use App\Domain\Membership\MembershipStatus;
use Tests\Fakes\FakeClock;
use Tests\Fakes\ImmediateUnitOfWork;
use Tests\Fakes\InMemoryMemberRepository;
use Tests\Fakes\InMemoryMembershipPlanRepository;
use Tests\Fakes\SequenceNumberGenerator;
use Tests\Fakes\SpyEventDispatcher;
use Tests\Fakes\SpyNotifier;

beforeEach(function () {
    $this->members = new InMemoryMemberRepository;
    $this->plans = new InMemoryMembershipPlanRepository;
    $this->notifier = new SpyNotifier;
    $clock = new FakeClock;
    $events = new SpyEventDispatcher;

    $this->applicantId = (new SubmitApplication($this->members, $this->plans, $clock, $events))->execute(
        new SubmitApplicationData(1, 'Kasun Perera', 'kasun@example.test', '0771234567', '199812345678', 2014, 2017),
    );

    // The legacy register already holds numbers up to M-270.
    $this->approve = new ApproveApplicant(
        $this->members, new SequenceNumberGenerator(270), $this->plans, new ImmediateUnitOfWork, $clock, $events, $this->notifier,
    );
});

it('lets the membership secretary approve any batch', function () {
    $member = $this->approve->execute($this->applicantId, new Actor(9, [Role::MembershipSecretary]));

    expect($member->status())->toBe(MembershipStatus::Approved)
        ->and((string) $member->membershipNumber())->toBe('M-271')
        ->and($this->notifier->sent[0][1])->toBe('membership.approved');
});

it('lets a batch representative approve their own batch', function () {
    $member = $this->approve->execute($this->applicantId, new Actor(9, [Role::BatchRepresentative], batchKey: 2017));

    expect($member->status())->toBe(MembershipStatus::Approved);
});

it('stops a batch representative approving another batch', function () {
    $this->approve->execute($this->applicantId, new Actor(9, [Role::BatchRepresentative], batchKey: 2005));
})->throws(ForbiddenException::class);

it('stops ordinary members approving anyone', function () {
    $this->approve->execute($this->applicantId, new Actor(9, [Role::Member]));
})->throws(ForbiddenException::class);

it('reports a missing applicant', function () {
    $this->approve->execute('nobody', new Actor(9, [Role::SuperAdmin]));
})->throws(NotFoundException::class);
