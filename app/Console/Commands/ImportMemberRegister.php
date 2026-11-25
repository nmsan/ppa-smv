<?php

namespace App\Console\Commands;

use App\Application\Membership\UseCases\ImportLegacyMembers;
use App\Infrastructure\Import\RegisterCsvReader;
use Illuminate\Console\Command;

/**
 * php artisan members:import-register storage/app/private/imports/register.csv --dry-run
 * php artisan members:import-register storage/app/private/imports/register.csv
 */
class ImportMemberRegister extends Command
{
    protected $signature = 'members:import-register
        {file : CSV export of the register\'s "Database" sheet}
        {--dry-run : Check the file and show the report without saving anything}';

    protected $description = 'Import members from the old Google Sheet register';

    public function handle(ImportLegacyMembers $import, RegisterCsvReader $reader): int
    {
        $report = $import->execute($reader->read($this->argument('file')), (bool) $this->option('dry-run'));

        $this->newLine();
        $this->line($this->option('dry-run') ? '<options=bold>Dry run: nothing was saved.</>' : '<options=bold>Import finished.</>');
        $this->table(['', 'Rows'], [
            ['Imported', $report->imported],
            ['  of which waiting as applicants (no membership number)', $report->asApplicants],
            ['Already in the platform, skipped', $report->alreadyImported],
            ['Empty rows, skipped', $report->emptyRows],
            ['Rows with something to check', count(array_unique(array_column($report->issues, 'line')))],
        ]);

        if ($report->issues !== []) {
            $this->newLine();
            $this->line('Fix these in the platform later, or in the sheet before importing:');
            $this->table(['Sheet row', 'Number', 'What happened'], array_map(
                fn ($i) => [$i['line'], $i['number'] ?? '–', $i['issue']],
                $report->issues,
            ));
        }

        return self::SUCCESS;
    }
}
