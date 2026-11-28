<?php

namespace App\Infrastructure\Persistence;

use App\Application\Ports\MembershipPaymentRepository;
use App\Domain\Membership\MembershipPayment;
use App\Domain\Membership\MembershipStatus;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Infrastructure\Persistence\Eloquent\Models\MembershipPaymentModel;
use Illuminate\Support\Str;

final class EloquentMembershipPaymentRepository implements MembershipPaymentRepository
{
    public function nextId(): string
    {
        return (string) Str::ulid();
    }

    public function add(MembershipPayment $p): void
    {
        MembershipPaymentModel::query()->create([
            'id' => $p->id,
            'member_id' => $p->memberId,
            'category' => $p->category->value,
            'amount_cents' => $p->amount->cents,
            'channel' => $p->channel->value,
            'received_on' => $p->receivedOn->format('Y-m-d'),
            'reference' => $p->reference,
            'note' => $p->note,
            'recorded_by' => $p->recordedBy,
        ]);
    }

    public function awaitingPayment(?string $search = null, int $limit = 100): array
    {
        $search = $search === null ? '' : trim($search);

        return MemberModel::query()
            ->where('status', MembershipStatus::Approved->value)
            ->when($search === '', fn ($q) => $q->whereIn('source', ['application', 'secretary']))
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('full_name', 'like', "%{$search}%")
                ->orWhere('membership_number', 'like', "%{$search}%")))
            ->orderBy('approved_at')
            ->orderBy('full_name')
            ->limit($limit)
            ->get()
            ->map(fn (MemberModel $m) => [
                'id' => $m->id,
                'name' => $m->full_name,
                'number' => $m->membership_number,
                'category' => $m->category,
                'fee_cents' => $m->fee_cents,
                'phone' => $m->phone,
                'email' => $m->email,
                'batch' => $m->batch_key,
                'approved_on' => $m->approved_at?->format('Y-m-d'),
            ])
            ->all();
    }

    public function recent(int $limit = 20): array
    {
        return MembershipPaymentModel::query()
            ->with(['member:id,full_name,membership_number', 'recorder:id,name'])
            ->orderByDesc('received_on')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (MembershipPaymentModel $p) => [
                'id' => $p->id,
                'member' => $p->member?->full_name ?? '–',
                'number' => $p->member?->membership_number,
                'category' => $p->category,
                'amount_cents' => $p->amount_cents,
                'channel' => $p->channel,
                'received_on' => $p->received_on->format('Y-m-d'),
                'reference' => $p->reference,
                'recorded_by' => $p->recorder?->name,
            ])
            ->all();
    }
}
