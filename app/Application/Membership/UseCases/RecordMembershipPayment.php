<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\DTO\MembershipPaymentData;
use App\Application\Membership\RequiresTreasurer;
use App\Application\Ports\Clock;
use App\Application\Ports\MemberRepository;
use App\Application\Ports\MembershipPaymentRepository;
use App\Application\Ports\Notifier;
use App\Application\Ports\UnitOfWork;
use App\Application\Shared\NotFoundException;
use App\Domain\Access\Actor;
use App\Domain\Membership\Member;
use App\Domain\Membership\MembershipPayment;
use App\Domain\Shared\Money;

/**
 * An office bearer collected the fee (cash, bank transfer, cheque...) and the
 * treasurer records it. Recording it makes the membership active.
 */
final readonly class RecordMembershipPayment
{
    use RequiresTreasurer;

    public function __construct(
        private MemberRepository $members,
        private MembershipPaymentRepository $payments,
        private UnitOfWork $unitOfWork,
        private Clock $clock,
        private Notifier $notifier,
    ) {}

    public function execute(MembershipPaymentData $d, Actor $actor): Member
    {
        $this->authorise($actor);

        $member = $this->unitOfWork->run(function () use ($d, $actor): Member {
            $member = $this->members->findById($d->memberId) ?? throw new NotFoundException('Member not found.');

            $payment = MembershipPayment::record(
                $this->payments->nextId(), $member->id, $member->category(), Money::fromCents($d->amountCents),
                $d->channel, $d->receivedOn, $d->reference, $d->note, $actor->userId, $this->clock->now(),
            );
            $member->activate();

            $this->members->save($member);
            $this->payments->add($payment);

            return $member;
        });

        $this->notifier->notifyMember($member->id, 'membership.paid', [
            'membership_number' => (string) $member->membershipNumber(),
            'amount' => Money::fromCents($d->amountCents)->format(),
        ]);

        return $member;
    }
}
