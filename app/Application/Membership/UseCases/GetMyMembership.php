<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\DTO\MyMembershipView;
use App\Application\Ports\MemberRepository;

final readonly class GetMyMembership
{
    public function __construct(private MemberRepository $members) {}

    public function execute(int $userId): ?MyMembershipView
    {
        $member = $this->members->findByUserId($userId);

        return $member ? MyMembershipView::from($member) : null;
    }
}
