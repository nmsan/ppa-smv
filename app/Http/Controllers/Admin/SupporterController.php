<?php

namespace App\Http\Controllers\Admin;

use App\Application\Fundraising\DTO\ContributionData;
use App\Application\Fundraising\DTO\SupporterData;
use App\Application\Fundraising\UseCases\CreateSupporter;
use App\Application\Fundraising\UseCases\LinkSupporterToMember;
use App\Application\Fundraising\UseCases\RecordContribution;
use App\Application\Fundraising\UseCases\RenameFundraisingEvent;
use App\Application\Fundraising\UseCases\UpdateSupporter;
use App\Application\Fundraising\UseCases\VoidContribution;
use App\Application\Ports\ActorResolver;
use App\Application\Ports\SupporterReadModel;
use App\Domain\Access\Actor;
use App\Domain\Fundraising\ContributionType;
use App\Domain\Fundraising\SupporterKind;
use App\Http\Controllers\Controller;
use DateTimeImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Supporter accounts (sponsors and donors), for the treasurer and super admins. Each action calls one use case. */
class SupporterController extends Controller
{
    private const AMOUNT = ['required', 'string', 'regex:/^\s*(LKR|Rs\.?)?\s*\d{1,3}(,?\d{3})*(\.\d{1,2})?\s*$/i'];

    private const MEMBERSHIP_NUMBER = ['nullable', 'string', 'max:10', 'regex:/^\s*[Mm]?\s*-?\s*\d{1,6}\s*$/'];

    public function __construct(private readonly ActorResolver $actors) {}

    public function index(SupporterReadModel $read): Response
    {
        return Inertia::render('admin/supporters/index', ['supporters' => $read->supporters(), 'events' => $read->events()]);
    }

    public function show(string $supporter, SupporterReadModel $read): Response
    {
        return Inertia::render('admin/supporters/show', [
            'account' => $read->account($supporter) ?? abort(404),
            'events' => $read->events(),
            'today' => now()->toDateString(),
        ]);
    }

    public function store(Request $request, CreateSupporter $create): RedirectResponse
    {
        $supporter = $create->execute($this->supporterData($request, nameRequired: ! $request->filled('membership_number')), $this->actor($request));

        return to_route('admin.supporters.show', $supporter->id)->with('success', "{$supporter->name} added. Record their first contribution below.");
    }

    public function update(Request $request, string $supporter, UpdateSupporter $update): RedirectResponse
    {
        $update->execute($supporter, $this->supporterData($request), $this->actor($request));

        return back()->with('success', 'Details saved.');
    }

    public function link(Request $request, string $supporter, LinkSupporterToMember $link): RedirectResponse
    {
        $v = $request->validate(['membership_number' => self::MEMBERSHIP_NUMBER], ['membership_number.regex' => 'Enter a membership number such as M-123.']);
        $linked = $link->execute($supporter, $v['membership_number'] ?? null, $this->actor($request));

        return back()->with('success', $linked->memberId ? 'Linked to the member. Their batch now shows on the public pages.' : 'No longer linked to a member.');
    }

    public function contribute(Request $request, string $supporter, RecordContribution $record): RedirectResponse
    {
        $v = $request->validate([
            'type' => ['required', 'in:sponsorship,donation'],
            'amount' => self::AMOUNT,
            'received_on' => ['required', 'date_format:Y-m-d'],
            'event_id' => ['nullable', 'string'],
            'new_event' => ['nullable', 'required_if:event_id,new', 'string', 'max:150'],
            'reference' => ['nullable', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:255'],
        ], [
            'amount.regex' => 'Enter an amount such as 25,000 or 25000.50.',
            'new_event.required_if' => 'Give the new event or project a name.',
        ]);

        $record->execute(new ContributionData(
            supporterId: $supporter,
            type: ContributionType::from($v['type']),
            amountCents: $this->cents($v['amount']),
            receivedOn: new DateTimeImmutable($v['received_on']),
            eventId: ($v['event_id'] ?? '') !== '' && $v['event_id'] !== 'new' ? $v['event_id'] : null,
            newEventName: ($v['event_id'] ?? '') === 'new' ? ($v['new_event'] ?? null) : null,
            reference: $v['reference'] ?? null,
            note: $v['note'] ?? null,
        ), $this->actor($request));

        return back()->with('success', ucfirst($v['type']).' recorded.');
    }

    public function void(Request $request, string $contribution, VoidContribution $void): RedirectResponse
    {
        $v = $request->validate(['reason' => ['required', 'string', 'max:255']]);
        $void->execute($contribution, $v['reason'], $this->actor($request));

        return back()->with('success', 'Contribution voided. It stays in the history but no longer counts.');
    }

    public function renameEvent(Request $request, string $event, RenameFundraisingEvent $rename): RedirectResponse
    {
        $v = $request->validate(['name' => ['required', 'string', 'max:150'], 'held_on' => ['nullable', 'date_format:Y-m-d']]);
        $rename->execute($event, $v['name'], ! empty($v['held_on']) ? new DateTimeImmutable($v['held_on']) : null, $this->actor($request));

        return back()->with('success', 'Event updated.');
    }

    private function supporterData(Request $request, bool $nameRequired = true): SupporterData
    {
        $v = $request->validate([
            'name' => [$nameRequired ? 'required' : 'nullable', 'string', 'max:150'],
            'kind' => ['required', 'in:business,individual'],
            'membership_number' => self::MEMBERSHIP_NUMBER,
            'contact_name' => ['nullable', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:150'],
            'public_note' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'show_publicly' => ['boolean'],
        ], ['membership_number.regex' => 'Enter a membership number such as M-123.']);

        return new SupporterData(
            name: (string) ($v['name'] ?? ''),
            kind: SupporterKind::from($v['kind']),
            contactName: $v['contact_name'] ?? null,
            phone: $v['phone'] ?? null,
            email: $v['email'] ?? null,
            publicNote: $v['public_note'] ?? null,
            notes: $v['notes'] ?? null,
            showPublicly: (bool) ($v['show_publicly'] ?? true),
            membershipNumber: $v['membership_number'] ?? null,
        );
    }

    private function cents(string $amount): int
    {
        preg_match('/\d[\d,]*(\.\d{1,2})?/', $amount, $m);

        return (int) round(((float) str_replace(',', '', $m[0])) * 100);
    }

    private function actor(Request $request): Actor
    {
        return $this->actors->forUser($request->user()->id);
    }
}
