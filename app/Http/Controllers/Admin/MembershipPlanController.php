<?php

namespace App\Http\Controllers\Admin;

use App\Application\Membership\UseCases\ListMembershipPlans;
use App\Application\Membership\UseCases\UpdateMembershipPlan;
use App\Application\Ports\ActorResolver;
use App\Domain\Membership\MembershipCategory;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** The treasurer sets the annual and life membership fees shown on the website and used for new requests. */
class MembershipPlanController extends Controller
{
    public function __construct(private readonly ActorResolver $actors) {}

    public function index(ListMembershipPlans $plans): Response
    {
        return Inertia::render('admin/membership-plans/index', ['plans' => $plans->execute(onlyOpen: false)]);
    }

    public function update(Request $request, string $category, UpdateMembershipPlan $update): RedirectResponse
    {
        $plan = MembershipCategory::tryFrom($category) ?? abort(404);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'name_si' => ['nullable', 'string', 'max:80'],
            'fee' => ['required', 'numeric', 'min:1', 'max:10000000'],
            'active' => ['required', 'boolean'],
        ], [], ['fee' => 'fee (LKR)']);

        $saved = $update->execute(
            $plan, $data['name'], $data['name_si'] ?? null, (int) round(((float) $data['fee']) * 100), (bool) $data['active'],
            $this->actors->forUser($request->user()->id),
        );

        return back()->with('success', "{$saved->name()} saved. New requests use {$saved->fee()->format()}.");
    }
}
