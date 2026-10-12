<?php

namespace App\Jobs;

use App\Services\MetaCapiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendMetaCapiEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $eventName;
    protected $userData;
    protected $customData;
    protected $eventId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $eventName, array $userData = [], array $customData = [], ?string $eventId = null)
    {
        $this->eventName = $eventName;
        $this->userData = $userData;
        $this->customData = $customData;
        $this->eventId = $eventId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        MetaCapiService::sendEvent(
            $this->eventName,
            $this->userData,
            $this->customData,
            $this->eventId
        );
    }
}
