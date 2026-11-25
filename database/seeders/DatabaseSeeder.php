<?php

namespace Database\Seeders;

use App\Domain\Access\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Local development data only. Never run against production.
     * Login: admin@ppa.test / password  (super admin)
     * Login: editor@ppa.test / password (content editor)
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->command->call('content:import');
        $this->command->call('supporters:import-lists');

        User::factory()->create([
            'name' => 'Local Admin',
            'email' => 'admin@ppa.test',
        ])->assignRole(Role::SuperAdmin->value);

        User::factory()->create([
            'name' => 'Local Content Editor',
            'email' => 'editor@ppa.test',
        ])->assignRole(Role::ContentEditor->value);
    }
}
