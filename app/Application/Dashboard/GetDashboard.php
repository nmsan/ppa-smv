<?php

namespace App\Application\Dashboard;

use App\Application\Ports\Clock;
use App\Application\Ports\DashboardQueries;
use App\Domain\Access\Actor;
use App\Domain\Access\Role;

/**
 * Builds the dashboard for one person. Each section appears only for the roles
 * that need it: membership numbers for the secretary and batch representatives,
 * website freshness for content editors, everything for super admins.
 */
final readonly class GetDashboard
{
    private const STALE_AFTER_DAYS = 180;

    public function __construct(private DashboardQueries $queries, private Clock $clock) {}

    /** @return array<string, mixed> */
    public function execute(Actor $actor): array
    {
        $admin = $actor->has(Role::SuperAdmin);
        $membership = $admin || $actor->has(Role::MembershipSecretary) || $actor->has(Role::BatchRepresentative);
        $website = $admin || $actor->has(Role::ContentEditor);
        $repOnly = ! $admin && ! $actor->has(Role::MembershipSecretary) && $actor->has(Role::BatchRepresentative);
        $now = $this->clock->now();
        $activityKinds = array_values(array_filter([
            $website ? 'content' : null,
            $membership ? 'approval' : null,
            $admin ? 'security' : null,
        ]));

        return array_filter([
            'me' => $this->queries->membershipOf($actor->userId),
            'events' => $this->queries->upcomingEvents($now->format('Y-m-d'), 3),
            'membership' => $membership ? $this->membership($repOnly ? $actor->batchKey : null, $now) : null,
            'website' => $website ? $this->website($now) : null,
            'activity' => $activityKinds ? $this->queries->recentActivity($activityKinds, 10) : null,
            'roles' => $admin ? $this->queries->usersByRole() : null,
        ], fn ($v) => $v !== null);
    }

    /** @return array<string, mixed> */
    private function membership(?int $batchKey, \DateTimeImmutable $now): array
    {
        $totals = $this->queries->membershipTotals($batchKey);
        $byBatch = $this->queries->membersByBatch();
        $represented = array_flip($this->queries->batchesWithRepresentative());

        $withoutRep = array_filter($byBatch, fn ($count, $year) => ! isset($represented[$year]), ARRAY_FILTER_USE_BOTH);
        arsort($withoutRep);

        $strongest = $byBatch;
        arsort($strongest);

        $thisYear = (int) $now->format('Y');
        $recent = [];
        for ($year = $thisYear - 10; $year <= $thisYear - 1; $year++) {
            $recent[$year] = $byBatch[$year] ?? 0;
        }

        return [
            'scope' => $batchKey ? "A/L {$batchKey} batch" : 'All batches',
            'totals' => [
                'members' => $totals['members'],
                'pending' => $totals['pending'],
                'oldest_pending_days' => $totals['oldest_pending'] ? (int) $totals['oldest_pending']->diff($now)->days : null,
                'this_month' => $totals['this_month'],
                'last_month' => $totals['last_month'],
                'approval_days' => $totals['approval_days'] !== null ? round($totals['approval_days'], 1) : null,
                'batches' => $totals['batches'],
            ],
            'by_batch' => $this->pairs($this->continuousYears($byBatch), 'year'),
            'by_month' => $this->pairs($this->queries->applicationsByMonth(12), 'month'),
            'by_channel' => $this->pairs($this->queries->membersByJoinChannel(), 'label'),
            'by_category' => $this->pairs($this->queries->membersByCategory(), 'label'),
            'without_representative' => $this->pairs(array_slice($withoutRep, 0, 8, true), 'year'),
            'without_representative_total' => count($withoutRep),
            'strongest' => $this->pairs(array_slice($strongest, 0, 5, true), 'year'),
            'recent_years' => $this->pairs($recent, 'year'),
            'completeness' => $this->queries->profileCompleteness(),
        ];
    }

    /** @return array<string, mixed> */
    private function website(\DateTimeImmutable $now): array
    {
        $stale = [];
        foreach ($this->queries->contentLastUpdated() as $row) {
            $days = $row['updated_at'] ? (int) $row['updated_at']->diff($now)->days : null;
            if ($days === null || $days >= self::STALE_AFTER_DAYS) {
                $stale[] = ['type' => $row['type'], 'days' => $days];
            }
        }

        $lastNews = $this->queries->lastNewsPostedAt();

        return [
            'last_news_days' => $lastNews ? (int) $lastNews->diff($now)->days : null,
            'stale' => $stale,
            'stale_after_days' => self::STALE_AFTER_DAYS,
        ];
    }

    /** Every year from the first batch to the last, so gaps show as gaps on the time axis. */
    private function continuousYears(array $byYear): array
    {
        if ($byYear === []) {
            return [];
        }

        $out = [];
        for ($year = min(array_keys($byYear)); $year <= max(array_keys($byYear)); $year++) {
            $out[$year] = $byYear[$year] ?? 0;
        }

        return $out;
    }

    /** @return list<array{string: int|string, count: int}> */
    private function pairs(array $map, string $key): array
    {
        return array_map(fn ($k, $v) => [$key => $k, 'count' => $v], array_keys($map), array_values($map));
    }
}
