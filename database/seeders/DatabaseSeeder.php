<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Models\HomepageSection;
use App\Models\Coupon;
use App\Models\Review;
use App\Models\Question;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Users
        $admin = User::create([
            'name' => 'Govaly Admin',
            'email' => 'admin@govaly.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $customer = User::create([
            'name' => 'Demo Customer',
            'email' => 'customer@govaly.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        // Add some starting wallet balance & loyalty points to customer
        $customer->walletTransactions()->create([
            'amount' => 1500.00,
            'type' => 'deposit',
            'description' => 'Welcome bonus credit',
        ]);

        $customer->loyaltyPoints()->create([
            'points' => 500,
            'type' => 'earn',
            'description' => 'Account registration rewards',
        ]);

        // 2. Settings Seeding
        $settings = [
            'site_title' => 'Govaly eCommerce | Premium Brand Store',
            'site_tagline' => 'Quality products delivered to your doorstep.',
            'contact_email' => 'support@govaly.com',
            'contact_phone' => '+880 1712-345678',
            'contact_address' => 'House 42, Road 11, Banani, Dhaka, Bangladesh',
            'currency_symbol' => '৳',
            'currency_code' => 'BDT',
            'tax_percentage' => '5',
            'shipping_inside_dhaka' => '60',
            'shipping_outside_dhaka' => '120',
            'checkout_name_status' => '1',
            'checkout_phone_status' => '1',
            'checkout_email_status' => '1',
            'checkout_address_status' => '1',
            'checkout_notes_status' => '1',
            'checkout_city_status' => '1',
            'checkout_coupon_status' => '1',
            'google_tag_manager_id' => 'GTM-MOCK1234',
            'meta_pixel_id' => 'PIXEL-MOCK5678',
            'tiktok_pixel_id' => 'TIKTOK-MOCK9012',
            'custom_header_scripts' => '<!-- Mock Analytics Header Code -->',
            'custom_footer_scripts' => '<!-- Mock Analytics Footer Code -->',
            'primary_color' => '#f97316', // Orange-500
            'secondary_color' => '#1e293b', // Slate-800
            'font_family' => 'Outfit',
        ];

        foreach ($settings as $key => $value) {
            Setting::set($key, $value, 'general');
        }

        // 3. Create Categories
        $electronics = Category::create([
            'name' => 'Smart Electronics',
            'slug' => 'smart-electronics',
            'description' => 'Wearables, gadgets, and smart accessories.',
            'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
            'is_featured' => true,
            'order_index' => 1,
        ]);

        $clothing = Category::create([
            'name' => 'Premium Men\'s Apparel',
            'slug' => 'premium-mens-apparel',
            'description' => 'High quality shirts, t-shirts, and fashion items.',
            'image' => 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=60',
            'is_featured' => true,
            'order_index' => 2,
        ]);

        $bundles = Category::create([
            'name' => 'Combo & Bundles',
            'slug' => 'combo-bundles',
            'description' => 'Exclusive combo offers with discounted prices.',
            'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
            'is_featured' => true,
            'order_index' => 3,
        ]);

        $digital = Category::create([
            'name' => 'Digital Downloads',
            'slug' => 'digital-downloads',
            'description' => 'Ebooks, courses, presets, and guides.',
            'image' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
            'is_featured' => false,
            'order_index' => 4,
        ]);

        // 4. Create Product Attributes (Size & Color)
        $colorAttr = ProductAttribute::create(['name' => 'Color', 'code' => 'color']);
        $sizeAttr = ProductAttribute::create(['name' => 'Size', 'code' => 'size']);

        $black = ProductAttributeValue::create(['attribute_id' => $colorAttr->id, 'value' => 'Black']);
        $navy = ProductAttributeValue::create(['attribute_id' => $colorAttr->id, 'value' => 'Navy']);
        $mSize = ProductAttributeValue::create(['attribute_id' => $sizeAttr->id, 'value' => 'M']);
        $lSize = ProductAttributeValue::create(['attribute_id' => $sizeAttr->id, 'value' => 'L']);
        $xlSize = ProductAttributeValue::create(['attribute_id' => $sizeAttr->id, 'value' => 'XL']);

        // 5. Products Setup
        // Product 1: Simple Smart Watch
        $watch = Product::create([
            'name' => 'Govaly Watch Active 2',
            'slug' => 'govaly-watch-active-2',
            'sku' => 'G-WATCH-A2',
            'type' => 'simple',
            'description' => '<p>The Govaly Watch Active 2 is your ultimate health and lifestyle companion. Features dynamic heart rate tracking, Sleep monitoring, and over 15 sports tracking modes. Water-resistant up to 50 meters.</p>',
            'short_description' => 'Bluetooth smart watch with AMOLED Display, heart rate tracker, and 14 days battery life.',
            'price' => 2800.00,
            'sale_price' => 2200.00,
            'cost_price' => 1200.00,
            'is_featured' => true,
            'status' => 'active',
            'stock' => 75,
            'weight' => 0.25,
            'material' => 'Aluminum Body, Silicone Strap',
            'labels' => ['Hot', 'Free Shipping'],
            'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'meta_title' => 'Govaly Watch Active 2 - Buy Smartwatch Online Bangladesh',
            'meta_description' => 'Purchase the Govaly Watch Active 2 at the best price in Bangladesh. 14 days battery, AMOLED screen, water resistant.',
        ]);
        $watch->categories()->attach($electronics->id);

        ProductImage::create([
            'product_id' => $watch->id,
            'image_path' => 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
            'is_primary' => true,
            'order_index' => 0,
        ]);
        ProductImage::create([
            'product_id' => $watch->id,
            'image_path' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
            'is_primary' => false,
            'order_index' => 1,
        ]);

        // Product 2: Variable Polo Shirt
        $polo = Product::create([
            'name' => 'Premium Soft Pique Cotton Polo Shirt',
            'slug' => 'premium-soft-pique-cotton-polo',
            'sku' => 'G-POLO-PIQUE',
            'type' => 'variable',
            'description' => '<p>Crafted from 100% long-staple Egyptian cotton, our signature pique polo offers exceptional softness, structure, and breathable comfort. Finished with customized shell buttons and ribbed cuffs.</p>',
            'short_description' => 'Premium Egyptian pique cotton polo shirt available in multiple sizes and colors.',
            'price' => 1200.00,
            'sale_price' => null,
            'cost_price' => 450.00,
            'is_featured' => true,
            'status' => 'active',
            'stock' => 150,
            'weight' => 0.30,
            'material' => '100% Pique Cotton',
            'labels' => ['Best Seller'],
            'meta_title' => 'Premium Egyptian Cotton Polo Shirt - Govaly',
            'meta_description' => 'Shop men\'s designer pique cotton polo shirts online at Govaly. Best fitting, lightweight, premium fabric.',
        ]);
        $polo->categories()->attach($clothing->id);

        ProductImage::create([
            'product_id' => $polo->id,
            'image_path' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80', // Black Polo
            'is_primary' => true,
            'order_index' => 0,
        ]);
        ProductImage::create([
            'product_id' => $polo->id,
            'image_path' => 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80', // Navy Polo
            'is_primary' => false,
            'order_index' => 1,
        ]);

        // Create variants for Polo
        // Black M, Black L, Black XL, Navy M, Navy L, Navy XL
        $variantsData = [
            ['color' => $black, 'size' => $mSize, 'sku' => 'G-POLO-BLK-M', 'stock' => 20, 'price' => 1200.00, 'img' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80'],
            ['color' => $black, 'size' => $lSize, 'sku' => 'G-POLO-BLK-L', 'stock' => 25, 'price' => 1200.00, 'img' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80'],
            ['color' => $black, 'size' => $xlSize, 'sku' => 'G-POLO-BLK-XL', 'stock' => 15, 'price' => 1250.00, 'img' => 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop&q=80'],
            ['color' => $navy, 'size' => $mSize, 'sku' => 'G-POLO-NVY-M', 'stock' => 30, 'price' => 1200.00, 'img' => 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80'],
            ['color' => $navy, 'size' => $lSize, 'sku' => 'G-POLO-NVY-L', 'stock' => 40, 'price' => 1200.00, 'img' => 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80'],
            ['color' => $navy, 'size' => $xlSize, 'sku' => 'G-POLO-NVY-XL', 'stock' => 20, 'price' => 1250.00, 'img' => 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop&q=80'],
        ];

        foreach ($variantsData as $vd) {
            $variant = ProductVariant::create([
                'product_id' => $polo->id,
                'sku' => $vd['sku'],
                'price' => $vd['price'],
                'sale_price' => null,
                'stock' => $vd['stock'],
                'image_path' => $vd['img'],
            ]);
            $variant->attributeValues()->attach([$vd['color']->id, $vd['size']->id]);
        }

        // Product 3: Digital E-book Product
        $ebook = Product::create([
            'name' => 'E-Commerce Scaling Masterclass Ebook',
            'slug' => 'ecommerce-scaling-masterclass-ebook',
            'sku' => 'G-DIG-BOOK',
            'type' => 'digital',
            'description' => '<p>This digital guide outlines the precise steps needed to scale a single-brand store from zero to millions in monthly recurring revenue. Contains case studies, ad strategies, and retention emails.</p>',
            'short_description' => 'Complete digital handbook for eCommerce entrepreneurs. Instant PDF download.',
            'price' => 450.00,
            'sale_price' => 250.00,
            'cost_price' => 0.00,
            'is_featured' => false,
            'status' => 'active',
            'stock' => 99999, // Unlimited
            'digital_file_url' => '/downloads/ecommerce-scaling-guide.pdf',
            'labels' => ['Digital', 'New'],
            'meta_title' => 'E-Commerce Scaling Masterclass - PDF Guide',
            'meta_description' => 'Download Govaly\'s exclusive e-commerce scaling handbook. Learn funnel setup, advertising hooks, and retention metrics.',
        ]);
        $ebook->categories()->attach($digital->id);

        ProductImage::create([
            'product_id' => $ebook->id,
            'image_path' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
            'is_primary' => true,
        ]);

        // Product 4: Product Bundle (Watch + Polo)
        $bundleProduct = Product::create([
            'name' => 'Watch & Polo Complete Lifestyle Combo',
            'slug' => 'watch-polo-combo-pack',
            'sku' => 'G-BUNDLE-WP',
            'type' => 'bundle',
            'description' => '<p>Get the ultimate stylish upgrade. This combo pack includes our premium Govaly Watch Active 2 Smart Watch and one Luxury Egyptian Pique Cotton Polo Shirt. Select your polo size and color at checkout.</p>',
            'short_description' => 'Combined pack: Govaly Watch Active 2 + Luxury Pique Cotton Polo Shirt. Save 25%!',
            'price' => 4000.00,
            'sale_price' => 3000.00,
            'cost_price' => 1650.00,
            'is_featured' => true,
            'status' => 'active',
            'stock' => 30,
            'labels' => ['Combo', 'Sale'],
            'meta_title' => 'Watch & Polo Shirt Special Combo Offer - Govaly',
            'meta_description' => 'Get the Govaly Smart Watch + Premium Cotton Polo bundle at an unbeatable price. Free delivery inside Dhaka.',
        ]);
        $bundleProduct->categories()->attach($bundles->id);

        ProductImage::create([
            'product_id' => $bundleProduct->id,
            'image_path' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
            'is_primary' => true,
        ]);

        // 6. Seed Coupons
        Coupon::create([
            'code' => 'LAUNCH15',
            'type' => 'percent',
            'value' => 15.00,
            'min_spend' => 1000.00,
            'max_discount' => 500.00,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(6),
            'usage_limit' => 1000,
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'GOVALY200',
            'type' => 'fixed',
            'value' => 200.00,
            'min_spend' => 1500.00,
            'starts_at' => now(),
            'expires_at' => now()->addMonths(6),
            'usage_limit' => 500,
            'is_active' => true,
        ]);

        // 7. Seed Reviews & Questions
        Review::create([
            'product_id' => $watch->id,
            'user_id' => $customer->id,
            'rating' => 5,
            'comment' => 'Incredible battery life! Charging it once last week, and it still has 45% remaining. Highly recommended.',
            'is_approved' => true,
        ]);

        Question::create([
            'product_id' => $watch->id,
            'user_id' => $customer->id,
            'question' => 'Does this watch support measuring blood pressure?',
            'answer' => 'Hello! The Govaly Watch Active 2 supports heart rate, SpO2, and sleep tracking, but it does not support medical-grade blood pressure measurements.',
            'answered_by' => $admin->id,
        ]);

        // 8. Seed Page Builder Sections
        // Hero Slider
        HomepageSection::create([
            'title' => 'Hero Slider & Side Banner',
            'type' => 'hero_slider',
            'settings' => [
                'slides' => [
                    [
                        'image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
                        'title' => 'Grand Launch Sale',
                        'subtitle' => 'Flat 15% Off Site-wide'
                    ],
                    [
                        'image' => 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
                        'title' => 'Summer Collection',
                        'subtitle' => 'Elevate your daily fashion'
                    ],
                    [
                        'image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
                        'title' => 'Signature Wear',
                        'subtitle' => 'Designed for absolute expression'
                    ]
                ],
                'side_banner_image' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500',
                'side_banner_title' => "Women's Flat & Sandals",
                'side_banner_subtitle' => 'Trending',
                'side_banner_link' => '/category/all-products?category=Womens%20Footwear'
            ],
            'order_index' => 1,
            'is_active' => true,
        ]);

        // Feature Badges Row
        HomepageSection::create([
            'title' => 'Customer Trust Badges',
            'type' => 'feature_badges',
            'settings' => [
                'badge_1_title' => 'Cash On Delivery',
                'badge_1_desc' => 'Pay after receiving product',
                'badge_2_title' => 'Instant Return',
                'badge_2_desc' => '7 days return policy',
                'badge_3_title' => 'Delivery Within 48hrs',
                'badge_3_desc' => 'Fastest nationwide service',
                'badge_4_title' => 'Best Price Deal',
                'badge_4_desc' => 'Affordable & direct pricing'
            ],
            'order_index' => 2,
            'is_active' => true,
        ]);

        // Category Circle List
        HomepageSection::create([
            'title' => 'Double Category Circle Grid',
            'type' => 'category_grid',
            'settings' => [
                'title' => 'Shop By Department'
            ],
            'order_index' => 3,
            'is_active' => true,
        ]);

        // Signature Men/Women Split
        HomepageSection::create([
            'title' => 'Signature Collection Split Banners',
            'type' => 'signature_banners',
            'settings' => [
                'men_title' => 'SIGNATURE MEN',
                'men_subtitle' => 'Panjabis, Polos, Caps & Active Footwear',
                'men_image' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
                'women_title' => 'SIGNATURE WOMEN',
                'women_subtitle' => 'Sarees, Shalwars, Kurtis & Premium Sandals',
                'women_image' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400'
            ],
            'order_index' => 4,
            'is_active' => true,
        ]);

        // Cosmetics Banner
        HomepageSection::create([
            'title' => 'Authentic Cosmetics Showcase Banner',
            'type' => 'cosmetics_banner',
            'settings' => [
                'title' => 'AUTHENTIC SKIN & BODY CARE Cosmetics',
                'subtitle' => 'Premium Brands Only',
                'btn_text' => 'Explore Brands',
                'link' => '/category/all-products?category=Cosmetics'
            ],
            'order_index' => 5,
            'is_active' => true,
        ]);

        // Top Brands Grid
        HomepageSection::create([
            'title' => 'Affiliated Top Brands list',
            'type' => 'top_brands',
            'settings' => [
                'brands' => 'ZUQO, DUNHILL, NORDMANN, WISHCORP, GUVLY, DOUR'
            ],
            'order_index' => 6,
            'is_active' => true,
        ]);

        // Campaign Grid
        HomepageSection::create([
            'title' => 'Affordable and Worth It Campaigns',
            'type' => 'campaign_grid',
            'settings' => [
                'title' => 'Affordable and Worth It'
            ],
            'order_index' => 7,
            'is_active' => true,
        ]);

        // Dynamic Products tabs
        HomepageSection::create([
            'title' => 'Dynamic Filterable Products Grid',
            'type' => 'products_tabs',
            'settings' => [
                'title' => 'Products For You',
                'categories' => 'Smart Electronics, Premium Men\'s Apparel, Combo & Bundles, Digital Downloads, Women\'s Fashion, Health & Cosmetics, Home & Lifestyle',
                'border_radius' => 'rounded-2xl'
            ],
            'order_index' => 8,
            'is_active' => true,
        ]);

        // 9. Seed Couriers
        \App\Models\Courier::create([
            'name' => 'Steadfast Courier',
            'code' => 'steadfast',
            'inside_city_charge' => 80.00,
            'outside_city_charge' => 120.00,
            'is_default' => true,
            'is_active' => true,
            'api_key' => 'steadfast_mock_api_key_123',
            'secret_key' => 'steadfast_mock_secret_key_456'
        ]);

        $this->call(DummyDataSeeder::class);
    }
}
