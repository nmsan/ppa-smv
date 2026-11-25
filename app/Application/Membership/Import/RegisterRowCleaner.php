<?php

namespace App\Application\Membership\Import;

use App\Domain\Membership\Batch;
use App\Domain\Membership\MemberProfile;
use App\Domain\Membership\MembershipCategory;
use App\Domain\Membership\MembershipNumber;
use App\Domain\Shared\DomainRuleViolation;
use DateTimeImmutable;

/**
 * Data-quality rules for the old register: the same answer was typed many ways
 * ("Srilanka", "N/A", "1997/2000", reversed years). Anything that cannot be
 * understood is left empty and reported, never guessed.
 */
final class RegisterRowCleaner
{
    private const SRI_LANKA = ['sri lanka', 'srilanka', 'sri lankan', 'sri-lanka', 'lanka', 'sl', 'ශ්‍රී ලංකාව', 'ශ්රී ලංකාව'];

    /** Returns null when the row is empty (no name and no number). */
    public function clean(RegisterRow $row): ?CleanRegisterRow
    {
        $issues = [];
        $name = $this->text($row->fullName);
        $numberText = $this->text($row->membershipNumber);

        if ($name === null) {
            return null;
        }

        $number = null;
        if ($numberText !== null) {
            $number = $this->membershipNumber($numberText);
            if ($number === null) {
                $issues[] = "membership number \"{$numberText}\" not understood; imported as an applicant";
            }
        }

        [$batch, $batchIssue] = $this->batch($row->olYear, $row->alYear);
        if ($batchIssue) {
            $issues[] = $batchIssue;
        }

        [$phone, $phoneIssue] = $this->phone($row->phone, 'phone');
        [$whatsapp, $waIssue] = $this->phone($row->whatsapp, 'WhatsApp number');
        array_push($issues, ...array_filter([$phoneIssue, $waIssue]));

        $email = $this->text($row->email);
        if ($email !== null && ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $issues[] = 'email not valid, left empty';
            $email = null;
        }

        $nic = $this->text($row->nic);
        if ($nic !== null) {
            $nic = strtoupper(preg_replace('/\s+/', '', $nic));
            // A new 12-digit NIC with an old-style V/X added by habit: the letter is dropped.
            if (preg_match('/^(\d{12})[VX]$/', $nic, $m)) {
                $nic = $m[1];
            }
            if (! preg_match('/^(\d{9}[VX]|\d{12}|[A-Z]\d{7,8})$/', $nic)) {
                $issues[] = 'NIC/passport number not valid, left empty';
                $nic = null;
            }
        }

        return new CleanRegisterRow(
            line: $row->line,
            number: $number,
            category: $this->category($row->category),
            fullName: preg_replace('/\s+/', ' ', $name),
            email: $email ? strtolower($email) : null,
            phone: $phone,
            nic: $nic,
            batch: $batch,
            profile: new MemberProfile(
                gender: $this->gender($row->gender),
                whatsapp: $whatsapp,
                country: $this->country($row->country),
                admissionNumber: $this->text($row->admissionNumber),
                joinedVia: $this->joinedVia($row->joinedVia),
                fee2024: $this->fee($row->fee2024),
            ),
            registeredAt: $this->timestamp($row->timestamp),
            issues: $issues,
        );
    }

    private function text(?string $value): ?string
    {
        $value = $value === null ? null : trim(preg_replace('/\s+/u', ' ', $value));

        return $value === '' || in_array(strtolower((string) $value), ['n/a', 'na', '-', 'no', 'none', 'nil'], true) ? null : $value;
    }

    private function membershipNumber(string $value): ?MembershipNumber
    {
        if (preg_match('/^M\s*-?\s*(\d{1,6})$/i', $value, $m)) {
            return MembershipNumber::fromSequence((int) $m[1]);
        }

        return null;
    }

    private function category(?string $value): MembershipCategory
    {
        return match (strtolower((string) $this->text($value))) {
            'honorary' => MembershipCategory::Honorary,
            'life', 'life member' => MembershipCategory::Life,
            default => MembershipCategory::Annual,
        };
    }

