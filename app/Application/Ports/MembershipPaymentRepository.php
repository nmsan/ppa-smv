<?php

namespace App\Application\Ports;

use App\Domain\Membership\MembershipPayment;

/** Membership fees recorded by the treasurer, and the lists the treasurer works from. */
interface MembershipPaymentRepository
{
    public function nextId(): string;

    public function add(MembershipPayment $payment): void;

    /**
     * Approved members whose fee has not been recorded yet, oldest approval first.
     * Without a search: only people who asked to join through the website.
     * With a search: anyone approved, matched by name or membership number (for renewals of old register members).
     *
     * @return list<array{id: string, name: string, number: ?string, category: string, fee_cents: ?int, phone: ?string, email: ?string, batch: ?int, approved_on: ?string}>
     */
    public function awaitingPayment(?string $search = null, int $limit = 100): array;

    /** @return list<array{id: string, member: string, number: ?string, category: string, amount_cents: int, channel: string, received_on: string, reference: ?string, recorded_by: ?string}> */
    public function recent(int $limit = 20): array;
}
