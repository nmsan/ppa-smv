<?php

use App\Application\Membership\DTO\SubmitApplicationData;
use App\Application\Membership\UseCases\SubmitApplication;
use App\Application\Shared\ConflictException;
use App\Domain\Membership\MembershipStatus;
use Tests\Fakes\FakeClock;
use Tests\Fakes\InMemoryMemberRepository;
use Tests\Fakes\SpyEventDispatcher;

beforeEach(function () {
    $this->members = new InMemoryMemberRepository;
    $this->events = new SpyEventDispatcher;
    $this->useCase = new SubmitApplication($this->members, new FakeClock, $this->events);
    $this->data = new SubmitApplicationData(1, 'Kasun Perera', 'kasun@example.test', '0771234567', '199812345678', 2014, 2017);
});

it('saves the applicant and announces it', function () {
    $id = $this->useCase->execute($this->data);

    expect($this->members->findById($id)->status())->toBe(MembershipStatus::Applied)
        ->and($this->events->dispatched)->toHaveCount(1);
});

it('refuses a second application with the same NIC', function () {
    $this->useCase->execute($this->data);
    $this->useCase->execute($this->data);
})->throws(ConflictException::class);
