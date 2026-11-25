<?php

namespace App\Application\Fundraising\UseCases;

use App\Application\Fundraising\RequiresTreasurer;
use App\Application\Ports\SupporterRepository;
use App\Application\Shared\ConflictException;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use DateTimeImmutable;

/** Corrects an event's name or date. Every contribution to it follows. */
final readonly class RenameFundraisingEvent
{
    use RequiresTreasurer;

    public function __construct(private SupporterRepository $supporters) {}

    public function execute(string $id, string $name, ?DateTimeImmutable $heldOn, Actor $actor): void
    {
        $this->authorise($actor);
        $event = $this->supporters->findEvent($id) ?? throw new NotFoundException('Event not found.');
        $other = $this->supporters->findEventByName($name);
        if ($other && $other->id !== $id) {
            throw new ConflictException("There is already an event called \"{$name}\".");
        }

        $this->supporters->saveEvent($event->renamed($name, $heldOn));
    }
}
