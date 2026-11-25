<?php

use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Models\User;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->artisan('members:import-register', ['file' => dirname(__DIR__, 2).'/fixtures/register-sample.csv']);
    $this->user = User::factory()->create(['email' => 'two.new@example.test']);
});

it('offers to join or find an existing record to people who are not members', function () {
    $this->actingAs($this->user)->get('/my-membership')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('member/my-membership')->where('membership', null));
});

it('sends the old apply address to My membership', function () {
    $this->actingAs($this->user)->get('/apply')->assertRedirect('/my-membership');
});

it('links an existing register record when the phone number matches', function () {
    $this->actingAs($this->user)
        ->post('/my-membership/claim', ['membership_number' => 'm-2', 'phone' => '077 123 4567'])
        ->assertRedirect('/my-membership')
        ->assertSessionHas('success');

    $record = MemberModel::query()->where('membership_number', 'M-002')->first();
    expect($record->user_id)->toBe($this->user->id)
        ->and($record->email)->toBe('two@example.test'); // the register's email is kept

    $this->get('/my-membership')->assertInertia(fn (Assert $page) => $page
        ->where('membership.number', 'M-002')
        ->where('membership.locked', true)
        ->where('membership.nic', '••••••••5678'));
});

it('fills in a missing email from the account when linking', function () {
    MemberModel::query()->where('membership_number', 'M-003')->update(['phone' => '0712345678', 'email' => null]);

    $this->actingAs($this->user)->post('/my-membership/claim', ['membership_number' => 'M-003', 'nic' => '981234567v']);

    expect(MemberModel::query()->where('membership_number', 'M-003')->value('email'))->toBe('two.new@example.test');
});

it('gives the same answer for a wrong number, wrong details or an already linked record', function () {
    $message = 'We could not match those details to a membership record. Check your membership number, or contact the secretary.';

    $this->actingAs($this->user)->post('/my-membership/claim', ['membership_number' => 'M-999', 'phone' => '0771234567'])
        ->assertSessionHasErrors(['form' => $message]);
    $this->post('/my-membership/claim', ['membership_number' => 'M-002', 'phone' => '0779999999'])
        ->assertSessionHasErrors(['form' => $message]);

    MemberModel::query()->where('membership_number', 'M-004')->update(['user_id' => User::factory()->create()->id, 'phone' => '0770001111']);
    $this->post('/my-membership/claim', ['membership_number' => 'M-004', 'phone' => '0770001111'])
        ->assertSessionHasErrors(['form' => $message]);

    expect(MemberModel::query()->where('user_id', $this->user->id)->exists())->toBeFalse();
});

it('limits claim attempts to stop guessing', function () {
    $this->actingAs($this->user);
    foreach (range(1, 5) as $i) {
        $this->post('/my-membership/claim', ['membership_number' => 'M-002', 'phone' => "077000000{$i}"]);
    }

    $this->post('/my-membership/claim', ['membership_number' => 'M-002', 'phone' => '0771234567'])->assertStatus(429);
});

it('lets members update contact details but keeps name, NIC and batch locked', function () {
    $this->actingAs($this->user)->post('/my-membership/claim', ['membership_number' => 'M-002', 'phone' => '0771234567']);

    $this->put('/my-membership', [
        'full_name' => 'Someone Else', 'nic' => '200099999999', 'ol_year' => 1990, 'al_year' => 1993,
        'email' => 'new@example.test', 'phone' => '0712223333', 'whatsapp' => '+447700900123', 'country' => 'United Kingdom',
    ])->assertSessionHasNoErrors();

    $row = MemberModel::query()->where('membership_number', 'M-002')->first();
    expect($row->full_name)->toBe('Test Person Two')
        ->and($row->nic)->toBe('199812345678')
        ->and($row->batch_key)->toBe(2017)
        ->and($row->email)->toBe('new@example.test')
        ->and($row->phone)->toBe('0712223333')
        ->and($row->whatsapp)->toBe('+447700900123')
        ->and($row->country)->toBe('United Kingdom');
});

it('lets applicants correct everything, including their batch', function () {
    $this->actingAs($this->user)->post('/my-membership/apply', [
        'full_name' => 'New Person', 'email' => 'np@example.test', 'phone' => '0771112222', 'nic' => '200112345678', 'ol_year' => 2016, 'al_year' => 2019, 'category' => 'annual',
    ]);

    $this->put('/my-membership', ['full_name' => 'New Person Corrected', 'nic' => '200112345679', 'ol_year' => 2017, 'al_year' => 2020, 'phone' => '0771112222'])
        ->assertSessionHasNoErrors();

    $row = MemberModel::query()->where('user_id', $this->user->id)->first();
    expect($row->full_name)->toBe('New Person Corrected')->and($row->batch_key)->toBe(2020)->and($row->nic)->toBe('200112345679');
});

it('stops a linked member from applying again', function () {
    $this->actingAs($this->user)->post('/my-membership/claim', ['membership_number' => 'M-002', 'phone' => '0771234567']);

    $this->post('/my-membership/apply', [
        'full_name' => 'X', 'email' => 'x@example.test', 'phone' => '0771112222', 'nic' => '200112345678', 'al_year' => 2019, 'category' => 'annual',
    ])->assertSessionHasErrors(['form' => 'You already have a membership record.']);
});

it('refuses an application with a NIC that already belongs to a member', function () {
    $this->actingAs($this->user)->post('/my-membership/apply', [
        'full_name' => 'X', 'email' => 'x@example.test', 'phone' => '0771112222', 'nic' => '199812345678', 'al_year' => 2019, 'category' => 'annual',
    ])->assertSessionHasErrors('form');
});

it('accepts phone numbers and NICs typed with spaces, dashes or +94', function (string $phone, string $nic, string $storedPhone, string $storedNic) {
    $this->actingAs($this->user)->post('/my-membership/apply', [
        'full_name' => 'New Person', 'email' => 'np@example.test', 'phone' => $phone, 'nic' => $nic, 'al_year' => 2018, 'category' => 'annual',
    ])->assertSessionHasNoErrors()->assertRedirect('/my-membership');

    $row = MemberModel::query()->where('user_id', $this->user->id)->first();
    expect($row->phone)->toBe($storedPhone)->and($row->nic)->toBe($storedNic)->and($row->status)->toBe('applied');
})->with([
    'spaces' => ['077 555 0101', '2000 5550 1010', '0775550101', '200055501010'],
    'dashes' => ['077-555-0101', '951234567v', '0775550101', '951234567V'],
    '+94' => ['+94 77 555 0101', '200055501010V', '0775550101', '200055501010'],
    'overseas' => ['+44 7700 900123', '200055501010', '+447700900123', '200055501010'],
]);

it('still refuses a phone number that is clearly wrong', function () {
    $this->actingAs($this->user)->post('/my-membership/apply', [
        'full_name' => 'New Person', 'email' => 'np@example.test', 'phone' => '12345', 'nic' => '200055501010', 'al_year' => 2018, 'category' => 'annual',
    ])->assertSessionHasErrors('phone');
});

it('asks to send again, instead of a 419 error page, when the page was open too long', function () {
    // CSRF checks are switched off in tests, so raise the same error the expired token would.
    Route::middleware('web')->post('/_expired', fn () => throw new TokenMismatchException);

    $this->actingAs($this->user)
        ->from('/my-membership')
        ->post('/_expired', ['full_name' => 'X'])
        ->assertRedirect('/my-membership')
        ->assertSessionHasErrors(['form' => 'For your security, the page had been open too long. Please press the button again to send it.']);
});
