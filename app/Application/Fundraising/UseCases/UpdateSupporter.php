<?php

namespace App\Application\Fundraising\UseCases;

use App\Application\Fundraising\DTO\SupporterData;
use App\Application\Fundraising\RequiresTreasurer;
use App\Application\Ports\SupporterRepository;
use App\Application\Shared\ConflictException;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Fundraising\Supporter;

final readonly class UpdateSupporter
{
    use RequiresTreasurer;

    public function __construct(private SupporterRepository $supporters) {}

    public function execute(string $id, SupporterData $d, Actor $actor): Supporter
    {
        $this->authorise($actor);
        $supporter = $this->supporters->findSupporter($id) ?? throw new NotFoundException('Supporter not found.');
        $other = $this->supporters->findSupporterByName($d->name);
        if ($other && $other->id !== $id) {
            throw new ConflictException("Another supporter is already called \"{$d->name}\".");
        }

        $updated = $supporter->withDetails($d->name, $d->kind, $d->contactName, $d->phone, $d->email, $d->publicNote, $d->notes, $d->showPublicly);
        $this->supporters->saveSupporter($updated);

        return $updated;
    }
}
