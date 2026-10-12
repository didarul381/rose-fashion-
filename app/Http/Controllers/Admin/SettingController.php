<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Traits\HandlesAdminMedia;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class SettingController extends Controller
{
    use HandlesAdminMedia;

    /**
     * Theme Settings Dashboard CRUD.
     */
    public function settings()
    {
        $settings = Setting::all()
            ->map(function ($setting) {
                if ($setting->key === 'mail_password') {
                    $setting->value = '';
                }

                return $setting;
            })
            ->groupBy('group');

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Save key-value settings.
     */
    public function saveSettings(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($this->normalizeMediaValues($request->settings) as $key => $value) {
            $group = str_starts_with($key, 'mail_') ? 'mail' : 'general';

            if ($key === 'mail_password') {
                if ($value === null || $value === '') {
                    continue;
                }

                Setting::setSecure($key, $value, $group);

                continue;
            }

            Setting::set($key, $value, $group);
        }

        return redirect()->back()->with('success', 'System configurations updated.');
    }

    /**
     * Generate dynamic XML Sitemap & Robots.txt for marketing.
     */
    public function generateSitemap()
    {
        $products = Product::where('status', 'active')->get();
        $categories = Category::where('is_active', true)->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'.PHP_EOL;
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'.PHP_EOL;

        // Main links
        $xml .= '  <url>'.PHP_EOL;
        $xml .= '    <loc>'.url('/').'</loc>'.PHP_EOL;
        $xml .= '    <priority>1.0</priority>'.PHP_EOL;
        $xml .= '  </url>'.PHP_EOL;

        // Categories
        foreach ($categories as $cat) {
            $xml .= '  <url>'.PHP_EOL;
            $xml .= '    <loc>'.url('/category/'.$cat->slug).'</loc>'.PHP_EOL;
            $xml .= '    <priority>0.8</priority>'.PHP_EOL;
            $xml .= '  </url>'.PHP_EOL;
        }

        // Products
        foreach ($products as $prod) {
            $xml .= '  <url>'.PHP_EOL;
            $xml .= '    <loc>'.url('/product/'.$prod->slug).'</loc>'.PHP_EOL;
            $xml .= '    <priority>0.9</priority>'.PHP_EOL;
            $xml .= '  </url>'.PHP_EOL;
        }

        $xml .= '</urlset>';

        // Write to public/sitemap.xml
        File::put(public_path('sitemap.xml'), $xml);

        // Write robots.txt
        $robots = 'User-agent: *'.PHP_EOL;
        $robots .= 'Allow: /'.PHP_EOL;
        $robots .= 'Sitemap: '.url('sitemap.xml').PHP_EOL;
        File::put(public_path('robots.txt'), $robots);

        return redirect()->back()->with('success', 'Sitemap.xml and Robots.txt generated successfully in public root!');
    }

    /**
     * Render Payment Methods Configuration page.
     */
    public function paymentMethods()
    {
        $settings = Setting::where('group', 'payment')
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();

        // Set default values if keys do not exist in settings
        $defaults = [
            'payment_cod_status' => '1',
            'payment_bkash_status' => '0',
            'payment_bkash_app_key' => '',
            'payment_bkash_app_secret' => '',
            'payment_bkash_username' => '',
            'payment_bkash_password' => '',
            'payment_bkash_sandbox' => '1',
            'payment_nagad_status' => '0',
            'payment_nagad_mode' => 'sandbox',
            'payment_nagad_merchant_id' => '',
            'payment_nagad_merchant_number' => '',
            'payment_nagad_public_key' => '',
            'payment_nagad_private_key' => '',
        ];

        foreach ($defaults as $key => $val) {
            if (! isset($settings[$key])) {
                $settings[$key] = $val;
            }
        }

        return Inertia::render('Admin/PaymentMethods', [
            'settings' => $settings,
        ]);
    }

    /**
     * Save Payment Methods configurations.
     */
    public function savePaymentMethods(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $key => $value) {
            Setting::set($key, $value, 'payment');
        }

        return redirect()->back()->with('success', 'Payment methods configurations saved successfully!');
    }
}
