<?php

namespace Tests\Fakes;

use App\Application\Ports\Notifier;

final class SpyNotifier implements Notifier
{
    /** @var list<array{string, string, array<string, mixed>}> */
    public array $sent = [];

    public function notifyMember(string $memberId, string $template, array $data = []): void
    {
        $this->sent[] = [$memberId, $template, $data];
    }
}
