<?php

namespace App\Application\Ports;

interface Notifier
{
    /** @param array<string, scalar|null> $data */
    public function notifyMember(string $memberId, string $template, array $data = []): void;
}
