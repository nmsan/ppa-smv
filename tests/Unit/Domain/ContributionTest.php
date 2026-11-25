<?php

use App\Domain\Fundraising\Contribution;
use App\Domain\Fundraising\ContributionType;
use App\Domain\Shared\DomainRuleViolation;
use App\Domain\Shared\Money;

$now = new DateTimeImmutable('2026-11-25 10:00');

function line(int $rupees, ?string $date = '2026-11-20'): Contribution
{
    return Contribution::record('c1', 's1', ContributionType::Donation, 'e1', Money::fromRupees($rupees), $date ? new DateTimeImmutable($date) : null, 'R-1', null, 7, new DateTimeImmutable('2026-11-25'));
}

it('records a positive amount', function () {
    expect(line(25000)->amount->cents)->toBe(2500000);
});

it('refuses zero and negative amounts', function () {
    line(0);
})->throws(DomainRuleViolation::class);

it('refuses a date in the future', function () {
    line(1000, '2026-12-01');
})->throws(DomainRuleViolation::class);

it('is voided once, with a reason', function () use ($now) {
    $c = line(1000);
    $c->void('Entered twice', 7, $now);

    expect($c->isVoided())->toBeTrue()->and($c->voidReason())->toBe('Entered twice');
    $c->void('Again', 7, $now);
})->throws(DomainRuleViolation::class);

it('needs a reason to be voided', function () use ($now) {
    line(1000)->void('  ', 7, $now);
})->throws(DomainRuleViolation::class);
