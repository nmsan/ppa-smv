<?php

namespace App\Console\Commands;

use App\Application\Ports\SupporterRepository;
use App\Domain\Fundraising\Contribution;
use App\Domain\Fundraising\ContributionType;
use App\Domain\Fundraising\FundraisingEvent;
use App\Domain\Fundraising\Supporter;
use App\Domain\Fundraising\SupporterKind;
use App\Domain\Shared\Money;
use App\Infrastructure\Persistence\Eloquent\Models\ContributionModel;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Models\ContentEntry;
use DateTimeImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * Moves the old "Main sponsors" and "Best donors" lists (one row per name, one
 * amount) into supporter accounts. Runs once per list.
 *
 * - A sponsor row naming two events with one amount cannot be split honestly,
 *   so it is recorded under a "(combined)" event.
 * - A donor is linked to a member only when exactly one member has the same
 *   name and the same batch year. Anything less certain is left for the
 *   treasurer to link by membership number.
 */
class ImportSupporterLists extends Command
{
    public const NOTES = [
        'sponsors' => 'Imported from the old Main sponsors list',
        'donors' => 'Imported from the old Best donors list',
    ];

    protected $signature = 'supporters:import-lists';

    protected $description = 'Move the old Main sponsors and Best donors lists into supporter accounts';

    public function handle(SupporterRepository $repo): int
    {
        foreach (['sponsors' => ContributionType::Sponsorship, 'donors' => ContributionType::Donation] as $list => $type) {
            if (ContributionModel::query()->where('note', self::NOTES[$list])->exists()) {
                $this->line("{$list}: already imported, nothing to do");

                continue;
            }

            $entry = ContentEntry::query()->where('type', $list)->first();
            $path = resource_path("content/{$list}.json");
            $rows = ($entry?->data ?? (File::exists($path) ? json_decode(File::get($path), true) : []))['rows'] ?? [];

            $made = ['supporters' => 0, 'events' => 0, 'contributions' => 0, 'linked' => 0];
            DB::transaction(function () use ($rows, $repo, $type, $list, &$made, $entry) {
                foreach ($rows as $row) {
                    $cents = $this->cents((string) ($row['amount'] ?? ''));
                    $name = trim((string) ($row['name'] ?? ''));
                    if ($cents === null || $name === '') {
                        $this->warn("{$list}: skipped \"{$name}\": amount \"{$row['amount']}\" not understood");

                        continue;
                    }

                    $supporter = $repo->findSupporterByName($name);
                    if (! $supporter) {
                        $supporter = $type === ContributionType::Donation
                            ? $this->newDonor($repo, $name, $row['note'] ?? null, $made)
                            : Supporter::create($repo->nextId(), $name, SupporterKind::Business);
                        $repo->saveSupporter($supporter);
                        $made['supporters']++;
                    }

                    $eventId = $type === ContributionType::Sponsorship ? $this->eventFor($repo, $row['note'] ?? null, $made) : null;

                    $repo->addContribution(Contribution::record(
                        $repo->nextId(), $supporter->id, $type, $eventId, Money::fromCents($cents), null, null,
                        self::NOTES[$list], null, new DateTimeImmutable,
                    ));
                    $made['contributions']++;
                }

                // The public page now reads from the accounts; the old list is no longer edited.
                $entry?->delete();
            });

            $this->info("{$list}: {$made['contributions']} contributions for {$made['supporters']} supporters"
                .($type === ContributionType::Sponsorship ? " across {$made['events']} events" : ", {$made['linked']} linked to members"));
        }

        return self::SUCCESS;
    }

    private function newDonor(SupporterRepository $repo, string $name, ?string $note, array &$made): Supporter
    {
        $year = $note && preg_match('/(19|20)\d{2}/', $note, $m) ? (int) $m[0] : null;
        $memberId = null;

        if ($year) {
            $matches = MemberModel::query()->where('batch_key', $year)->get(['id', 'full_name'])
                ->filter(fn ($member) => $this->sameName($member->full_name, $name));
            if ($matches->count() === 1 && ! $repo->findSupporterByMember($matches->first()->id)) {
                $memberId = $matches->first()->id;
                $made['linked']++;
            }
        }

        return Supporter::create($repo->nextId(), $name, SupporterKind::Individual, $memberId, publicNote: $note && trim($note) !== '-' ? trim($note) : null);
    }

    private function eventFor(SupporterRepository $repo, ?string $note, array &$made): ?string
    {
        $names = array_values(array_filter(array_map('trim', explode('/', (string) $note))));
        if ($names === []) {
            return null;
        }
        $eventName = count($names) > 1 ? implode(' + ', $names).' (combined)' : $names[0];
        $event = $repo->findEventByName($eventName);
        if (! $event) {
            $event = FundraisingEvent::create($repo->nextId(), $eventName);
            $repo->saveEvent($event);
            $made['events']++;
        }

        return $event->id;
    }

    /** "Mr. Mangala  Alahakoon" and "mangala alahakoon" are the same name. */
    private function sameName(string $a, string $b): bool
    {
        $clean = fn (string $n) => trim(preg_replace('/\s+/', ' ', preg_replace('/^(mr|mrs|ms|miss|dr|eng|rev)\.?\s+/i', '', mb_strtolower(str_replace('.', ' ', $n)))));

        return $clean($a) === $clean($b);
    }

    private function cents(string $text): ?int
    {
        if (preg_match('/x/i', $text) || ! preg_match('/\d[\d,]*(\.\d{1,2})?/', $text, $m)) {
            return null;
        }

        return (int) round(((float) str_replace(',', '', $m[0])) * 100);
    }
}
