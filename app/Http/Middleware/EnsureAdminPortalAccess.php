<?php

namespace App\Http\Middleware;

use App\Domain\Access\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Keeps the admin portal for office bearers. Members and applicants are sent
 * to their My account page on the public site instead.
 */
class EnsureAdminPortalAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->hasAnyRole(Role::adminPortalNames())) {
            return redirect()->route('my-membership');
        }

        return $next($request);
    }
}
