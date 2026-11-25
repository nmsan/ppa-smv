<?php

namespace App\Application\Fundraising\UseCases;

use App\Application\Fundraising\RequiresTreasurer;
use App\Application\Ports\Clock;
use App\Application\Ports\SupporterRepository;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Fundraising\Contribution;

/** Cancels a wrongly recorded payment. The line stays in the account history, marked as voided. */
final readonly class VoidContribution
{
    use RequiresTreasurer;

    public function __construct(private SupporterRepository $supporters, private Clock $clock) {}

    public function execute(string $id, string $reason, Actor $actor): Contribution
    {
        $this->authorise($actor);
        $contribution = $this->supporters->findContribution($id) ?? throw new NotFoundException('Contribution not found.');
        $contribution->void($reason, $actor->userId, $this->clock->now());
        $this->supporters->markVoided($contribution);

        return $contribution;
    }
}
