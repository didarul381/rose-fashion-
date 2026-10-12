<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Traits\HandlesAdminMedia;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\HomepageSection;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PageBuilderController extends Controller
{
    use HandlesAdminMedia;

    /**
     * Page Builder: Fetch and update homepage builder sections.
     */
    public function pageBuilder()
    {
        $sections = HomepageSection::orderBy('order_index')->get();
        $categories = Category::orderBy('name')->get();
        $activeBrands = Brand::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo']);

        return Inertia::render('Admin/PageBuilder', [
            'sections' => $sections,
            'categories' => $categories,
            'activeBrands' => $activeBrands,
        ]);
    }

    /**
     * Update dynamic homepage builder section settings or ordering.
     */
    public function updateSection(Request $request, $id)
    {
        $section = HomepageSection::findOrFail($id);
        $settings = $request->get('settings', $section->settings);

        if (is_array($settings)) {
            $settings = $this->normalizeMediaValues($settings);
        }

        $newOrder = (int) $request->get('order_index', $section->order_index);
        $swapWithId = $request->integer('swap_with_id');

        DB::transaction(function () use ($request, $section, $settings, $newOrder, $swapWithId) {
            if ($swapWithId) {
                $swapSection = HomepageSection::whereKey($swapWithId)->first();
                if ($swapSection) {
                    $swapSection->update(['order_index' => $section->order_index]);
                }
            }

            $section->update([
                'title' => $request->get('title', $section->title),
                'is_active' => $request->get('is_active', $section->is_active),
                'order_index' => $newOrder,
                'settings' => $settings,
            ]);
        });

        return redirect()->back()->with('success', 'Section configuration saved!');
    }

    /**
     * Upload an image for a page builder section and return the URL.
     */
    public function uploadSectionImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $path = $this->storeUploadedImageAsWebp($request->file('image'), 'page-builder');

            return response()->json([
                'url' => MediaUrl::resolve('/storage/'.$path),
            ]);
        }

        return response()->json(['error' => 'No file uploaded'], 400);
    }

    /**
     * Add new homepage section block.
     */
    public function addSection(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|in:hero_slider,product_shelf,feature_badges,category_grid,signature_banners,cosmetics_banner,top_brands,campaign_grid,experience_features,content_columns,products_tabs,customer_reviews',
        ]);

        $defaultSettings = [];
        switch ($request->type) {
            case 'hero_slider':
                $defaultSettings = [
                    'slides' => [
                        [
                            'image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
                            'title' => 'New Banner Offer',
                            'subtitle' => 'Description',
                            'link' => '#products',
                            'button_text' => 'Shop now',
                        ],
                    ],
                    'side_banners' => [
                        [
                            'image' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
                            'title' => 'Flat & Sandals',
                            'subtitle' => 'Trending',
                            'link' => '#',
                            'button_text' => 'Shop now',
                        ],
                    ],
                    'section_background_color' => '#ffffff',
                    'border_radius' => 'rounded-2xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'product_shelf':
                $defaultSettings = [
                    'title' => 'Featured products',
                    'title_color' => '#102f58',
                    'product_source' => 'featured',
                    'product_limit' => '10',
                    'category_slug' => '',
                    'anchor_id' => 'featured',
                    'show_button' => 'yes',
                    'button_text' => 'More Products',
                    'button_link' => '#categories',
                    'section_background_color' => '#ffffff',
                    'border_radius' => 'rounded-2xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'feature_badges':
                $defaultSettings = [
                    'badge_1_title' => 'Cash On Delivery',
                    'badge_1_desc' => 'Pay after receiving product',
                    'badge_2_title' => 'Instant Return',
                    'badge_2_desc' => '7 days return policy',
                    'badge_3_title' => 'Delivery Within 48hrs',
                    'badge_3_desc' => 'Fastest nationwide service',
                    'badge_4_title' => 'Best Price Deal',
                    'badge_4_desc' => 'Affordable & direct pricing',
                    'section_background_color' => '#ffffff',
                    'border_radius' => 'rounded-xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'category_grid':
                $defaultSettings = [
                    'title' => 'Shop By Department',
                    'anchor_id' => 'categories',
                    'use_catalog_categories' => 'yes',
                    'limit' => '8',
                    'show_button' => 'yes',
                    'button_text' => 'More Products',
                    'button_link' => '/main-categories',
                    'title_color' => '#c2005f',
                    'title_font_size' => 'text-base md:text-lg',
                    'title_font_weight' => 'font-black',
                    'section_background_color' => '#ffffff',
                    'item_border_radius' => 'rounded-full',
                    'item_font_size' => 'text-[10px] md:text-xs',
                    'item_font_color' => '#334155',
                    'item_border_color' => '#e2e8f0',
                    'item_background_color' => '#f8fafc',
                    'border_radius' => 'rounded-full',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'signature_banners':
                $defaultSettings = [
                    'men_title' => 'SIGNATURE MEN',
                    'men_subtitle' => 'Panjabis, Polos, Caps & Active Footwear',
                    'men_image' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
                    'women_title' => 'SIGNATURE WOMEN',
                    'women_subtitle' => 'Sarees, Shalwars, Kurtis & Premium Sandals',
                    'women_image' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400',
                    'section_background_color' => '#ffffff',
                    'border_radius' => 'rounded-2xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'cosmetics_banner':
                $defaultSettings = [
                    'title' => 'AUTHENTIC SKIN & BODY CARE Cosmetics',
                    'subtitle' => 'Premium Brands Only',
                    'btn_text' => 'Explore Brands',
                    'link' => '/category/all-products?category=Cosmetics',
                    'section_background_color' => '#102f58',
                    'border_radius' => 'rounded-2xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'top_brands':
                $defaultSettings = [
                    'brands' => 'ZUQO, DUNHILL, NORDMANN, WISHCORP, GUVLY, DOUR',
                    'items' => [],
                    'button_text' => 'More Brands',
                    'button_link' => '/shop-by-brands',
                    'directory_eyebrow' => 'Brand directory',
                    'directory_title' => 'Shop By Brands',
                    'directory_description' => 'Brand browsing page with the names and collections used across the store.',
                    'section_background_color' => '#ffffff',
                    'border_radius' => 'rounded-xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'campaign_grid':
                $defaultSettings = [
                    'title' => 'Affordable and Worth It',
                    'background_color' => '#102f58',
                    'border_radius' => 'rounded-xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'experience_features':
                $defaultSettings = [
                    'eyebrow' => 'Built for your shopping journey',
                    'title' => 'A smooth storefront experience.',
                    'description' => 'Configure the messages that explain your customer experience.',
                    'background_color' => '#102f58',
                    'items' => [
                        ['title' => 'Best Deals', 'text' => 'Find value-for-money products faster'],
                        ['title' => 'Easy Shopping', 'text' => 'Add to cart with confidence'],
                    ],
                    'border_radius' => 'rounded-2xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'content_columns':
                $defaultSettings = [
                    'title' => 'About Our Online Store',
                    'title_color' => '#102f58',
                    'description' => 'Introduce your store and explain why customers should shop with you.',
                    'items' => [
                        ['title' => 'Quality products in one place', 'text' => 'Describe your product range and value.', 'link' => '', 'link_text' => 'Read more'],
                        ['title' => 'Fast, trusted service', 'text' => 'Describe delivery and customer support.', 'link' => '', 'link_text' => 'Read more'],
                        ['title' => 'Safe and easy checkout', 'text' => 'Describe payment and checkout options.', 'link' => '', 'link_text' => 'Read more'],
                    ],
                    'section_background_color' => '#ffffff',
                    'border_radius' => 'rounded-2xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
                break;
            case 'products_tabs':
                $defaultSettings = [
                    'title' => 'Product Shelves',
                    'title_color' => '#102f58',
                    'product_limit' => '10',
                    'shelves' => [
                        ['title' => 'Featured products', 'product_source' => 'featured', 'product_limit' => '10', 'anchor_id' => 'featured', 'button_text' => 'More Products', 'button_link' => '#categories'],
                        ['title' => 'Latest Products', 'product_source' => 'latest', 'product_limit' => '10', 'anchor_id' => 'products', 'button_text' => 'More Products', 'button_link' => '#categories'],
                    ],
                    'show_button' => 'yes',
                    'section_background_color' => '#ffffff',
                    'border_radius' => 'rounded-2xl',
                    'border_style' => 'none',
                    'border_color' => '#e2e8f0',
                    'shadow' => 'shadow-none',
                ];
            case 'customer_reviews':
                $defaultSettings = [
                    'tag' => 'Customer Reviews & Feedback',
                    'title' => 'Why Women Across Bangladesh Love Rose Fashion',
                    'subtitle' => 'Authentic customer feedback and video reviews from our Dhaka New Market showroom & online orders.',
                    'autoplay' => 'yes',
                    'autoplay_speed' => '5000',
                    'items' => [
                        [
                            'name' => 'Farzana Rahman',
                            'tag' => 'Verified Customer, Dhaka',
                            'rating' => '5',
                            'review' => 'Rose Fashion in New Market is my go-to place for Jamdani sarees. Their online selection and quick Facebook messenger support made ordering from home so convenient!',
                            'video_url' => 'https://www.facebook.com/share/18Ttrev5mS/',
                            'avatar' => '',
                        ],
                        [
                            'name' => 'Sadia Islam',
                            'tag' => 'Dhanmondi, Dhaka',
                            'rating' => '5',
                            'review' => 'The bridal lehenga finishing and embroidery work exceeded all my expectations! Highly recommend visiting Shop #214 in Dhaka New Market or ordering through their FB page.',
                            'video_url' => '',
                            'avatar' => '',
                        ],
                        [
                            'name' => 'Nusrat Jahan',
                            'tag' => 'Chittagong',
                            'rating' => '5',
                            'review' => 'Ordered pure handloom Jamdani saree with nationwide delivery. Arrived within 48 hours in perfect packaging. Pure authenticity and elegant zari weave!',
                            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                            'avatar' => '',
                        ],
                    ],
                    'section_background_color' => '#090d16',
                ];
                break;
        }

        $maxOrder = HomepageSection::max('order_index') ?? 0;

        HomepageSection::create([
            'title' => $request->title,
            'type' => $request->type,
            'settings' => $defaultSettings,
            'order_index' => $maxOrder + 1,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Homepage section added successfully!');
    }

    /**
     * Delete homepage section block.
     */
    public function deleteSection($id)
    {
        $section = HomepageSection::findOrFail($id);
        $section->delete();

        return redirect()->back()->with('success', 'Homepage section deleted successfully!');
    }
}
