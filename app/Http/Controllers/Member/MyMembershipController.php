<?php

namespace App\Http\Controllers\Member;

use App\Application\Membership\UseCases\ClaimRegisterRecord;
use App\Application\Membership\UseCases\GetMyMembership;
use App\Application\Membership\UseCases\ListMembershipPlans;
use App\Application\Membership\UseCases\SubmitApplication;
use App\Application\Membership\UseCases\UpdateMyDetails;
use App\Application\Ports\SupporterReadModel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Member\ClaimRecordRequest;
use App\Http\Requests\Member\SubmitApplicationRequest;
use App\Http\Requests\Member\UpdateMyDetailsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** "My membership": join, check approval, or keep your details up to date. One page for every stage. */
class MyMembershipController extends Controller
{
    public function show(Request $request, GetMyMembership $getMyMembership, SupporterReadModel $supporters, ListMembershipPlans $plans): Response
    {
        $membership = $getMyMembership->execute($request->user()->id);

        return Inertia::render('member/my-membership', [
            'membership' => $membership,
            // What they have given, once the treasurer links their supporter account to their membership.
            'giving' => $membership ? $supporters->givingOfMember($membership->id) : null,
            // The plans someone can ask for, with today's fee.
            'plans' => $plans->execute(),
        ]);
    }

    public function apply(SubmitApplicationRequest $request, SubmitApplication $submitApplication): RedirectResponse
    {
        $submitApplication->execute($request->toData());

        return to_route('my-membership')->with('success', 'Request sent. The committee will review it, and an office bearer will contact you about the fee.');
    }

    public function update(UpdateMyDetailsRequest $request, UpdateMyDetails $updateMyDetails): RedirectResponse
    {
        $updateMyDetails->execute($request->user()->id, $request->toData());

        return to_route('my-membership')->with('success', 'Your details are saved.');
    }

    public function claim(ClaimRecordRequest $request, ClaimRegisterRecord $claim): RedirectResponse
    {
        $member = $claim->execute(
            $request->user()->id,
            $request->user()->email,
            (string) $request->string('membership_number'),
            $request->input('phone'),
            $request->input('nic'),
        );

        return to_route('my-membership')->with('success', "Welcome back! Your account is now linked to membership {$member->membershipNumber()}. Please check your details below.");
    }
}
