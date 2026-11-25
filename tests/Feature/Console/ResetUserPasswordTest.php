<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

it('resets a password after asking for it twice', function () {
    $user = User::factory()->create(['email' => 'secretary@example.test']);

    $this->artisan('user:reset-password', ['email' => 'Secretary@Example.test '])
        ->expectsQuestion('New password (at least 8 characters)', 'new-secret-123')
        ->expectsQuestion('Type it again', 'new-secret-123')
        ->expectsOutputToContain('Password reset for')
        ->assertSuccessful();

    expect(Hash::check('new-secret-123', $user->fresh()->password))->toBeTrue();

    $log = DB::table('activity_log')->where('log_name', 'security')->first();
    expect($log->event)->toBe('password-reset')
        ->and((string) $log->subject_id)->toBe((string) $user->id);
});

it('generates a strong random password when asked', function () {
    $user = User::factory()->create();
    $old = $user->password;

    $this->artisan('user:reset-password', ['email' => $user->email, '--generate' => true])
        ->expectsOutputToContain('New password:')
        ->assertSuccessful();

    expect($user->fresh()->password)->not->toBe($old);
});

it('refuses passwords that do not match or are too short', function () {
    $user = User::factory()->create();
    $old = $user->password;

    $this->artisan('user:reset-password', ['email' => $user->email])
        ->expectsQuestion('New password (at least 8 characters)', 'short')
        ->expectsQuestion('Type it again', 'short')
        ->expectsQuestion('New password (at least 8 characters)', 'long-enough-1')
        ->expectsQuestion('Type it again', 'different-2')
        ->expectsQuestion('New password (at least 8 characters)', 'long-enough-1')
        ->expectsQuestion('Type it again', 'different-3')
        ->expectsOutputToContain('Password not changed.')
        ->assertFailed();

    expect($user->fresh()->password)->toBe($old);
});

it('explains when no account has that email', function () {
    $this->artisan('user:reset-password', ['email' => 'nobody@example.test'])
        ->expectsOutputToContain('No account with the email nobody@example.test')
        ->assertFailed();
});
