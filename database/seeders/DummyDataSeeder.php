<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Array of Categories and Subcategories
        $categoriesData = [
            [
                'name' => 'Smart Electronics',
                'description' => 'Wearables, gadgets, and smart accessories.',
                'image' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
                'is_featured' => true,
                'subcategories' => [
                    ['name' => 'Smartwatches', 'description' => 'Top brand smartwatches and fitness bands.'],
                    ['name' => 'Headsets & Audio', 'description' => 'Wireless earbuds, noise-canceling headphones.'],
                    ['name' => 'Power Accessories', 'description' => 'Fast chargers, wireless chargers, and powerbanks.'],
                ]
            ],
            [
                'name' => 'Premium Men\'s Apparel',
                'description' => 'High quality shirts, t-shirts, and fashion items.',
                'image' => 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600',
                'is_featured' => true,
                'subcategories' => [
                    ['name' => 'Cotton Polo Shirts', 'description' => 'Premium cotton polo shirts.'],
                    ['name' => 'Casual Shirts', 'description' => 'Oxford shirts, linen shirts, and casual wear.'],
                    ['name' => 'Premium Panjabis', 'description' => 'Designer semi-formal and formal Panjabis.'],
                ]
            ],
            [
                'name' => 'Women\'s Fashion',
                'description' => 'Sarees, kurtis, shoes, and luxury items.',
                'image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
                'is_featured' => true,
                'subcategories' => [
                    ['name' => 'Designer Sarees', 'description' => 'Traditional silk, georgette, and cotton sarees.'],
                    ['name' => 'Salwar Kameez', 'description' => 'Designer salwar suits and premium ready-to-wear.'],
                    ['name' => 'Ladies Sandals', 'description' => 'Flat sandals, heels, and comfort footwear.'],
                ]
            ],
            [
                'name' => 'Health & Cosmetics',
                'description' => 'Authentic skin care, cosmetics, and makeup.',
                'image' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
                'is_featured' => true,
                'subcategories' => [
                    ['name' => 'Skin Care', 'description' => 'Serums, moisturizers, sunblocks, and cleansers.'],
                    ['name' => 'Hair Care', 'description' => 'Shampoos, conditioners, and hair serums.'],
                ]
            ],
            [
                'name' => 'Home & Lifestyle',
                'description' => 'Upgrade your daily life with premium utilities.',
                'image' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
                'is_featured' => false,
                'subcategories' => [
                    ['name' => 'Kitchen Tools', 'description' => 'Knives, blenders, and storage accessories.'],
                ]
            ],
        ];

        $createdCategories = [];
        $orderIndex = 10;

        foreach ($categoriesData as $parentData) {
            // Check if parent category already exists
            $parent = Category::where('slug', Str::slug($parentData['name']))->first();
            if (!$parent) {
                $parent = Category::create([
                    'name' => $parentData['name'],
                    'slug' => Str::slug($parentData['name']),
                    'description' => $parentData['description'],
                    'image' => $parentData['image'],
                    'is_featured' => $parentData['is_featured'],
                    'order_index' => $orderIndex++,
                ]);
            }
            $createdCategories[] = $parent;

            foreach ($parentData['subcategories'] as $subData) {
                $sub = Category::where('slug', Str::slug($subData['name']))->first();
                if (!$sub) {
                    $sub = Category::create([
                        'name' => $subData['name'],
                        'slug' => Str::slug($subData['name']),
                        'description' => $subData['description'],
                        'parent_id' => $parent->id,
                        'is_featured' => false,
                        'order_index' => $orderIndex++,
                    ]);
                }
                $createdCategories[] = $sub;
            }
        }

        // Pools for generating realistic products
        $productNamingPools = [
            'Smartwatches' => [
                'names' => ['Fitbit Versa Pro', 'Aero Active Smartwatch', 'Govaly Pulse Band', 'Kronos Hybrid Watch', 'Titanium Explorer Watch'],
                'images' => [
                    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600',
                    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600',
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
                ]
            ],
            'Headsets & Audio' => [
                'names' => ['Sonic Bass Earbuds', 'Pro Noise Cancelling Headphones', 'Govaly Studio Pods', 'Aero Bluetooth Speaker', 'Pulse Wireless Buds'],
                'images' => [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
                    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600',
                    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600'
                ]
            ],
            'Power Accessories' => [
                'names' => ['HyperCharge 20W Powerbank', 'MagSafe Wireless Charging Pad', 'Govaly Tri-Port Fast Charger', 'Rugged USB-C Braided Cable'],
                'images' => [
                    'https://images.unsplash.com/photo-1609592424085-f24f118129ff?w=600',
                    'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600'
                ]
            ],
            'Cotton Polo Shirts' => [
                'names' => ['Signature Pique Polo', 'Slim Fit Cotton Polo', 'Athletic Tech Polo', 'Vintage Washed Polo'],
                'images' => [
                    'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600',
                    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600'
                ]
            ],
            'Casual Shirts' => [
                'names' => ['Linen Summer Breeze Shirt', 'Classic Oxford Cotton Shirt', 'Premium Denim Utility Shirt', 'Chambray Button-Down Shirt'],
                'images' => [
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
                    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'
                ]
            ],
            'Premium Panjabis' => [
                'names' => ['Heritage Silk Panjabi', 'Casual Linen Panjabi', 'Elegance Embroidered Panjabi', 'Classic White Cotton Panjabi'],
                'images' => [
                    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600'
                ]
            ],
            'Designer Sarees' => [
                'names' => ['Pure Silk Jamdani Saree', 'Royal Katan Silk Saree', 'Traditional Handloom Cotton Saree', 'Premium Georgette Party Saree'],
                'images' => [
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'
                ]
            ],
            'Salwar Kameez' => [
                'names' => ['Embroidered Lawn Kameez', 'Premium Cotton Three Piece Suit', 'Linen Boutique Salwar Suit', 'Festive Silk Kurti Set'],
                'images' => [
                    'https://images.unsplash.com/photo-1608748010899-18f300247112?w=600'
                ]
            ],
            'Ladies Sandals' => [
                'names' => ['Velvet Strap Flat Sandals', 'Elegant Leather Block Heels', 'Govaly Cushion Slides', 'Comfort Walk Flat Slip-ons'],
                'images' => [
                    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600'
                ]
            ],
            'Skin Care' => [
                'names' => ['Hydrating Hyaluronic Acid Serum', 'Vitamin C Brightening Moisturizer', 'Govaly Mineral Sunblock SPF 50', 'Centella Calming Cleansing Foam'],
                'images' => [
                    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
                    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'
                ]
            ],
            'Hair Care' => [
                'names' => ['Anti-Hairfall Caffeine Shampoo', 'Keratin Repair Conditioner', 'Organic Argan Hair Serum', 'Nourishing Coconut Hair Mask'],
                'images' => [
                    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600'
                ]
            ],
            'Kitchen Tools' => [
                'names' => ['Professional Chef Knife Set', 'Govaly High-Speed Smoothie Blender', 'Insulated Stainless Steel Flask', 'Portable Electric Spice Grinder'],
                'images' => [
                    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600'
                ]
            ],
        ];

        // 2. Generate 100 Products
        $productCount = 100;
        $activeCategories = Category::whereNotNull('parent_id')->get(); // Subcategories

        for ($i = 1; $i <= $productCount; $i++) {
            // Select a random subcategory
            $subcategory = $activeCategories->random();
            $categoryName = $subcategory->name;

            // Select name and image from pool or fallback
            $pool = $productNamingPools[$categoryName] ?? [
                'names' => ['Premium Lifestyle Product', 'Govaly Signature Edition', 'Modern Everyday Utility'],
                'images' => ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600']
            ];

            $baseName = $pool['names'][array_rand($pool['names'])];
            $name = $baseName . ' (Vol ' . rand(1, 10) . ' - #' . $i . ')';
            $slug = Str::slug($name) . '-' . uniqid();
            
            $price = rand(250, 4500);
            $hasSale = rand(0, 1) === 1;
            $salePrice = $hasSale ? round($price * rand(75, 90) / 100) : null;
            $costPrice = round($price * 0.4);

            $product = Product::create([
                'name' => $name,
                'slug' => $slug,
                'sku' => 'GVY-' . strtoupper(Str::random(4)) . '-' . (1000 + $i),
                'type' => 'simple',
                'description' => '<p>This is a premium curated item of ' . $categoryName . '. Carefully chosen to offer the highest levels of customer satisfaction and luxury styling. Guaranteed authentic and original.</p><p>Features durable builds, standard manufacturer warranties, and fast home delivery options across Bangladesh.</p>',
                'short_description' => 'Premium certified quality ' . $categoryName . ' product with warranty and express home delivery.',
                'price' => $price,
                'sale_price' => $salePrice,
                'cost_price' => $costPrice,
                'is_featured' => rand(1, 10) > 7, // 30% featured
                'status' => 'active',
                'stock' => rand(10, 150),
                'weight' => rand(1, 20) / 10,
                'labels' => rand(1, 5) > 3 ? ['Premium', 'Free Shipping'] : [],
            ]);

            // Attach parent category and subcategory
            $product->categories()->attach([$subcategory->id, $subcategory->parent_id]);

            // Add Product Image
            $imageUrl = $pool['images'][array_rand($pool['images'])];
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => $imageUrl,
                'is_primary' => true,
                'order_index' => 0,
            ]);
        }
    }
}
