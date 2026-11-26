<?php

namespace App\Infrastructure\Queries;

use App\Application\Membership\DTO\MemberListQuery;
use App\Application\Ports\MemberDirectory;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

final class EloquentMemberDirectory implements MemberDirectory
{
    private const COLUMNS = ['id', 'full_name', 'membership_number', 'email', 'phone', 'batch_key', 'country', 'category', 'status', 'source', 'applied_at'];

    public function page(MemberListQuery $q): array
    {
        $paginator = $this->filtered($q)
            ->tap(fn (Builder $b) => $this->sort($b, $q->sort, $q->direction))
            ->select(array_map(fn (string $c) => "members.{$c}", self::COLUMNS))
            // Profile photo of the linked user account, if the member has signed up and uploaded one.
            ->addSelect(['avatar_path' => DB::table('users')->select('avatar_path')->whereColumn('users.id', 'members.user_id')])
            ->paginate($q->perPage, ['*'], 'page', $q->page);

        return [
            'data' => $paginator->getCollection()->map(fn (MemberModel $m) => [
                'id' => $m->id,
                'name' => $m->full_name,
                'avatar' => $m->avatar_path ? Storage::disk('public')->url($m->avatar_path) : null,
                'number' => $m->membership_number,
                'email' => $m->email,
                'phone' => $m->phone,
                'batch' => $m->batch_key,
                'country' => $m->country,
                'category' => $m->category,
                'status' => $m->status,
                'source' => $m->source,
                'joined_on' => $m->applied_at?->format('Y-m-d'),
            ])->all(),
            'total' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'last_page' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }

    public function filterOptions(?int $batch = null): array
    {
        $base = fn () => MemberModel::query()->when($batch !== null, fn ($b) => $b->where('batch_key', $batch));

        return [
            'batches' => $base()->whereNotNull('batch_key')->distinct()->orderByDesc('batch_key')->pluck('batch_key')->map(fn ($v) => (int) $v)->all(),
            'countries' => $base()->whereNotNull('country')->where('country', '!=', '')->distinct()->orderBy('country')->pluck('country')->all(),
        ];
    }

    private function filtered(MemberListQuery $q): Builder
    {
        $search = trim((string) $q->search);

        return MemberModel::query()
            ->when($q->status, fn ($b, $v) => $b->where('status', $v))
            ->when($q->category, fn ($b, $v) => $b->where('category', $v))
            ->when($q->batch, fn ($b, $v) => $b->where('batch_key', $v))
            ->when($q->source, fn ($b, $v) => $b->where('source', $v))
            ->when($q->country, fn ($b, $v) => $b->where('country', $v))
            ->when($search !== '', function (Builder $b) use ($search) {
                $like = '%'.addcslashes($search, '%_\\').'%';
                $digits = preg_replace('/\D/', '', $search);

                $b->where(function (Builder $w) use ($like, $digits, $search) {
                    $w->where('full_name', 'like', $like)
                        ->orWhere('membership_number', 'like', $like)
                        ->orWhere('email', 'like', $like)
                        ->orWhere('phone', 'like', $like);
                    // "120" or "m120" finds M-120.
                    if ($digits !== '' && preg_match('/^\s*m?\s*-?\s*\d+\s*$/i', $search)) {
                        $w->orWhere('membership_number', 'like', '%-'.$digits);
                    }
                });
            });
    }

    private function sort(Builder $b, string $sort, string $direction): void
    {
        $dir = $direction === 'desc' ? 'desc' : 'asc';

        match ($sort) {
            'name' => $b->orderBy('full_name', $dir),
            // Members without a number or batch always go last; "M-99" sorts before "M-100".
            'batch' => $b->orderByRaw('batch_key is null')->orderBy('batch_key', $dir)->orderBy('full_name'),
            'joined' => $b->orderBy('applied_at', $dir)->orderBy('full_name'),
            default => $b->orderByRaw('membership_number is null')
                ->orderByRaw("length(membership_number) {$dir}")
                ->orderBy('membership_number', $dir)
                ->orderBy('full_name'),
        };

        $b->orderBy('id');
    }
}
