<?php

namespace App\Infrastructure\Queries;

use App\Application\Ports\SupporterReadModel;
use App\Infrastructure\Persistence\Eloquent\Models\ContributionModel;
use App\Infrastructure\Persistence\Eloquent\Models\FundraisingEventModel;
use App\Infrastructure\Persistence\Eloquent\Models\SupporterModel;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

final class EloquentSupporterReadModel implements SupporterReadModel
{
    private const GENERAL = ['sponsorship' => 'General sponsorship', 'donation' => 'General donation'];

    /** @return Collection<int, ContributionModel> */
    private function valid(): Collection
    {
        return ContributionModel::query()->whereNull('voided_at')->with('event:id,name')->get();
    }

    /** "A/L 2017" for a linked member, otherwise the public note typed by the treasurer. */
    private function noteFor(SupporterModel $s): ?string
    {
        return $s->member?->batch_key ? "A/L {$s->member->batch_key}" : $s->public_note;
    }

    /**
     * Profile photo URLs of the user accounts linked to these members, keyed by member id.
     *
     * @param  iterable<int, string|null>  $memberIds
     * @return Collection<string, string>
     */
    private function avatarsFor(iterable $memberIds): Collection
    {
        $ids = collect($memberIds)->filter()->unique()->values();
        if ($ids->isEmpty()) {
            return collect();
        }

        return DB::table('members')->join('users', 'users.id', '=', 'members.user_id')
            ->whereIn('members.id', $ids)->whereNotNull('users.avatar_path')
            ->pluck('users.avatar_path', 'members.id')
            ->map(fn (string $path) => Storage::disk('public')->url($path));
    }

