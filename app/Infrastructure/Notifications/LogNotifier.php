<?php

namespace App\Infrastructure\Notifications;

use App\Application\Ports\Notifier;
use Illuminate\Support\Facades\Log;

/** Placeholder until the email (Resend/SES) and SMS (Notify.lk) notifiers are built. */
final class LogNotifier implements Notifier
{
    public function notifyMember(string $memberId, string $template, array $data = []): void
    {
        Log::info('notification', ['member' => $memberId, 'template' => $template, 'data' => $data]);
    }
}
