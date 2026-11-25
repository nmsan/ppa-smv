<?php

namespace App\Application\Membership\UseCases;

use App\Application\Membership\Import\ImportReport;
use App\Application\Membership\Import\RegisterRow;
use App\Application\Membership\Import\RegisterRowCleaner;
use App\Application\Ports\Clock;
use App\Application\Ports\MemberRepository;
use App\Application\Ports\UnitOfWork;
use App\Domain\Membership\Member;

/**
 * Brings the old Google Sheet register into the platform. Safe to run again:
 * people whose membership number is already in the platform are skipped.
 */
final readonly class ImportLegacyMembers
{
    public function __construct(
        private MemberRepository $members,
        private RegisterRowCleaner $cleaner,
        private UnitOfWork $unitOfWork,
        private Clock $clock,
    ) {}

    /** @param iterable<RegisterRow> $rows */
    public function execute(iterable $rows, bool $dryRun = false): ImportReport
    {
        $report = new ImportReport;
        $seenNumbers = [];
        $seenNics = [];

        $this->unitOfWork->run(function () use ($rows, $dryRun, $report, &$seenNumbers, &$seenNics) {
            foreach ($rows as $row) {
                $clean = $this->cleaner->clean($row);
                if ($clean === null) {
                    $report->emptyRows++;

                    continue;
                }

                $number = $clean->number ? (string) $clean->number : null;

                if ($number !== null && (isset($seenNumbers[$number]) || $this->members->existsByMembershipNumber($number))) {
                    isset($seenNumbers[$number])
                        ? $report->note($clean->line, $number, 'same membership number appears twice in the sheet; second row skipped')
                        : $report->alreadyImported++;

                    continue;
                }

                $nic = $clean->nic;
                if ($nic !== null && (isset($seenNics[$nic]) || $this->members->existsByNic($nic))) {
                    $report->note($clean->line, $number, 'NIC already belongs to another member; left empty');
                    $nic = null;
                }

                foreach ($clean->issues as $issue) {
                    $report->note($clean->line, $number, $issue);
                }

                $member = Member::fromRegister(
                    $this->members->nextId(), $clean->number, $clean->category, $clean->fullName,
                    $clean->email, $clean->phone, $nic, $clean->batch, $clean->profile,
                    $clean->registeredAt ?? $this->clock->now(),
                );

                if (! $dryRun) {
                    $this->members->save($member);
                }

                $number !== null ? $seenNumbers[$number] = true : $report->asApplicants++;
                if ($nic !== null) {
                    $seenNics[$nic] = true;
                }
                $report->imported++;
            }
        });

        return $report;
    }
}
