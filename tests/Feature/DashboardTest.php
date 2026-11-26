<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_users_without_an_office_are_sent_to_their_account_page()
    {
        $this->actingAs(User::factory()->create());

        $this->get('/dashboard')->assertRedirect(route('my-membership', absolute: false));
    }
}
