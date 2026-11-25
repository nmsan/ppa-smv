<?php

namespace App\Infrastructure\Persistence;

use App\Application\Ports\SupporterRepository;
use App\Domain\Fundraising\Contribution;
use App\Domain\Fundraising\ContributionType;
use App\Domain\Fundraising\FundraisingEvent;
use App\Domain\Fundraising\Supporter;
use App\Domain\Fundraising\SupporterKind;
use App\Domain\Shared\Money;
use App\Infrastructure\Persistence\Eloquent\Models\ContributionModel;
use App\Infrastructure\Persistence\Eloquent\Models\FundraisingEventModel;
use App\Infrastructure\Persistence\Eloquent\Models\SupporterModel;
use Illuminate\Support\Str;
use LogicException;

final class EloquentSupporterRepository implements SupporterRepository
{
    public function nextId(): string
    {
        return (string) Str::ulid();
    }

    public function saveSupporter(Supporter $s): void
    {
        SupporterModel::query()->updateOrCreate(['id' => $s->id], [
            'name' => $s->name, 'kind' => $s->kind->value, 'member_id' => $s->memberId, 'contact_name' => $s->contactName,
            'phone' => $s->phone, 'email' => $s->email, 'public_note' => $s->publicNote, 'notes' => $s->notes,
            'show_publicly' => $s->showPublicly,
        ]);
    }

    public function findSupporter(string $id): ?Supporter
    {
        $row = SupporterModel::query()->find($id);

        return $row ? $this->supporter($row) : null;
    }

    public function findSupporterByName(string $name): ?Supporter
    {
        $row = SupporterModel::query()->whereRaw('lower(name) = ?', [mb_strtolower(trim($name))])->first();

        return $row ? $this->supporter($row) : null;
    }

    public function findSupporterByMember(string $memberId): ?Supporter
    {
        $row = SupporterModel::query()->where('member_id', $memberId)->first();

        return $row ? $this->supporter($row) : null;
    }

    public function saveEvent(FundraisingEvent $e): void
    {
        FundraisingEventModel::query()->updateOrCreate(['id' => $e->id], ['name' => $e->name, 'held_on' => $e->heldOn]);
    }

    public function findEvent(string $id): ?FundraisingEvent
    {
        $row = FundraisingEventModel::query()->find($id);

        return $row ? FundraisingEvent::create($row->id, $row->name, $row->held_on) : null;
    }

    public function findEventByName(string $name): ?FundraisingEvent
    {
        $row = FundraisingEventModel::query()->whereRaw('lower(name) = ?', [mb_strtolower(trim($name))])->first();

        return $row ? FundraisingEvent::create($row->id, $row->name, $row->held_on) : null;
    }

    public function addContribution(Contribution $c): void
    {
        if (ContributionModel::query()->whereKey($c->id)->exists()) {
            throw new LogicException('Ledger lines are never rewritten.');
        }

        ContributionModel::query()->create([
            'id' => $c->id, 'supporter_id' => $c->supporterId, 'type' => $c->type->value, 'event_id' => $c->eventId,
            'amount_cents' => $c->amount->cents, 'received_on' => $c->receivedOn, 'reference' => $c->reference,
            'note' => $c->note, 'recorded_by' => $c->recordedBy,
        ]);
    }

    public function findContribution(string $id): ?Contribution
    {
        $r = ContributionModel::query()->find($id);

        return $r ? Contribution::reconstitute(
            $r->id, $r->supporter_id, ContributionType::from($r->type), $r->event_id, Money::fromCents($r->amount_cents),
            $r->received_on, $r->reference, $r->note, $r->recorded_by, $r->voided_at, $r->voided_by, $r->void_reason,
        ) : null;
    }

    /** The only change a ledger line ever gets. */
    public function markVoided(Contribution $c): void
    {
        ContributionModel::query()->whereKey($c->id)->whereNull('voided_at')->firstOrFail()->update([
            'voided_at' => $c->voidedAt(), 'voided_by' => $c->voidedBy(), 'void_reason' => $c->voidReason(),
        ]);
    }

    private function supporter(SupporterModel $r): Supporter
    {
        return Supporter::create(
            $r->id, $r->name, SupporterKind::from($r->kind), $r->member_id, $r->contact_name, $r->phone,
            $r->email, $r->public_note, $r->notes, $r->show_publicly,
        );
    }
}
