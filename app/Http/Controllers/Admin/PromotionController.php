<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Traits\HandlesAdminMedia;
use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Coupon;
use App\Models\FlashSale;
use App\Models\Product;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PromotionController extends Controller
{
    use HandlesAdminMedia;

    /**
     * Render Coupon management view.
     */
    public function coupons()
    {
        $coupons = Coupon::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Coupons', [
            'coupons' => $coupons,
        ]);
    }

    /**
     * Create or update a coupon.
     */
    public function saveCoupon(Request $request)
    {
        $request->validate([
            'id' => 'nullable|exists:coupons,id',
            'code' => 'required|string|max:100|unique:coupons,code,'.$request->id,
            'type' => 'required|string|in:fixed,percent',
            'value' => 'required|numeric|min:0',
            'min_spend' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'required|boolean',
        ]);

        Coupon::updateOrCreate(
            ['id' => $request->id],
            [
                'code' => strtoupper($request->code),
                'type' => $request->type,
                'value' => $request->value,
                'min_spend' => $request->min_spend ?? 0.00,
                'max_discount' => $request->max_discount,
                'starts_at' => $request->starts_at,
                'expires_at' => $request->expires_at,
                'usage_limit' => $request->usage_limit,
                'is_active' => $request->is_active,
            ]
        );

        return redirect()->back()->with('success', 'Coupon saved successfully!');
    }

    /**
     * Delete a coupon.
     */
    public function deleteCoupon($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return redirect()->back()->with('success', 'Coupon deleted successfully!');
    }

    /**
     * Render Flash Sales list view.
     */
    public function flashSales()
    {
        $flashSales = FlashSale::with('products.product')->orderBy('created_at', 'desc')->get();
        $products = Product::where('status', 'active')->orderBy('name', 'asc')->get();

        return Inertia::render('Admin/FlashSales', [
            'flashSales' => $flashSales,
            'products' => $products,
        ]);
    }

    /**
     * Save Flash Sale.
     */
    public function saveFlashSale(Request $request)
    {
        $request->validate([
            'id' => 'nullable|exists:flash_sales,id',
            'title' => 'required|string|max:255',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'is_active' => 'required|boolean',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.discount_type' => 'required|string|in:fixed,percent',
            'products.*.discount_value' => 'required|numeric|min:0',
        ]);

        $flashSale = FlashSale::updateOrCreate(
            ['id' => $request->id],
            [
                'title' => $request->title,
                'starts_at' => $request->starts_at,
                'ends_at' => $request->ends_at,
                'is_active' => $request->is_active,
            ]
        );

        $flashSale->products()->delete();
        foreach ($request->products as $item) {
            $flashSale->products()->create([
                'product_id' => $item['product_id'],
                'discount_type' => $item['discount_type'],
                'discount_value' => $item['discount_value'],
            ]);
        }

        return redirect()->back()->with('success', 'Flash sale saved successfully!');
    }

    /**
     * Delete Flash Sale.
     */
    public function deleteFlashSale($id)
    {
        $flashSale = FlashSale::findOrFail($id);
        $flashSale->delete();

        return redirect()->back()->with('success', 'Flash sale deleted successfully!');
    }

    /**
     * Render Campaigns list view.
     */
    public function campaigns()
    {
        $campaigns = Campaign::with('products')->orderBy('created_at', 'desc')->get();
        $products = Product::where('status', 'active')->orderBy('name', 'asc')->get();

        return Inertia::render('Admin/Campaigns', [
            'campaigns' => $campaigns,
            'products' => $products,
        ]);
    }

    /**
     * Save Campaign.
     */
    public function saveCampaign(Request $request)
    {
        $request->validate([
            'id' => 'nullable|exists:campaigns,id',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:campaigns,slug,'.$request->id,
            'description' => 'nullable|string',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'required|boolean',
            'banner_image' => 'nullable|string',
            'banner_file' => 'nullable|image|max:4096',
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
        ]);

        $bannerImage = $request->banner_image;

        if ($request->hasFile('banner_file')) {
            $path = $this->storeUploadedImageAsWebp($request->file('banner_file'), 'campaigns');
            $bannerImage = '/storage/'.$path;
        }

        $campaign = Campaign::updateOrCreate(
            ['id' => $request->id],
            [
                'title' => $request->title,
                'slug' => Str::slug($request->slug),
                'description' => $request->description,
                'starts_at' => $request->starts_at,
                'ends_at' => $request->ends_at,
                'is_active' => $request->is_active,
                'banner_image' => $bannerImage ? MediaUrl::resolve($bannerImage) : null,
            ]
        );

        $campaign->products()->sync($request->product_ids);

        return redirect()->back()->with('success', 'Campaign saved successfully!');
    }

    /**
     * Delete Campaign.
     */
    public function deleteCampaign($id)
    {
        $campaign = Campaign::findOrFail($id);
        $campaign->delete();

        return redirect()->back()->with('success', 'Campaign deleted successfully!');
    }
}
