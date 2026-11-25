<?php

use App\Application\Ports\MembershipNumberGenerator;
use App\Domain\Membership\MembershipStatus;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use Illuminate\Support\Facades\Schema;

$file = dirname(__DIR__, 2).'/fixtures/register-sample.csv';

it('imports the register, cleaning what it can and reporting the rest', function () use ($file) {
    $this->artisan('members:import-register', ['file' => $file])
        ->expectsOutputToContain('Import finished.')
        ->assertSuccessful();

    expect(MemberModel::query()->count())->toBe(7);

    $two = MemberModel::query()->where('membership_number', 'M-002')->first();
    expect($two->full_name)->toBe('Test Person Two')
        ->and($two->status)->toBe(MembershipStatus::Approved->value)
        ->and($two->source)->toBe('register')
        ->and($two->email)->toBe('two@example.test')
        ->and($two->country)->toBe('Sri Lanka')
        ->and($two->batch_key)->toBe(2017)
        ->and($two->nic)->toBe('199812345678')
        ->and($two->getRawOriginal('nic'))->not->toBe('199812345678');

    expect(MemberModel::query()->where('membership_number', 'M-001')->value('category'))->toBe('honorary')
        ->and(MemberModel::query()->where('membership_number', 'M-004')->value('batch_key'))->toBe(2000)
        ->and(MemberModel::query()->where('membership_number', 'M-005')->value('batch_key'))->toBe(2006)
        ->and(MemberModel::query()->where('membership_number', 'M-006')->value('nic'))->toBeNull(); // duplicate NIC

    $applicant = MemberModel::query()->whereNull('membership_number')->first();
    expect($applicant->full_name)->toBe('Test Applicant Without Number')
        ->and($applicant->status)->toBe(MembershipStatus::Applied->value);
});

it('never reads the columns the platform does not keep', function () use ($file) {
    $this->artisan('members:import-register', ['file' => $file]);

    expect(Schema::hasColumn('members', 'address'))->toBeFalse()
        ->and(MemberModel::query()->get()->toJson())->not->toContain('SHOULD NOT BE IMPORTED');
});

it('can be run again without creating duplicates', function () use ($file) {
    $this->artisan('members:import-register', ['file' => $file]);
    $this->artisan('members:import-register', ['file' => $file])->assertSuccessful();

    expect(MemberModel::query()->whereNotNull('membership_number')->count())->toBe(6);
});

it('saves nothing in a dry run', function () use ($file) {
    $this->artisan('members:import-register', ['file' => $file, '--dry-run' => true])
        ->expectsOutputToContain('Dry run: nothing was saved.')
        ->assertSuccessful();

    expect(MemberModel::query()->count())->toBe(0);
});

it('continues membership numbers after the imported ones', function () use ($file) {
    $this->artisan('members:import-register', ['file' => $file]);

    $next = app(MembershipNumberGenerator::class)->next();
    expect((string) $next)->toBe('M-007');
});
