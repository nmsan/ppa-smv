<?php

namespace App\Infrastructure\Import;

use App\Application\Membership\Import\RegisterRow;
use Generator;
use RuntimeException;
use SplFileObject;

/**
 * Reads a CSV export of the register's "Database" sheet (File → Download → CSV).
 * Columns are found by their header text, so their order does not matter.
 * Columns the platform does not keep (address, date of birth, profession,
 * workplace, family details, payment slips) are never read.
 */
final class RegisterCsvReader
{
    /** Header text to look for (lower case, partial match) → RegisterRow field. */
    private const COLUMNS = [
        'membership number' => 'membershipNumber',
        'cataegory' => 'category',
        'category' => 'category',
        'data filling' => 'joinedVia',
        'membership fee' => 'fee2024',
        'timestamp' => 'timestamp',
        'full name' => 'fullName',
        'gender' => 'gender',
        'contact number' => 'phone',
        'whatsapp' => 'whatsapp',
        'nic' => 'nic',
        'email' => 'email',
        'country' => 'country',
        'admission number' => 'admissionNumber',
        'o/l year' => 'olYear',
        'a/l year' => 'alYear',
    ];

    /** @return Generator<RegisterRow> */
    public function read(string $path): Generator
    {
        if (! is_readable($path)) {
            throw new RuntimeException("Cannot read {$path}");
        }

        $file = new SplFileObject($path);
        $file->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY | SplFileObject::READ_AHEAD);

        $map = null;
        foreach ($file as $index => $cells) {
            if (! is_array($cells) || $cells === [null]) {
                continue;
            }

            if ($map === null) {
                $map = $this->headerMap($cells);

                continue;
            }

            $values = array_fill_keys(array_unique(array_values(self::COLUMNS)), null);
            foreach ($map as $column => $field) {
                $values[$field] = isset($cells[$column]) ? (string) $cells[$column] : null;
            }

            yield new RegisterRow(...['line' => $index + 1] + $values);
        }

        if ($map === null) {
            throw new RuntimeException('No header row with "Membership Number" and "Full Name" was found.');
        }
    }

    /**
     * Returns null until the header row is reached (the sheet has title rows above it).
     *
     * @param  list<?string>  $cells
     * @return array<int, string>|null
     */
    private function headerMap(array $cells): ?array
    {
        $map = [];
        foreach ($cells as $column => $header) {
            $header = strtolower(trim((string) $header));
            foreach (self::COLUMNS as $needle => $field) {
                if ($header !== '' && str_contains($header, $needle) && ! in_array($field, $map, true)) {
                    $map[$column] = $field;
                    break;
                }
            }
        }

        return in_array('membershipNumber', $map, true) && in_array('fullName', $map, true) ? $map : null;
    }
}
