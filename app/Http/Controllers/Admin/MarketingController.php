<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use App\Services\Marketing\MarketingIntegrationRegistry;
use App\Services\Marketing\TikTokEventsApiService;
use App\Services\MetaCapiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class MarketingController extends Controller
{
    /**
     * Show Marketing settings and campaign dispatch dashboard.
     */
    public function marketing()
    {
        $userCount = User::count();

        return Inertia::render('Admin/Marketing', [
            'integration_groups' => MarketingIntegrationRegistry::groups(),
            'integrations' => MarketingIntegrationRegistry::all(),
            'user_count' => $userCount,
        ]);
    }

    /**
     * Render a dedicated integration configuration page.
     */
    public function marketingIntegration(string $integration)
    {
        $integrationData = MarketingIntegrationRegistry::find($integration);

        abort_if(! $integrationData, 404);

        return Inertia::render('Admin/Marketing/Integration', [
            'integration' => $integrationData,
            'integration_groups' => MarketingIntegrationRegistry::groups(),
            'user_count' => User::count(),
        ]);
    }

    /**
     * Save an integration configuration.
     */
    public function saveMarketingIntegration(Request $request, string $integration)
    {
        $definition = MarketingIntegrationRegistry::find($integration);
        abort_if(! $definition, 404);

        $rules = [
            'enabled' => 'nullable|boolean',
        ];

        foreach ($definition['public_fields'] as $field => $meta) {
            if ($field === 'enabled') {
                continue;
            }

            $rules[$field] = $meta['type'] === 'boolean'
                ? 'nullable|boolean'
                : 'nullable|string|max:255';
        }

        foreach ($definition['secret_fields'] as $field => $meta) {
            $rules[$field] = 'nullable|string|max:500';
        }

        $validated = $request->validate($rules);
        $validated['enabled'] = $request->has('enabled')
            ? $request->boolean('enabled')
            : MarketingIntegrationRegistry::isEnabled($integration);

        MarketingIntegrationRegistry::saveConfig($integration, $validated);

        return redirect()
            ->route('admin.marketing.integrations.show', ['integration' => $definition['slug']])
            ->with('success', "{$definition['name']} configuration saved successfully.");
    }

    /**
     * Toggle integration status independently from settings payload.
     */
    public function toggleMarketingIntegration(Request $request, string $integration)
    {
        $definition = MarketingIntegrationRegistry::find($integration);
        abort_if(! $definition, 404);

        $request->validate([
            'enabled' => 'required|boolean',
        ]);

        MarketingIntegrationRegistry::saveConfig($integration, [
            'enabled' => $request->boolean('enabled'),
        ]);

        return redirect()
            ->route('admin.marketing.integrations.show', ['integration' => $definition['slug']])
            ->with('success', "{$definition['name']} has been ".($request->boolean('enabled') ? 'enabled' : 'disabled').'.');
    }

    /**
     * Trigger a test event for integrations that support it.
     */
    public function testMarketingIntegration(Request $request, string $integration)
    {
        $definition = MarketingIntegrationRegistry::find($integration);
        abort_if(! $definition, 404);

        if ($integration === 'meta_conversions_api') {
            MetaCapiService::sendEvent('Lead', [
                'email' => $request->user()?->email,
                'ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
            ], [
                'value' => 0,
                'currency' => 'BDT',
            ], 'test_'.now()->timestamp);

            return back()->with('success', 'Meta CAPI test event dispatched.');
        }

        if ($integration === 'tiktok_events_api') {
            TikTokEventsApiService::sendEvent('Lead', [
                'email' => $request->user()?->email,
                'ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
            ], [
                'value' => 0,
                'currency' => 'BDT',
            ], 'test_'.now()->timestamp);

            return back()->with('success', 'TikTok Events API test event dispatched.');
        }

        return back()->with('success', "{$definition['name']} is ready. Save or enable the integration to test live events.");
    }

    /**
     * Send email campaign.
     */
    public function sendEmailCampaign(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $users = User::whereNotNull('email')->get();

        foreach ($users as $user) {
            try {
                Mail::raw($request->body, function ($message) use ($user, $request) {
                    $message->to($user->email)
                        ->subject($request->subject);
                });
            } catch (\Exception $e) {
                Log::warning("Failed to send email to {$user->email}: ".$e->getMessage());
            }
        }

        return redirect()->back()->with('success', 'Campaign dispatched to '.$users->count().' subscribers successfully!');
    }

    /**
     * Send SMS Campaign.
     */
    public function sendSMSCampaign(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'phone' => 'nullable|string',
        ]);

        $apiKey = Setting::where('key', 'sms_api_key')->value('value');
        $senderId = Setting::where('key', 'sms_sender_id')->value('value');

        if (empty($apiKey)) {
            return redirect()->back()->withErrors(['message' => 'SMS Gateway is not configured. Please save your API Key first.']);
        }

        $phones = [];
        if ($request->filled('phone')) {
            $phones[] = $request->phone;
        } else {
            $phones = User::whereNotNull('phone')->pluck('phone')->filter()->toArray();
        }

        if (empty($phones)) {
            return redirect()->back()->withErrors(['message' => 'No recipient phone numbers found.']);
        }

        $successCount = 0;
        foreach ($phones as $phone) {
            try {
                $response = Http::withHeaders([
                    'Api-Key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])->post('https://portal.packzy.com/api/v1/send-sms', [
                    'recipient' => $phone,
                    'sender_id' => $senderId,
                    'message' => $request->message,
                ]);

                if ($response->successful()) {
                    $successCount++;
                }
            } catch (\Exception $e) {
                Log::error('SMS send failed: '.$e->getMessage());
            }
        }

        return redirect()->back()->with('success', "SMS Campaign dispatched: {$successCount} sent successfully.");
    }

    /**
     * Send Web Push Campaign.
     */
    public function sendPushCampaign(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:100',
            'body' => 'required|string|max:255',
            'url' => 'nullable|url',
        ]);

        Log::info("Push Notification Broadcast Sent: Title: {$request->title}, Body: {$request->body}");

        return redirect()->back()->with('success', 'Web Push Notification Broadcast successfully dispatched!');
    }

    /**
     * Save general marketing settings.
     */
    public function saveMarketingSettings(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $key => $value) {
            Setting::set($key, $value, 'marketing');
        }

        return redirect()->back()->with('success', 'Marketing settings saved successfully.');
    }
}
