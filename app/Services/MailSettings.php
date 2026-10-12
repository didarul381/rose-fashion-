<?php

namespace App\Services;

use App\Models\Setting;

class MailSettings
{
    public const MAILER_NAME = 'admin_alerts';

    public static function enabled(): bool
    {
        return (string) Setting::get('mail_status', '0') === '1';
    }

    public static function alertEnabled(string $type): bool
    {
        return match ($type) {
            'register' => (string) Setting::get('mail_alert_register', '0') === '1',
            'orders', 'order' => (string) Setting::get('mail_alert_orders', '0') === '1',
            default => false,
        };
    }

    public static function recipients(): array
    {
        $raw = (string) Setting::get('mail_alert_recipients', '');

        if ($raw === '') {
            $raw = (string) Setting::get('contact_email', '');
        }

        return collect(preg_split('/[\s,;]+/', $raw) ?: [])
            ->map(fn ($email) => trim((string) $email))
            ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values()
            ->all();
    }

    public static function configureMailer(): bool
    {
        $transport = (string) Setting::get('mail_transport', 'smtp');
        $fromAddress = trim((string) Setting::get('mail_from_address', Setting::get('contact_email', '')));
        $fromName = trim((string) Setting::get('mail_from_name', Setting::get('store_name', config('app.name'))));

        if (! filter_var($fromAddress, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        if ($transport === 'log') {
            config()->set('mail.mailers.' . self::MAILER_NAME, [
                'transport' => 'log',
                'channel' => null,
            ]);
        } else {
            $host = trim((string) Setting::get('mail_host', ''));
            $port = (int) Setting::get('mail_port', 587);

            if ($host === '' || $port < 1) {
                return false;
            }

            $encryption = (string) Setting::get('mail_encryption', 'tls');
            $scheme = in_array($encryption, ['tls', 'ssl'], true) ? $encryption : null;

            config()->set('mail.mailers.' . self::MAILER_NAME, [
                'transport' => 'smtp',
                'scheme' => $scheme,
                'url' => null,
                'host' => $host,
                'port' => $port,
                'username' => Setting::get('mail_username', null) ?: null,
                'password' => Setting::get('mail_password', null) ?: null,
                'timeout' => max(3, (int) Setting::get('mail_timeout', 10)),
                'local_domain' => parse_url((string) config('app.url'), PHP_URL_HOST),
            ]);
        }

        config()->set('mail.from.address', $fromAddress);
        config()->set('mail.from.name', $fromName ?: config('app.name'));

        $manager = app('mail.manager');
        if (method_exists($manager, 'purge')) {
            $manager->purge(self::MAILER_NAME);
        } elseif (method_exists($manager, 'forgetMailers')) {
            $manager->forgetMailers();
        }

        return true;
    }
}