    public function supporters(): array
    {
        $bySupporter = $this->valid()->groupBy('supporter_id');
        $supporters = SupporterModel::query()->with('member:id,membership_number,batch_key')->orderBy('name')->get();
        $avatars = $this->avatarsFor($supporters->pluck('member_id'));

        return $supporters
            ->map(function (SupporterModel $s) use ($bySupporter, $avatars) {
                $lines = $bySupporter->get($s->id, collect());

                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'avatar' => $avatars->get($s->member_id),
                    'kind' => $s->kind,
                    'member_number' => $s->member?->membership_number,
                    'note' => $this->noteFor($s),
                    'show_publicly' => $s->show_publicly,
                    'sponsorship_cents' => (int) $lines->where('type', 'sponsorship')->sum('amount_cents'),
                    'donation_cents' => (int) $lines->where('type', 'donation')->sum('amount_cents'),
                    'total_cents' => (int) $lines->sum('amount_cents'),
                    'contributions' => $lines->count(),
                    'events' => $lines->map(fn ($c) => $c->event?->name)->filter()->unique()->values()->all(),
                    'last_received' => $lines->max(fn ($c) => $c->received_on?->format('Y-m-d')),
                ];
            })->sortByDesc('total_cents')->values()->all();
    }

    public function account(string $supporterId): ?array
    {
        $s = SupporterModel::query()->with('member')->find($supporterId);
        if (! $s) {
            return null;
        }

        $lines = ContributionModel::query()->where('supporter_id', $s->id)
            ->with(['event:id,name', 'recorder:id,name', 'voider:id,name'])
            ->orderByDesc('received_on')->orderByDesc('created_at')->get();
        $valid = $lines->whereNull('voided_at');

        return [
            'supporter' => [
                'id' => $s->id, 'name' => $s->name, 'kind' => $s->kind, 'contact_name' => $s->contact_name, 'phone' => $s->phone,
                'email' => $s->email, 'public_note' => $s->public_note, 'notes' => $s->notes, 'show_publicly' => $s->show_publicly,
            ],
            'member' => $s->member ? [
                'number' => $s->member->membership_number,
                'name' => $s->member->full_name,
                'avatar' => $this->avatarsFor([$s->member_id])->first(),
                'batch' => $s->member->batch_key,
                'status' => $s->member->status,
            ] : null,
            'total_cents' => (int) $valid->sum('amount_cents'),
            'sponsorship_cents' => (int) $valid->where('type', 'sponsorship')->sum('amount_cents'),
            'donation_cents' => (int) $valid->where('type', 'donation')->sum('amount_cents'),
            'by_event' => $valid->groupBy(fn ($c) => $c->event?->name ?? self::GENERAL[$c->type])
                ->map(fn ($g, $name) => ['name' => $name, 'cents' => (int) $g->sum('amount_cents'), 'count' => $g->count()])
                ->sortByDesc('cents')->values()->all(),
            'contributions' => $lines->map(fn (ContributionModel $c) => [
                'id' => $c->id,
                'type' => $c->type,
                'event' => $c->event?->name,
                'cents' => $c->amount_cents,
                'received_on' => $c->received_on?->format('Y-m-d'),
                'reference' => $c->reference,
                'note' => $c->note,
                'recorded_by' => $c->recorder?->name,
                'voided' => $c->voided_at ? ['at' => $c->voided_at->toIso8601String(), 'by' => $c->voider?->name, 'reason' => $c->void_reason] : null,
            ])->all(),
        ];
    }

    public function events(): array
    {
        $byEvent = $this->valid()->groupBy('event_id');

        return FundraisingEventModel::query()->orderByDesc('held_on')->orderBy('name')->get()->map(function ($e) use ($byEvent) {
            $lines = $byEvent->get($e->id, collect());

            return [
                'id' => $e->id,
                'name' => $e->name,
                'held_on' => $e->held_on?->format('Y-m-d'),
                'sponsorship_cents' => (int) $lines->where('type', 'sponsorship')->sum('amount_cents'),
                'donation_cents' => (int) $lines->where('type', 'donation')->sum('amount_cents'),
                'supporters' => $lines->pluck('supporter_id')->unique()->count(),
            ];
        })->all();
    }

    public function publicBoard(string $type): array
    {
        $bySupporter = $this->valid()->where('type', $type)->groupBy('supporter_id');

        $supporters = SupporterModel::query()->with('member:id,batch_key')->where('show_publicly', true)->get();
        // Only supporters who agreed to be listed publicly reach this page, so their member photo can show too.
        $avatars = $this->avatarsFor($supporters->pluck('member_id'));

        return $supporters
            ->map(function (SupporterModel $s) use ($bySupporter, $type, $avatars) {
                $lines = $bySupporter->get($s->id, collect());

                return [
                    'name' => $s->name,
                    'avatar' => $avatars->get($s->member_id),
                    'note' => $this->noteFor($s),
                    'total_cents' => (int) $lines->sum('amount_cents'),
                    'events' => $lines->groupBy(fn ($c) => $c->event?->name ?? self::GENERAL[$type])
                        ->map(fn ($g, $name) => ['name' => $name, 'cents' => (int) $g->sum('amount_cents')])
                        ->sortByDesc('cents')->values()->all(),
                    'first_received' => $lines->min(fn ($c) => $c->received_on?->format('Y-m-d')),
                ];
            })
            ->filter(fn ($r) => $r['total_cents'] > 0)
            ->sortByDesc('total_cents')->values()->all();
    }

    public function publicTotals(int $names = 4): array
    {
        $valid = $this->valid();
        $bySupporter = $valid->groupBy('supporter_id')->map(fn ($lines) => (int) $lines->sum('amount_cents'));

        $shown = SupporterModel::query()
            ->where('show_publicly', true)
            ->whereIn('id', $bySupporter->keys())
            ->get(['id', 'name'])
            ->sortByDesc(fn (SupporterModel $s) => $bySupporter->get($s->id, 0))
            ->take($names)
            ->pluck('name')
            ->values()
            ->all();

        return [
            'raised_cents' => (int) $valid->sum('amount_cents'),
            'supporters' => $bySupporter->count(),
            'shown' => $shown,
        ];
    }

    public function givingOfMember(string $memberId): ?array
    {
        $s = SupporterModel::query()->where('member_id', $memberId)->first();
        if (! $s) {
            return null;
        }
        $lines = ContributionModel::query()->where('supporter_id', $s->id)->whereNull('voided_at')->get();

        return [
            'donation_cents' => (int) $lines->where('type', 'donation')->sum('amount_cents'),
            'sponsorship_cents' => (int) $lines->where('type', 'sponsorship')->sum('amount_cents'),
            'count' => $lines->count(),
        ];
    }
}
