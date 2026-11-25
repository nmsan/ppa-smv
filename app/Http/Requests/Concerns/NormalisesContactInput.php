<?php

namespace App\Http\Requests\Concerns;

/**
 * Accepts phone numbers and NICs the way people type them: "077 123 4567",
 * "077-123-4567", "+94 77 123 4567", "1998 1234 5678". They are tidied before
 * validation, so only genuinely wrong values are refused.
 */
trait NormalisesContactInput
{
    /** @param list<string> $phones @param list<string> $nics */
    protected function normaliseContactInput(array $phones, array $nics = ['nic']): void
    {
        $changes = [];

        foreach ($phones as $key) {
            $value = $this->input($key);
            if (is_string($value) && trim($value) !== '') {
                $digits = preg_replace('/[^\d+]/', '', $value);
                if (preg_match('/^\+?94(\d{9})$/', $digits, $m)) {
                    $digits = '0'.$m[1];           // Sri Lankan number written with +94
                } elseif (preg_match('/^\d{9}$/', $digits)) {
                    $digits = '0'.$digits;         // leading 0 left off
                }
                $changes[$key] = $digits;
            }
        }

        foreach ($nics as $key) {
            $value = $this->input($key);
            if (is_string($value) && trim($value) !== '') {
                $nic = strtoupper(preg_replace('/[\s-]/', '', $value));
                // A new 12-digit NIC with an old-style V/X added by habit.
                $changes[$key] = preg_match('/^(\d{12})[VX]$/', $nic, $m) ? $m[1] : $nic;
            }
        }

        $this->merge($changes);
    }
}
