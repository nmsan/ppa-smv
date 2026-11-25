<?php

use App\Application\Membership\Import\RegisterRow;
use App\Application\Membership\Import\RegisterRowCleaner;
use App\Domain\Membership\MembershipCategory;

function row(array $overrides = []): RegisterRow
{
    return new RegisterRow(...array_merge([
        'line' => 5, 'membershipNumber' => 'M-010', 'category' => 'Annual', 'joinedVia' => 'Hard Copy', 'fee2024' => 'Manual',
        'timestamp' => null, 'fullName' => ' Kasun   Perera ', 'gender' => 'Male', 'phone' => '077 123 4567', 'whatsapp' => null,
        'nic' => '199812345678', 'email' => 'Kasun@Example.test', 'country' => 'Srilanka', 'admissionNumber' => '1234',
        'olYear' => '2014', 'alYear' => '2017',
    ], $overrides));
}

beforeEach(fn () => $this->cleaner = new RegisterRowCleaner);

it('cleans a typical row', function () {
    $c = $this->cleaner->clean(row());

    expect((string) $c->number)->toBe('M-010')
        ->and($c->fullName)->toBe('Kasun Perera')
        ->and($c->email)->toBe('kasun@example.test')
        ->and($c->phone)->toBe('0771234567')
        ->and($c->profile->country)->toBe('Sri Lanka')
        ->and($c->profile->joinedVia)->toBe('paper')
        ->and($c->profile->fee2024)->toBe('manual')
        ->and($c->batch->key())->toBe(2017)
        ->and($c->issues)->toBe([]);
});

it('understands the ways Sri Lanka was typed', function (string $typed) {
    expect($this->cleaner->clean(row(['country' => $typed]))->profile->country)->toBe('Sri Lanka');
})->with(['Sri Lanka', 'Srilanka', 'Sri lankan', 'sri lanka', 'ශ්‍රී ලංකාව']);

it('reads the batch years the way people typed them', function (?string $ol, ?string $al, ?int $key, ?string $issue) {
    $c = $this->cleaner->clean(row(['olYear' => $ol, 'alYear' => $al]));

    expect($c->batch?->key())->toBe($key);
    $issue === null ? expect($c->issues)->toBe([]) : expect(implode(' ', $c->issues))->toContain($issue);
})->with([
    'normal' => ['2014', '2017', 2017, null],
    'A/L only' => ['N/A', '1994', 1994, null],
    'O/L only' => ['2005', '', 2008, null],
    'both in one cell' => ['1997/2000', null, 2000, null],
    'swapped' => ['2006', '2003', 2006, 'swapped'],
    'too far apart' => ['2000', '2013', 2013, 'do not fit'],
    'missing' => ['No', 'No', null, 'no batch year'],
]);

it('leaves bad contact details empty and says so', function () {
    $c = $this->cleaner->clean(row(['phone' => '12345', 'email' => 'not-an-email', 'nic' => '123']));

    expect($c->phone)->toBeNull()->and($c->email)->toBeNull()->and($c->nic)->toBeNull()
        ->and($c->issues)->toHaveCount(3);
});

it('keeps old-style NICs and normalises them', function () {
    expect($this->cleaner->clean(row(['nic' => '981234567v']))->nic)->toBe('981234567V');
});

it('drops a V or X typed after a new 12-digit NIC', function () {
    $c = $this->cleaner->clean(row(['nic' => '199812345678V']));

    expect($c->nic)->toBe('199812345678')->and($c->issues)->toBe([]);
});

it('does not guess at NICs with a digit missing', function () {
    expect($this->cleaner->clean(row(['nic' => '98123456V']))->nic)->toBeNull()
        ->and($this->cleaner->clean(row(['nic' => '981234567']))->nic)->toBeNull();
});

it('reads categories', function () {
    expect($this->cleaner->clean(row(['category' => 'Honorary']))->category)->toBe(MembershipCategory::Honorary)
        ->and($this->cleaner->clean(row(['category' => '']))->category)->toBe(MembershipCategory::Annual);
});

it('skips empty rows', function () {
    expect($this->cleaner->clean(row(['fullName' => '', 'membershipNumber' => ''])))->toBeNull();
});
