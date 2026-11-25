<?php

namespace App\Application\Ports;

use App\Domain\Fundraising\Contribution;
use App\Domain\Fundraising\FundraisingEvent;
use App\Domain\Fundraising\Supporter;

/** Supporters (sponsors and donors), fundraising events and the contribution ledger. */
interface SupporterRepository
{
    public function nextId(): string;

    public function saveSupporter(Supporter $supporter): void;

    public function findSupporter(string $id): ?Supporter;

    public function findSupporterByName(string $name): ?Supporter;

    public function findSupporterByMember(string $memberId): ?Supporter;

    public function saveEvent(FundraisingEvent $event): void;

    public function findEvent(string $id): ?FundraisingEvent;

    public function findEventByName(string $name): ?FundraisingEvent;

    /** Adds a new ledger line. Existing lines are never rewritten, only voided. */
    public function addContribution(Contribution $contribution): void;

    public function findContribution(string $id): ?Contribution;

    public function markVoided(Contribution $contribution): void;
}
