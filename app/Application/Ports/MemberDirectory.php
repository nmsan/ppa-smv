<?php

namespace App\Application\Ports;

use App\Application\Membership\DTO\MemberListQuery;

/** Read-only, paginated member list for the admin screens. Never returns the NIC. */
interface MemberDirectory
{
    /**
     * @return array{
     *     data: list<array{id: string, name: string, number: ?string, email: ?string, phone: ?string, batch: ?int, country: ?string, category: string, status: string, source: string, joined_on: ?string}>,
     *     total: int, page: int, per_page: int, last_page: int, from: ?int, to: ?int
     * }
     */
    public function page(MemberListQuery $query): array;

    /** @return array{batches: list<int>, countries: list<string>} the values the filters can offer, optionally within one batch */
    public function filterOptions(?int $batch = null): array;
}
