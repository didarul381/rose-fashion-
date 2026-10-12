<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\HomepageSection;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RoseFashionStoreSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Settings Setup for Rose Fashion
        $settings = [
            'store_name' => 'Rose Fashion',
            'theme_name' => 'Rose Fashion',
            'site_title' => 'Rose Fashion | Dhaka New Market | Timeless Elegance',
            'site_tagline' => 'Discover authentic Jamdani fabrics, bridal lehengas, and designer sarees directly from our Dhaka New Market storefront with nationwide delivery.',
            'logo' => '/logo.png',
            'store_logo' => '/logo.png',
            'header_logo_image' => '/logo.png',
            'favicon' => '/logo.png',
            'contact_email' => 'support@rosefashionbd.com',
            'contact_phone' => '+880 1700-000000',
            'contact_address' => 'Shop #214 (New Market Area), Dhaka New Market, Dhaka-1205, Bangladesh',
            'store_address_1' => 'Shop #214 (New Market Area), Dhaka New Market, Dhaka-1205, Bangladesh',
            'footer_facebook' => 'https://www.facebook.com/share/18Ttrev5mS/',
            'announcement_bar_status' => 'enabled',
            'announcement_text' => '✨ Welcome to Rose Fashion (Dhaka New Market)! Enjoy Nationwide Delivery across Bangladesh.',
            'announcement_link' => 'https://www.facebook.com/share/18Ttrev5mS/',
            'announcement_link_text' => 'Message on FB to Order!',
            'header_design' => 'rose_fashion',
            'primary_color' => '#e11d48',
            'secondary_color' => '#881337',
            'font_family' => 'Inter',
            'currency_symbol' => '৳',
            'currency_code' => 'BDT',
        ];

        foreach ($settings as $key => $value) {
            Setting::set($key, $value, 'general');
        }

        // 2. Categories
        $catJamdani = Category::firstOrCreate(
            ['slug' => 'jamdani'],
            [
                'name' => 'Jamdani Sarees',
                'description' => 'Handwoven masterclass drapes carrying rich cultural heritage of Bengal.',
                'image' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
                'is_featured' => true,
                'show_on_home' => true,
                'order_index' => 1,
            ]
        );

        $catLehengas = Category::firstOrCreate(
            ['slug' => 'lehengas'],
            [
                'name' => 'Bridal & Party Lehengas',
                'description' => 'Stunning embroidered lehengas tailored for weddings, receptions, and festivals.',
                'image' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
                'is_featured' => true,
                'show_on_home' => true,
                'order_index' => 2,
            ]
        );

        $catSarees = Category::firstOrCreate(
            ['slug' => 'designer-sarees'],
            [
                'name' => 'Designer Sarees',
                'description' => 'Georgette, silk, chiffon, and katan sarees with sophisticated zari work.',
                'image' => 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600',
                'is_featured' => true,
                'show_on_home' => true,
                'order_index' => 3,
            ]
        );

        // 3. Products with Primary & Secondary Images (for Dual-Image Hover Preview)
        $productsData = [
            [
                'name' => 'Royal Crimson Handloom Jamdani Saree',
                'slug' => 'royal-crimson-handloom-jamdani-saree',
                'sku' => 'RF-JAM-001',
                'category_id' => $catJamdani->id,
                'category_slug' => 'jamdani',
                'price' => 8500,
                'badge' => 'Bestseller',
                'primary_img' => 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
                'secondary_img' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'name' => 'Golden Zari Work Bridal Lehenga',
                'slug' => 'golden-zari-work-bridal-lehenga',
                'sku' => 'RF-LEH-001',
                'category_id' => $catLehengas->id,
                'category_slug' => 'lehengas',
                'price' => 18500,
                'badge' => 'Bridal Exclusive',
                'primary_img' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
                'secondary_img' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'name' => 'Emerald Green Designer Georgette Saree',
                'slug' => 'emerald-green-designer-georgette-saree',
                'sku' => 'RF-SAR-001',
                'category_id' => $catSarees->id,
                'category_slug' => 'designer-sarees',
                'price' => 4200,
                'badge' => 'New Arrival',
                'primary_img' => 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600',
                'secondary_img' => 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'name' => 'Traditional Off-White Dhakai Jamdani',
                'slug' => 'traditional-off-white-dhakai-jamdani',
                'sku' => 'RF-JAM-002',
                'category_id' => $catJamdani->id,
                'category_slug' => 'jamdani',
                'price' => 12000,
                'badge' => 'Masterpiece',
                'primary_img' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
                'secondary_img' => 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'name' => 'Rose Pink Reception Party Lehenga',
                'slug' => 'rose-pink-reception-party-lehenga',
                'sku' => 'RF-LEH-002',
                'category_id' => $catLehengas->id,
                'category_slug' => 'lehengas',
                'price' => 14500,
                'badge' => 'Trending',
                'primary_img' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
                'secondary_img' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
            ],
            [
                'name' => 'Luxury Silk Katan Saree with Blouse Piece',
                'slug' => 'luxury-silk-katan-saree-with-blouse-piece',
                'sku' => 'RF-SAR-002',
                'category_id' => $catSarees->id,
                'category_slug' => 'designer-sarees',
                'price' => 6800,
                'badge' => 'Popular',
                'primary_img' => 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600',
                'secondary_img' => 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600',
            ],
        ];

        foreach ($productsData as $data) {
            $product = Product::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'sku' => $data['sku'],
                    'price' => $data['price'],
                    'is_featured' => true,
                    'status' => 'active',
                    'stock' => 50,
                    'labels' => [$data['badge']],
                    'description' => "Exquisite handcrafted design from Rose Fashion, Dhaka New Market. Authentic fabric with elegant zari and embroidery work.",
                    'settings' => [
                        'custom_badge' => $data['badge'],
                        'secondary_image' => $data['secondary_img'],
                        'category_slug' => $data['category_slug'],
                    ]
                ]
            );

            $product->categories()->syncWithoutDetaching([$data['category_id']]);

            // Sync images: Primary and Secondary
            ProductImage::where('product_id', $product->id)->delete();

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $data['primary_img'],
                'is_primary' => true,
                'order_index' => 0,
            ]);

            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $data['secondary_img'],
                'is_primary' => false,
                'order_index' => 1,
            ]);
        }

        // 4. Homepage Sections Setup
        // Deactivate older sections so our Rose Fashion sections take center stage
        HomepageSection::query()->update(['is_active' => false]);

        // Section 1: Hero Section
        HomepageSection::updateOrCreate(
            ['type' => 'hero_slider'],
            [
                'title' => 'Rose Fashion Hero Banner',
                'order_index' => 1,
                'is_active' => true,
                'settings' => [
                    'badge_text' => "Dhaka New Market's Premier Fashion Destination",
                    'headline' => 'Exquisite Sarees & Bridal Collections',
                    'highlight_word' => 'Sarees',
                    'subtitle' => 'Discover authentic Jamdani fabrics, bridal lehengas, and designer sarees directly from our Dhaka New Market storefront with nationwide delivery.',
                    'bg_image' => '/banner-bg.png',
                    'primary_button_text' => 'Explore Collection',
                    'primary_button_link' => '#shop-products',
                    'secondary_button_text' => 'Message on Facebook',
                    'secondary_button_link' => 'https://www.facebook.com/share/18Ttrev5mS/',
                    'trust_badge_1' => '100% Authentic Quality',
                    'trust_badge_2' => 'New Market Dhaka',
                    'trust_badge_3' => 'Fast BD Delivery',
                    'card_badge' => 'New Arrival',
                    'card_image' => 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800',
                    'card_tag' => 'Handloom Masterpiece',
                    'card_title' => 'Royal Crimson Jamdani',
                    'card_price' => 'Starting from ৳ 4,500',
                    'card_location' => 'Dhaka New Market Shop #214',
                    'card_chat_link' => 'https://www.facebook.com/share/18Ttrev5mS/',
                ]
            ]
        );

        // Section 2: Curated Collections (Category Grid)
        HomepageSection::updateOrCreate(
            ['type' => 'category_grid'],
            [
                'title' => 'Curated Collections',
                'order_index' => 2,
                'is_active' => true,
                'settings' => [
                    'tag' => 'Curated Collections',
                    'title' => 'Explore Our Signature Categories',
                    'subtitle' => 'From traditional Bangladeshi handlooms to modern designer party wear sarees and lehengas.',
                    'anchor_id' => 'collections',
                    'items' => [
                        [
                            'title' => 'Premium Jamdani Sarees',
                            'subtitle' => 'Handwoven masterclass drapes carrying rich cultural heritage of Bengal.',
                            'image' => 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
                            'badge' => 'Handloom',
                            'link' => '#shop-products',
                            'category_slug' => 'jamdani',
                        ],
                        [
                            'title' => 'Bridal & Party Lehengas',
                            'subtitle' => 'Stunning embroidered lehengas tailored for weddings, receptions, and festivals.',
                            'image' => 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
                            'badge' => 'Bridal & Party',
                            'link' => '#shop-products',
                            'category_slug' => 'lehengas',
                        ],
                        [
                            'title' => 'Designer Sarees',
                            'subtitle' => 'Georgette, silk, chiffon, and katan sarees with sophisticated zari work.',
                            'image' => 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600',
                            'badge' => 'Exclusive',
                            'link' => '#shop-products',
                            'category_slug' => 'designer-sarees',
                        ],
                    ]
                ]
            ]
        );

        // Section 3: Handpicked Selections (Products Tabs)
        HomepageSection::updateOrCreate(
            ['type' => 'products_tabs'],
            [
                'title' => 'Best Sellers & New Arrivals',
                'order_index' => 3,
                'is_active' => true,
                'settings' => [
                    'tag' => 'Handpicked Selections',
                    'title' => 'Best Sellers & New Arrivals',
                    'anchor_id' => 'shop-products',
                    'product_source' => 'all',
                    'product_limit' => '12',
                    'tabs' => [
                        ['label' => 'All Items', 'slug' => 'all'],
                        ['label' => 'Jamdani', 'slug' => 'jamdani'],
                        ['label' => 'Lehengas', 'slug' => 'lehengas'],
                        ['label' => 'Designer Sarees', 'slug' => 'designer-sarees'],
                    ]
                ]
            ]
        );

        // Section 4: Why Choose Us & Customer Trust (Experience Features)
        HomepageSection::updateOrCreate(
            ['type' => 'experience_features'],
            [
                'title' => 'Why Customers Trust Rose Fashion',
                'order_index' => 4,
                'is_active' => true,
                'settings' => [
                    'tag' => 'Our Legacy',
                    'title' => 'Why Customers Trust Rose Fashion',
                    'subtitle' => 'Rooted in Dhaka New Market with hundreds of happy clients across Bangladesh.',
                    'anchor_id' => 'about',
                    'items' => [
                        [
                            'icon' => 'store',
                            'title' => 'Dhaka New Market Store',
                            'text' => 'Visit our physical storefront at Dhaka New Market for direct touch-and-feel shopping of sarees and fabrics.',
                        ],
                        [
                            'icon' => 'gem',
                            'title' => 'Authentic Collections',
                            'text' => 'Handpicked authentic Jamdani weaves, premium silk katan, and exquisite bridal lehengas.',
                        ],
                        [
                            'icon' => 'truck',
                            'title' => 'Secure Nationwide Delivery',
                            'text' => 'Reliable packaging and fast home delivery services across Dhaka and all districts of Bangladesh.',
                        ],
                    ],
                ]
            ]
        );

        // Section 5: Independent Customer Reviews & Video Feedback Slider
        HomepageSection::updateOrCreate(
            ['type' => 'customer_reviews'],
            [
                'title' => 'Customer Reviews Slider',
                'order_index' => 5,
                'is_active' => true,
                'settings' => [
                    'tag' => 'Customer Reviews & Stories',
                    'title' => 'Why Customers Trust Rose Fashion',
                    'subtitle' => 'Real customer experiences and video feedback from our Dhaka New Market showroom & nationwide delivery.',
                    'anchor_id' => 'reviews',
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
                ]
            ]
        );
    }
}
