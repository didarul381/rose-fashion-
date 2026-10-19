<?php

namespace App\Jobs;

use App\Services\Marketing\TikTokEventsApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendTikTokEventsApiEvent
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $eventName;
    protected array $userData;
    protected array $customData;
    protected ?string $eventId;

    public function __construct(string $eventName, array $userData = [], array $customData = [], ?string $eventId = null)
    {
        $this->eventName = $eventName;
        $this->userData = $userData;
        $this->customData = $customData;
        $this->eventId = $eventId;
    }

    public function handle(): void
    {
        TikTokEventsApiService::sendEvent(
            $this->eventName,
            $this->userData,
            $this->customData,
            $this->eventId
        );
    }
}
