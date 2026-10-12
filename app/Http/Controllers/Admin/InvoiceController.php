<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Traits\HandlesAdminMedia;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    use HandlesAdminMedia;

    /**
     * Render Invoices management page.
     */
    public function invoices(Request $request)
    {
        $settings = Setting::where('group', 'invoice')
            ->orWhere('key', 'like', 'invoice_%')
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();

        $defaults = [
            'invoice_style' => 'modern',
            'invoice_prefix' => 'GOV',
            'invoice_show_product_image' => '1',
            'invoice_company_name' => Setting::get('invoice_company_name', Setting::get('site_name', Setting::get('theme_name', Setting::get('site_title', 'Online Store')))),
            'invoice_company_address' => 'Dhaka, Bangladesh',
            'invoice_company_phone' => '+8801700000000',
            'invoice_company_website' => Setting::get('invoice_company_website', 'www.mahmudtrading.com'),
            'invoice_company_email' => Setting::get('contact_email', 'support@mahmudtrading.com'),
            'invoice_footer_note' => 'Thank you for shopping with us!',
        ];

        foreach ($defaults as $key => $val) {
            if (! isset($settings[$key])) {
                $settings[$key] = $val;
            }
        }

        $query = Order::orderBy('created_at', 'desc');
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Invoices', [
            'invoice_settings' => (object) $settings,
            'orders' => $orders,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Save Invoice Settings.
     */
    public function saveInvoiceSettings(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($this->normalizeMediaValues($request->settings) as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value ?? '', 'group' => 'invoice']
            );
        }

        return redirect()->back()->with('success', 'Invoice settings updated successfully!');
    }

    /**
     * Print Bulk Invoices.
     */
    public function printBulkInvoice(Request $request)
    {
        $ids = explode(',', $request->get('ids', ''));
        $orders = Order::with('items.product.primaryImage')->whereIn('id', $ids)->get();

        $settings = Setting::where('group', 'invoice')
            ->orWhere('key', 'like', 'invoice_%')
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();
        $defaults = [
            'invoice_style' => 'modern',
            'invoice_prefix' => 'GOV',
            'invoice_show_product_image' => '1',
            'invoice_company_name' => Setting::get('invoice_company_name', Setting::get('site_name', Setting::get('theme_name', Setting::get('site_title', 'Online Store')))),
            'invoice_company_address' => 'Dhaka, Bangladesh',
            'invoice_company_phone' => '+8801700000000',
            'invoice_company_website' => Setting::get('invoice_company_website', 'www.mahmudtrading.com'),
            'invoice_company_email' => Setting::get('contact_email', 'support@mahmudtrading.com'),
            'invoice_footer_note' => 'Thank you for shopping with us!',
        ];

        foreach ($defaults as $key => $val) {
            if (! isset($settings[$key])) {
                $settings[$key] = $val;
            }
        }

        return view('admin.invoice-print-bulk', [
            'orders' => $orders,
            'settings' => $settings,
        ]);
    }

    /**
     * Print/View Invoice.
     */
    public function printInvoice($id)
    {
        $order = Order::with('items.product.primaryImage')->findOrFail($id);

        $settings = Setting::where('group', 'invoice')
            ->orWhere('key', 'like', 'invoice_%')
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();
        $defaults = [
            'invoice_style' => 'modern',
            'invoice_prefix' => 'GOV',
            'invoice_show_product_image' => '1',
            'invoice_company_name' => Setting::get('invoice_company_name', Setting::get('site_name', Setting::get('theme_name', Setting::get('site_title', 'Online Store')))),
            'invoice_company_address' => 'Dhaka, Bangladesh',
            'invoice_company_phone' => '+8801700000000',
            'invoice_company_website' => Setting::get('invoice_company_website', 'www.mahmudtrading.com'),
            'invoice_company_email' => Setting::get('contact_email', 'support@mahmudtrading.com'),
            'invoice_footer_note' => 'Thank you for shopping with us!',
        ];

        foreach ($defaults as $key => $val) {
            if (! isset($settings[$key])) {
                $settings[$key] = $val;
            }
        }

        return view('admin.invoice-print', [
            'order' => $order,
            'settings' => $settings,
        ]);
    }
}
