<?php

use App\Domain\Shared\Money;

it('stores rupees as cents', function () {
    expect(Money::fromRupees(1000)->cents)->toBe(100000);
});

it('adds and subtracts without rounding errors', function () {
    $total = Money::fromCents(10)->add(Money::fromCents(20));

    expect($total->equals(Money::fromCents(30)))->toBeTrue()
        ->and($total->subtract(Money::fromCents(30))->cents)->toBe(0);
});

it('formats as Sri Lankan rupees', function () {
    expect(Money::fromRupees(1000)->format())->toBe('Rs. 1,000.00')
        ->and(Money::fromRupees(250)->negate()->format())->toBe('-Rs. 250.00');
});
