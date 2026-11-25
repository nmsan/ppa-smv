<?php

namespace App\Http\Controllers\Admin;

use App\Application\Membership\UseCases\ApproveApplicant;
use App\Application\Membership\UseCases\ListApplicants;
use App\Application\Membership\UseCases\ListMembershipPlans;
use App\Application\Ports\ActorResolver;
use App\Application\Ports\MembershipNumberGenerator;
use App\Domain\Membership\MembershipCategory;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicantController extends Controller
{
    public function __construct(private readonly ActorResolver $actors) {}

    public function index(Request $request, ListApplicants $listApplicants, MembershipNumberGenerator $numbers, ListMembershipPlans $plans): Response
    {
        return Inertia::render('admin/applicants/index', [
            'applicants' => $listApplicants->execute($this->actors->forUser($request->user()->id)),
            // A preview for the confirmation dialog; the real number is issued when approving.
            'nextNumber' => (string) $numbers->next(),
            'plans' => $plans->execute(onlyOpen: false),
        ]);
    }

    public function approve(Request $request, string $member, ApproveApplicant $approveApplicant): RedirectResponse
    {
        $request->validate(['category' => ['nullable', 'in:annual,life']]);
        $as = $request->filled('category') ? MembershipCategory::from($request->string('category')) : null;

        $approved = $approveApplicant->execute($member, $this->actors->forUser($request->user()->id), $as);

        return back()->with('success', "{$approved->fullName} approved as {$approved->membershipNumber()} ({$approved->category()->value}). An office bearer can now collect the fee.");
    }
}
