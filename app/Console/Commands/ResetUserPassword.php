<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

/**
 * Resets an account's password from the server's command line.
 *
 *   php artisan user:reset-password someone@example.com             asks for the new password
 *   php artisan user:reset-password someone@example.com --generate  creates a random one
 *
 * The password is never accepted as a command-line argument, so it does not end
 * up in shell history. Other sessions of that user are logged out, and the reset
 * is recorded in the activity log.
 */
class ResetUserPassword extends Command
{
    protected $signature = 'user:reset-password
        {email : Email address of the account}
        {--generate : Create a random password and show it once}';

    protected $description = "Reset a user's password";

    public function handle(): int
    {
        $user = User::query()->where('email', strtolower(trim($this->argument('email'))))->first();

        if (! $user) {
            $this->error("No account with the email {$this->argument('email')}.");
            $this->line('Check the address, or list accounts with: php artisan tinker --execute=\'App\\Models\\User::pluck("email")\'');

            return self::FAILURE;
        }

        $password = $this->option('generate') ? Str::password(16) : $this->askForPassword();

        if ($password === null) {
            return self::FAILURE;
        }

        DB::transaction(function () use ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password),
                'remember_token' => Str::random(60),
            ])->save();

            // Log the user out everywhere else (database sessions only).
            if (config('session.driver') === 'database') {
                DB::table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
            }

            activity('security')
                ->performedOn($user)
                ->event('password-reset')
                ->log('Password reset from the command line');
        });

        $this->info("Password reset for {$user->name} <{$user->email}>.");

        if ($this->option('generate')) {
            $this->newLine();
            $this->line("  New password: <options=bold>{$password}</>");
            $this->newLine();
            $this->warn('This is shown only once. Give it to the user privately and ask them to change it in Settings → Password.');
        }

        return self::SUCCESS;
    }

    private function askForPassword(): ?string
    {
        for ($attempt = 1; $attempt <= 3; $attempt++) {
            $password = (string) $this->secret('New password (at least 8 characters)');
            $confirmation = (string) $this->secret('Type it again');

            $validator = Validator::make(
                ['password' => $password, 'password_confirmation' => $confirmation],
                ['password' => ['required', 'confirmed', Password::min(8)]],
            );

            if ($validator->passes()) {
                return $password;
            }

            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }
        }

        $this->error('Password not changed.');

        return null;
    }
}
