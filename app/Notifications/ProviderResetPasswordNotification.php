<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;

/**
 * Identical to Laravel's built-in ResetPassword notification, except it
 * actually gets delivered: the default notification mail goes out through
 * the app's default mailer (MAIL_MAILER=log), which just writes the email
 * to the log file instead of sending it anywhere. Routing through
 * 'outreach' (real Brevo SMTP, sends as rehan@maakhq.com) is the same fix
 * already applied to every other real outbound provider email
 * (see app/Mail/*.php).
 */
class ProviderResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable)
    {
        return parent::toMail($notifiable)->mailer('outreach');
    }
}
