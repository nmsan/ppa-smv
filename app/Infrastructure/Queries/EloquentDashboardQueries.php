<?php

namespace App\Infrastructure\Queries;

use App\Application\Ports\DashboardQueries;
use App\Content\ContentTypes;
use App\Domain\Access\Role;
use App\Domain\Membership\MembershipStatus;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Models\ContentEntry;
use App\Models\User;
use DateTimeImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class EloquentDashboardQueries implements DashboardQueries
{
    private const MEMBER_STATUSES = [MembershipStatus::Approved, MembershipStatus::Active, MembershipStatus::Expiring];

    private const CHANNELS = [
        'paper' => 'Paper form',
        'google-form' => 'Google Form',
        'paper-and-google-form' => 'Paper and Google Form',
        'online' => 'This website',
    ];

    private function members(): Builder
    {
        return MemberModel::query()->whereIn('status', array_map(fn ($s) => $s->value, self::MEMBER_STATUSES));
    }

    public function membershipTotals(?int $batchKey = null): array
    {
        $scoped = fn (Builder $q) => $batchKey === null ? $q : $q->where('batch_key', $batchKey);
        $pending = $scoped(MemberModel::query()->where('status', MembershipStatus::Applied->value));
        $startOfMonth = Carbon::now()->startOfMonth();

        $approvalDays = MemberModel::query()
            ->where('source', 'application')
            ->whereNotNull('approved_at')
            ->get(['applied_at', 'approved_at'])
            ->map(fn ($m) => $m->applied_at->diffInHours($m->approved_at) / 24)
            ->avg();

        $oldest = (clone $pending)->min('applied_at');

        return [
            'members' => $scoped($this->members())->count(),
            'pending' => (clone $pending)->count(),
            'oldest_pending' => $oldest ? new DateTimeImmutable($oldest) : null,
            'this_month' => $scoped(MemberModel::query()->where('source', 'application')->where('applied_at', '>=', $startOfMonth))->count(),
            'last_month' => $scoped(MemberModel::query()->where('source', 'application')
                ->whereBetween('applied_at', [$startOfMonth->copy()->subMonth(), $startOfMonth]))->count(),
            'approval_days' => $approvalDays,
            'batches' => $scoped($this->members()->whereNotNull('batch_key'))->distinct()->count('batch_key'),
        ];
    }

    public function membersByBatch(): array
    {
        return $this->members()
            ->whereNotNull('batch_key')
            ->groupBy('batch_key')
            ->orderBy('batch_key')
            ->pluck(DB::raw('count(*) as total'), 'batch_key')
            ->map(fn ($n) => (int) $n)
            ->all();
    }

    public function applicationsByMonth(int $months): array
    {
        $from = Carbon::now()->startOfMonth()->subMonths($months - 1);
        $counts = MemberModel::query()
            ->where('source', 'application')
            ->where('applied_at', '>=', $from)
            ->get(['applied_at'])
            ->countBy(fn ($m) => $m->applied_at->format('Y-m'));

        $out = [];
        for ($i = 0; $i < $months; $i++) {
            $key = $from->copy()->addMonths($i)->format('Y-m');
            $out[$key] = (int) ($counts[$key] ?? 0);
        }

        return $out;
    }

    public function membersByJoinChannel(): array
    {
        $counts = $this->members()->groupBy('joined_via')->pluck(DB::raw('count(*) as total'), 'joined_via');
        $out = [];
        foreach (self::CHANNELS as $key => $label) {
            $out[$label] = (int) ($counts[$key] ?? 0);
        }
        $out['Not recorded'] = (int) ($counts[''] ?? $counts[null] ?? 0);

        return array_filter($out);
    }

    public function membersByCategory(): array
    {
        $counts = $this->members()->groupBy('category')->pluck(DB::raw('count(*) as total'), 'category');

        return array_filter([
            'Annual' => (int) ($counts['annual'] ?? 0),
            'Life' => (int) ($counts['life'] ?? 0),
            'Honorary' => (int) ($counts['honorary'] ?? 0),
        ]);
    }

    public function batchesWithRepresentative(): array
    {
        return MemberModel::query()
            ->whereNotNull('batch_key')
            ->whereIn('user_id', User::role(Role::BatchRepresentative->value)->select('id'))
            ->distinct()
            ->pluck('batch_key')
            ->map(fn ($k) => (int) $k)
            ->all();
    }

    public function profileCompleteness(): array
    {
        $base = $this->members();

        return [
            'total' => (clone $base)->count(),
            'missing_email' => (clone $base)->whereNull('email')->count(),
            'missing_phone' => (clone $base)->whereNull('phone')->count(),
            'missing_nic' => (clone $base)->whereNull('nic_hash')->count(),
            'missing_batch' => (clone $base)->whereNull('batch_key')->count(),
            'overseas' => (clone $base)->whereNotNull('country')->where('country', '!=', 'Sri Lanka')->count(),
        ];
    }

    public function contentLastUpdated(): array
    {
        $latest = ContentEntry::query()->groupBy('type')->pluck(DB::raw('max(updated_at) as latest'), 'type');

        return array_map(fn ($type) => [
            'type' => ContentTypes::all()[$type]['label'],
            'updated_at' => isset($latest[$type]) ? new DateTimeImmutable($latest[$type]) : null,
        ], array_keys(ContentTypes::all()));
    }

    /**
     * The newest post's own date (not an upcoming event's), or when an editor
     * added a post without a date. Ignores the date content was first imported.
     */
    public function lastNewsPostedAt(): ?DateTimeImmutable
    {
        $today = Carbon::today()->toDateString();

        $latest = ContentEntry::query()
            ->where('type', 'news')
            ->get(['data', 'created_at', 'updated_by'])
            ->map(fn ($e) => isset($e->data['date']) && $e->data['date'] <= $today
                ? $e->data['date']
                : ($e->updated_by && empty($e->data['date']) ? $e->created_at->toDateString() : null))
            ->filter()
            ->max();

        return $latest ? new DateTimeImmutable($latest) : null;
    }

    public function upcomingEvents(string $today, int $limit): array
    {
        return ContentEntry::query()
            ->where('type', 'news')
            ->get(['data'])
            ->map(fn ($e) => $e->data)
            ->filter(fn ($d) => ($d['type'] ?? null) === 'event' && ($d['date'] ?? '') >= $today)
            ->sortBy('date')
            ->take($limit)
            ->map(fn ($d) => ['title' => $d['title'], 'date' => $d['date']])
            ->values()
            ->all();
    }

    public function recentActivity(array $kinds, int $limit): array
    {
        $items = collect();
        $labels = array_map(fn ($t) => $t['label'], ContentTypes::all());

        if (in_array('content', $kinds, true) || in_array('security', $kinds, true)) {
            $logs = array_values(array_intersect($kinds, ['content', 'security']));
            $rows = DB::table('activity_log')
                ->leftJoin('users', fn ($j) => $j->on('users.id', '=', 'activity_log.causer_id')->where('activity_log.causer_type', User::class))
                ->leftJoin('users as subjects', fn ($j) => $j->on('subjects.id', '=', 'activity_log.subject_id')->where('activity_log.subject_type', User::class))
                ->leftJoin('content_entries', fn ($j) => $j->on('content_entries.id', '=', 'activity_log.subject_id')->where('activity_log.subject_type', ContentEntry::class))
                ->whereIn('log_name', $logs)
                ->orderByDesc('activity_log.id')
                ->limit($limit)
                ->get(['activity_log.*', 'users.name as causer_name', 'content_entries.type as entry_type', 'subjects.name as subject_name']);

            foreach ($rows as $row) {
                $props = json_decode($row->properties ?? '{}', true);
                $type = $row->entry_type ?? $props['attributes']['type'] ?? $props['old']['type'] ?? null;
                $what = match (true) {
                    $row->log_name === 'security' => 'reset the password for '.($row->subject_name ?? 'an account'),
                    $row->event === 'created' => 'added to '.($labels[$type] ?? 'website content'),
                    $row->event === 'deleted' => 'removed from '.($labels[$type] ?? 'website content'),
                    default => 'updated '.($labels[$type] ?? 'website content'),
                };
                if ($row->causer_name === null && $row->log_name === 'content') {
                    continue; // the initial content import, not a person's edit
                }
                $who = $row->causer_name ?? ($row->log_name === 'security' ? 'The command line' : null);
                $items->push(['at' => new DateTimeImmutable($row->created_at), 'who' => $who, 'what' => $what, 'kind' => $row->log_name]);
            }
        }

        if (in_array('approval', $kinds, true)) {
            MemberModel::query()
                ->whereNotNull('approved_at')
                ->leftJoin('users', 'users.id', '=', 'members.approved_by')
                ->orderByDesc('approved_at')
                ->limit($limit)
                ->get(['members.full_name', 'members.membership_number', 'members.approved_at', 'users.name as approver'])
                ->each(fn ($m) => $items->push([
                    'at' => DateTimeImmutable::createFromInterface($m->approved_at),
                    'who' => $m->approver,
                    'what' => "approved {$m->full_name} as {$m->membership_number}",
                    'kind' => 'approval',
                ]));
        }

        return $items->sortByDesc('at')->take($limit)->values()->all();
    }

    public function usersByRole(): array
    {
        $counts = DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->groupBy('roles.name')
            ->pluck(DB::raw('count(*) as total'), 'roles.name');

        $out = ['Accounts' => User::query()->count()];
        foreach (Role::cases() as $role) {
            $out[$role->value] = (int) ($counts[$role->value] ?? 0);
        }

        return $out;
    }

    public function membershipOf(int $userId): ?array
    {
        $member = MemberModel::query()->where('user_id', $userId)->first(['membership_number', 'status', 'batch_key']);
        if (! $member) {
            return null;
        }

        return [
            'number' => $member->membership_number,
            'status' => $member->status,
            'batch' => $member->batch_key,
            'batch_members' => $member->batch_key ? $this->members()->where('batch_key', $member->batch_key)->count() : 0,
        ];
    }
}
