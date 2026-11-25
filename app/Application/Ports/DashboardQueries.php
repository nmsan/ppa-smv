<?php

namespace App\Application\Ports;

use DateTimeImmutable;

/** Read-only numbers for the dashboard. Never returns personal details beyond names in the activity feed. */
interface DashboardQueries
{
    /** @return array{members: int, pending: int, oldest_pending: ?DateTimeImmutable, this_month: int, last_month: int, approval_days: ?float, batches: int} */
    public function membershipTotals(?int $batchKey = null): array;

    /** @return array<int, int> batch year => members */
    public function membersByBatch(): array;

    /** @return array<string, int> 'YYYY-MM' => applications, for the last N months (zeros included) */
    public function applicationsByMonth(int $months): array;

    /** @return array<string, int> */
    public function membersByJoinChannel(): array;

    /** @return array<string, int> */
    public function membersByCategory(): array;

    /** @return list<int> batch years that have at least one batch representative */
    public function batchesWithRepresentative(): array;

    /** @return array{total: int, missing_email: int, missing_phone: int, missing_nic: int, missing_batch: int, overseas: int} */
    public function profileCompleteness(): array;

    /** @return list<array{type: string, updated_at: ?DateTimeImmutable}> */
    public function contentLastUpdated(): array;

    public function lastNewsPostedAt(): ?DateTimeImmutable;

    /** @return list<array{title: string, date: string}> */
    public function upcomingEvents(string $today, int $limit): array;

    /** @return list<array{at: DateTimeImmutable, who: ?string, what: string, kind: string}> */
    public function recentActivity(array $kinds, int $limit): array;

    /** @return array<string, int> role => users */
    public function usersByRole(): array;

    /** @return array{number: ?string, status: string, batch: ?int, batch_members: int}|null */
    public function membershipOf(int $userId): ?array;
}
