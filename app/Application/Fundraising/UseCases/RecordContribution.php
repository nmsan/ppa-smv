<?php

namespace App\Application\Fundraising\UseCases;

use App\Application\Fundraising\DTO\ContributionData;
use App\Application\Fundraising\RequiresTreasurer;
use App\Application\Ports\Clock;
use App\Application\Ports\SupporterRepository;
use App\Application\Ports\UnitOfWork;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Fundraising\Contribution;
use App\Domain\Fundraising\FundraisingEvent;
use App\Domain\Shared\Money;

/** Adds a payment to a sponsor's account. A new event can be created on the way. */
final readonly class RecordContribution
{
    use RequiresTreasurer;

    public function __construct(private SupporterRepository $supporters, private UnitOfWork $unitOfWork, private Clock $clock) {}

    public function execute(ContributionData $d, Actor $actor): Contribution
    {
        $this->authorise($actor);

        return $this->unitOfWork->run(function () use ($d, $actor) {
            $this->supporters->findSupporter($d->supporterId) ?? throw new NotFoundException('Supporter not found.');

            $eventId = null;
            if ($d->eventId) {
                $eventId = ($this->supporters->findEvent($d->eventId) ?? throw new NotFoundException('Event not found.'))->id;
            } elseif ($d->newEventName && trim($d->newEventName) !== '') {
                $event = $this->supporters->findEventByName($d->newEventName)
                    ?? FundraisingEvent::create($this->supporters->nextId(), $d->newEventName);
                $this->supporters->saveEvent($event);
                $eventId = $event->id;
            }

            $contribution = Contribution::record(
                $this->supporters->nextId(), $d->supporterId, $d->type, $eventId, Money::fromCents($d->amountCents),
                $d->receivedOn, $d->reference, $d->note, $actor->userId, $this->clock->now(),
            );
            $this->supporters->addContribution($contribution);

            return $contribution;
        });
    }
}
