<?php

namespace App\Http\Controllers\Admin;

use App\Application\Membership\DTO\MembershipPaymentData;
use App\Application\Membership\UseCases\ListMembershipPlans;
use App\Application\Membership\UseCases\RecordMembershipPayment;
use App\Application\Ports\ActorResolver;
use App\Application\Ports\MembershipPaymentRepository;
use App\Domain\Membership\PaymentChannel;
use App\Http\Controllers\Controller;
use DateTimeImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Phase 1 payments: approved members are contacted by an office bearer, who
 * collects the fee by cash, bank transfer or cheque. The treasurer records it
 * here, which makes the membership active.
 */
class MembershipPaymentController extends Controller
{
    public function __construct(private readonly ActorResolver $actors) {}

    public function index(Request $request, MembershipPaymentRepository $payments, ListMembershipPlans $plans): Response
    {
        $search = trim((string) $request->query('search', ''));

        return Inertia::render('admin/membership-payments/index', [
            'awaiting' => $payments->awaitingPayment($search ?: null),
            'recent' => $payments->recent(),
            'search' => $search,
            // Old register records have no agreed fee: the form suggests the plan's current fee instead.
            'plans' => $plans->execute(onlyOpen: false),
            'channels' => array_map(fn (PaymentChannel $c) => ['value' => $c->value, 'label' => $c->label()], PaymentChannel::cases()),
        ]);
    }

    public function store(Request $request, string $member, RecordMembershipPayment $record): RedirectResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:10000000'],
            'channel' => ['required', Rule::enum(PaymentChannel::class)],
            'received_on' => ['required', 'date', 'before_or_equal:today'],
            'reference' => ['nullable', 'string', 'max:120'],
            'note' => ['nullable', 'string', 'max:255'],
        ], [], ['amount' => 'amount (LKR)', 'received_on' => 'date received']);

        $saved = $record->execute(new MembershipPaymentData(
            memberId: $member,
            amountCents: (int) round(((float) $data['amount']) * 100),
            channel: PaymentChannel::from($data['channel']),
            receivedOn: new DateTimeImmutable($data['received_on']),
            reference: $data['reference'] ?? null,
            note: $data['note'] ?? null,
        ), $this->actors->forUser($request->user()->id));

        return back()->with('success', "Payment recorded. {$saved->fullName} ({$saved->membershipNumber()}) is now an active member.");
    }
}
