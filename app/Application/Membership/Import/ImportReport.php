<?php

namespace App\Application\Membership\Import;

/** What an import did. Identifies rows by line and membership number only, never by personal details. */
final class ImportReport
{
    public int $imported = 0;

    public int $asApplicants = 0;

    public int $alreadyImported = 0;

    public int $emptyRows = 0;

    /** @var list<array{line: int, number: ?string, issue: string}> */
    public array $issues = [];

    public function note(int $line, ?string $number, string $issue): void
    {
        $this->issues[] = ['line' => $line, 'number' => $number, 'issue' => $issue];
    }
}
