<?php

namespace App\Domain\Fundraising;

enum ContributionType: string
{
    case Sponsorship = 'sponsorship'; // usually a business backing an event
    case Donation = 'donation';       // usually a past pupil giving to a project

    public function label(): string
    {
        return $this === self::Sponsorship ? 'Sponsorship' : 'Donation';
    }
}
