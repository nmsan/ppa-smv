<?php

use App\Domain\Membership\Batch;
use App\Domain\Shared\DomainRuleViolation;

it('uses the A/L year as the batch key', function () {
    expect(Batch::of(2014, 2017)->key())->toBe(2017);
});

it('uses O/L year + 3 when the pupil left after O/L', function () {
    expect(Batch::of(2014, null)->key())->toBe(2017);
});

it('requires at least one year', function () {
    Batch::of(null, null);
})->throws(DomainRuleViolation::class);

it('rejects an A/L year before the O/L year', function () {
    Batch::of(2006, 2003);
})->throws(DomainRuleViolation::class);

it('rejects years out of range', function () {
    Batch::of(1820, null);
})->throws(DomainRuleViolation::class);
