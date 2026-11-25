<?php

namespace App\Http\Controllers\Admin;

use App\Application\Membership\UseCases\ApproveApplicant;
use App\Application\Membership\UseCases\ListApplicants;
use App\Application\Ports\ActorResolver;
use App\Application\Ports\MembershipNumberGenerator;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicantController extends Controller
{
    public function __construct(private readonly ActorResolver $actors) {}

    public function index(Request $request, ListApplicants $listApplicants, MembershipNumberGenerator $numbers): Response
    {
        return Inertia::render('admin/applicants/index', [
            'applicants' => $listApplicants->execute($this->actors->forUser($request->user()->id)),
            // A preview for the confirmation dialog; the real number is issued when approving.
            'nextNumber' => (string) $numbers->next(),
        ]);
    }

    public function approve(Request $request, string $member, ApproveApplicant $approveApplicant): RedirectResponse
    {
        $approved = $approveApplicant->execute($member, $this->actors->forUser($request->user()->id));

        return back()->with('success', "{$approved->fullName} approved as {$approved->membershipNumber()}.");
    }
}