    /** @return array{0: ?Batch, 1: ?string} */
    private function batch(?string $ol, ?string $al): array
    {
        $olText = $this->text($ol);
        $alText = $this->text($al);

        // "1997/2000" typed into one cell: O/L and A/L together.
        foreach ([$olText, $alText] as $cell) {
            if ($cell && preg_match('/^(\d{4})\s*[\/,&-]\s*(\d{4})$/', $cell, $m)) {
                [$olText, $alText] = [$m[1], $m[2]];
            }
        }

        $olYear = $this->year($olText);
        $alYear = $this->year($alText);
        $issue = null;

        if (($olText !== null && $olYear === null) || ($alText !== null && $alYear === null)) {
            $issue = 'a batch year was not understood';
        }

        if ($olYear && $alYear && $olYear > $alYear) {
            [$olYear, $alYear] = [$alYear, $olYear];
            $issue = 'O/L and A/L years were swapped; corrected';
        }

        if ($olYear && $alYear && ($alYear - $olYear < 1 || $alYear - $olYear > 4)) {
            $issue = "O/L {$olYear} and A/L {$alYear} do not fit together; kept the A/L year only";
            $olYear = null;
        }

        if ($olYear === null && $alYear === null) {
            return [null, $issue ?? 'no batch year'];
        }

        try {
            return [Batch::of($olYear, $alYear), $issue];
        } catch (DomainRuleViolation $e) {
            return [null, 'batch year out of range, left empty'];
        }
    }

    private function year(?string $value): ?int
    {
        return $value !== null && preg_match('/^(19[4-9]\d|20[0-4]\d)$/', $value) ? (int) $value : null;
    }

    /** @return array{0: ?string, 1: ?string} */
    private function phone(?string $value, string $label): array
    {
        $text = $this->text($value);
        if ($text === null) {
            return [null, null];
        }

        $digits = preg_replace('/\D/', '', $text);
        if (str_starts_with($digits, '94') && strlen($digits) === 11) {
            $digits = '0'.substr($digits, 2);
        }
        if (strlen($digits) === 9) {
            $digits = '0'.$digits;
        }

        if (preg_match('/^0\d{9}$/', $digits)) {
            return [$digits, null];
        }
        if (strlen($digits) >= 8 && strlen($digits) <= 15) {
            return ['+'.ltrim($digits, '0'), null]; // overseas number
        }

        return [null, "{$label} not valid, left empty"];
    }

    private function gender(?string $value): ?string
    {
        return match (strtolower((string) $this->text($value))) {
            'male', 'm' => 'male',
            'female', 'f' => 'female',
            default => null,
        };
    }

    private function country(?string $value): ?string
    {
        $text = $this->text($value);
        if ($text === null) {
            return null;
        }

        return in_array(mb_strtolower($text), self::SRI_LANKA, true) ? 'Sri Lanka' : mb_convert_case($text, MB_CASE_TITLE);
    }

    private function joinedVia(?string $value): ?string
    {
        return match (strtolower((string) $this->text($value))) {
            'hard copy', 'hardcopy', 'paper' => 'paper',
            'google form', 'googleform' => 'google-form',
            'online' => 'online',
            'both' => 'paper-and-google-form',
            default => null,
        };
    }

    private function fee(?string $value): ?string
    {
        $text = strtolower((string) $this->text($value));

        return in_array($text, ['manual', 'online', 'direct'], true) ? $text : null;
    }

    private function timestamp(?string $value): ?DateTimeImmutable
    {
        $text = $this->text($value);
        foreach (['n/j/Y G:i:s', 'm/d/Y H:i:s', 'Y-m-d H:i:s', 'd/m/Y H:i:s', 'Y-m-d'] as $format) {
            $date = $text ? DateTimeImmutable::createFromFormat($format, $text) : false;
            if ($date !== false) {
                return $date;
            }
        }

        return null;
    }
}
