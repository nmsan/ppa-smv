<?php

namespace App\Application\Ports;

/** Totals and lists for the treasurer's screens and the public pages. Voided lines never count. */
interface SupporterReadModel
{
    /** @return list<array<string, mixed>> every supporter with their sponsorship and donation totals */
    public function supporters(): array;

    /** @return array<string, mixed>|null one supporter's account: details, member link, totals and ledger */
    public function account(string $supporterId): ?array;

    /** @return list<array{id: string, name: string, held_on: ?string, sponsorship_cents: int, donation_cents: int, supporters: int}> */
    public function events(): array;

    /**
     * For a public page: each visible supporter's total of one type, broken down by event.
     *
     * @return list<array{name: string, note: ?string, total_cents: int, events: list<array{name: string, cents: int}>, first_received: ?string}>
     */
    public function publicBoard(string $type): array;

    /** @return array{donation_cents: int, sponsorship_cents: int, count: int}|null what a member has given, if they are a supporter */
    public function givingOfMember(string $memberId): ?array;
}
