<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Brand;
use App\Models\QuotationRequest;
use App\Models\Page;
use App\Models\Product;
use App\Models\HomepageSection;
use App\Models\Setting;
use App\Models\Review;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ShopController extends Controller
{
    /**
     * Render the dynamic homepage based on Admin Page Builder sections.
     */
    public function index()
    {
        // 1. Fetch site configurations for theme, announcement, and GTM / Pixels
        $settings = Setting::whereIn('group', ['general', 'theme'])
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();

        $storeName = $settings['theme_name'] ?? $settings['store_name'] ?? $settings['site_title'] ?? $settings['header_logo_text'] ?? 'Online Store';

        // 2. Fetch current active Flash Sale before compiling homepage product blocks.
        $activeFlashSale = \App\Models\FlashSale::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->with([
                'products.product.primaryImage',
                'products.product.images',
                'products.product.variants.attributeValues.attribute',
                'products.product.categories',
                'products.product.priceUnit:id,name,code',
                'products.product.weightUnit:id,name,code',
                'products.product.reviews' => function ($query) {
                    $query->where('is_approved', true);
                }
            ])
            ->first();

        // 3. Fetch active homepage sections sorted by order index
        $sections = HomepageSection::where('is_active', true)
            ->orderBy('order_index')
            ->get();

        // 4. Eager load dynamic products for Page Builder product blocks.
        $compiledSections = $sections->map(function ($section) use ($activeFlashSale) {
            $settings = $section->settings;

            if (in_array($section->type, ['product_shelf', 'products_tabs'], true)) {
                // Product tabs can expand with “View more”, so fetch a larger pool and let React paginate visually.
                $settings['products'] = $this->homepageProducts($settings, $activeFlashSale, $section->type === 'products_tabs' ? 96 : null);
            }
            
            if ($section->type === 'featured_products' && isset($settings['product_ids'])) {
                $settings['products'] = Product::whereIn('id', $settings['product_ids'])
                    ->where('status', 'active')
                    ->with([
                        'primaryImage',
                        'priceUnit:id,name,code',
                        'weightUnit:id,name,code',
                        'reviews' => function ($query) {
                            $query->where('is_approved', true);
                        }
                    ])
                    ->get();
            }

            if ($section->type === 'flash_sale' && isset($settings['product_ids'])) {
                $settings['products'] = Product::whereIn('id', $settings['product_ids'])
                    ->where('status', 'active')
                    ->with([
                        'primaryImage',
                        'priceUnit:id,name,code',
                        'weightUnit:id,name,code',
                        'reviews' => function ($query) {
                            $query->where('is_approved', true);
                        }
                    ])
                    ->get();
            }

            if ($section->type === 'category_grid' && isset($settings['category_ids'])) {
                $settings['categories'] = Category::whereIn('id', $settings['category_ids'])
                    ->where('is_active', true)
                    ->get();
            }

            return [
                'id' => $section->id,
                'title' => $section->title,
                'type' => $section->type,
                'settings' => $settings
            ];
        });

        // 4. Fetch the categories selected for the homepage category grid.
        // Header categories are shared separately by HandleInertiaRequests.
        $homeCategories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->where('show_on_home', true)
            ->with(['children' => function ($query) {
                $query->where('is_active', true)->orderBy('order_index');
            }])
            ->orderBy('order_index')
            ->get();

        // 5. Build dynamic SEO and Schema tags
        $seo = [
            'title' => $settings['site_title'] ?? $storeName . ' | Premium Brand Store',
            'meta_description' => $settings['site_tagline'] ?? 'Quality products delivered to your doorstep.',
            'canonical_url' => url('/'),
            'og_image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
            'schema' => [
                '@context' => 'https://schema.org',
                '@type' => 'Store',
                'name' => $storeName,
                'image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
                'telephone' => $settings['contact_phone'] ?? '',
                'email' => $settings['contact_email'] ?? '',
                'address' => [
                    '@type' => 'PostalAddress',
                    'streetAddress' => $settings['contact_address'] ?? '',
                    'addressCountry' => 'BD'
                ]
            ]
        ];

        return Inertia::render('Welcome', [
            'sections' => $compiledSections,
            'home_categories' => $homeCategories,
            'settings' => $settings,
            'seo' => $seo,
            'active_flash_sale' => $activeFlashSale,
            'all_products' => Product::where('status', 'active')
                ->with([
                    'primaryImage',
                    'images',
                    'variants.attributeValues.attribute',
                    'categories',
                    'priceUnit:id,name,code',
                    'weightUnit:id,name,code',
                    'reviews' => function ($query) {
                        $query->where('is_approved', true);
                    }
                ])
                ->get()
        ]);
    }

    /**
     * Resolve modern ecommerce product sources for homepage Page Builder blocks.
     */
    private function homepageProducts(array $settings, $activeFlashSale = null, ?int $minimumPool = null)
    {
        $source = $settings['product_source'] ?? $settings['source'] ?? 'latest';
        $requestedLimit = max(1, (int) ($settings['product_limit'] ?? $settings['limit'] ?? 12));
        $limit = min(120, max($requestedLimit, $minimumPool ?? $requestedLimit));
        $categorySlug = trim((string) ($settings['category_slug'] ?? ''));

        if ($source === 'flash_sale') {
            $products = collect($activeFlashSale?->products ?? [])
                ->map(fn ($item) => $item->product ?? null)
                ->filter(fn ($product) => $product && $product->status === 'active')
                ->values();

            if ($categorySlug !== '') {
                $products = $products->filter(fn ($product) => $product->categories?->contains('slug', $categorySlug))->values();
            }

            return $products->take($limit)->values();
        }

        $query = Product::where('status', 'active')
            ->with($this->homepageProductRelations());

        if ($categorySlug !== '') {
            $query->whereHas('categories', fn ($categoryQuery) => $categoryQuery->where('slug', $categorySlug));
        }

        if (in_array($source, ['featured', 'featured_products'], true)) {
            $query->where('is_featured', true)
                ->orderByDesc('stock')
                ->latest('created_at');
        } elseif (in_array($source, ['latest', 'new_arrivals'], true)) {
            $query->latest('created_at');
        } elseif (in_array($source, ['sale', 'discounted', 'discounted_products'], true)) {
            $query->whereNotNull('sale_price')
                ->whereColumn('sale_price', '<', 'price')
                ->orderByRaw('((price - sale_price) / NULLIF(price, 0)) desc')
                ->latest('created_at');
        } elseif ($source === 'best_selling' && Schema::hasTable('order_items')) {
            $salesSubquery = DB::table('order_items')
                ->selectRaw('COALESCE(SUM(quantity), 0)')
                ->whereColumn('order_items.product_id', 'products.id');

            $query->select('products.*')
                ->selectSub($salesSubquery, 'sold_qty')
                ->orderByDesc('sold_qty')
                ->latest('products.created_at');
        } elseif ($source === 'trending') {
            if (Schema::hasTable('order_items')) {
                $salesSubquery = DB::table('order_items')
                    ->selectRaw('COALESCE(SUM(quantity), 0)')
                    ->whereColumn('order_items.product_id', 'products.id');

                $query->select('products.*')
                    ->selectSub($salesSubquery, 'sold_qty')
                    ->withCount(['reviews' => fn ($reviewQuery) => $reviewQuery->where('is_approved', true)])
                    ->orderByDesc('is_featured')
                    ->orderByDesc('sold_qty')
                    ->orderByDesc('reviews_count')
                    ->latest('products.created_at');
            } else {
                $query->orderByDesc('is_featured')->latest('created_at');
            }
        } else {
            $query->latest('created_at');
        }

        $products = $query->limit($limit)->get();


        return $products;
    }

    private function homepageProductRelations(): array
    {
        return [
            'primaryImage',
            'images',
            'variants.attributeValues.attribute',
            'categories',
            'priceUnit:id,name,code',
            'weightUnit:id,name,code',
            'reviews' => function ($query) {
                $query->where('is_approved', true);
            },
        ];
    }

    /**
     * Show the complete top-level category directory.
     */
    public function mainCategories()
    {
        $storeName = $this->storeName();
        $categories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->withCount(['children' => function ($query) {
                $query->where('is_active', true);
            }])
            ->orderBy('order_index')
            ->orderBy('name')
            ->get();

        return Inertia::render('Shop/MainCategories', [
            'mainCategories' => $categories,
            'stats' => [
                'active_categories' => $categories->count(),
                'sub_categories' => Category::whereNotNull('parent_id')->where('is_active', true)->count(),
            ],
            'seo' => [
                'title' => 'All Categories - ' . $storeName,
                'meta_description' => 'Browse all product categories and discover the complete store catalog.',
                'canonical_url' => url('/main-categories'),
            ],
        ]);
    }
    /**
     * Show the brand directory configured by the homepage Page Builder.
     */
    public function brands()
    {
        $storeName = $this->storeName();
        $section = HomepageSection::where('type', 'top_brands')
            ->where('is_active', true)
            ->orderBy('order_index')
            ->first();
        $settings = $section?->settings ?? [];
        $activeBrands = Brand::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('name')
            ->get(['name', 'slug', 'logo'])
            ->keyBy('slug');
        $items = collect($settings['items'] ?? [])
            ->filter(fn ($item) => filled($item['brand'] ?? $item['title'] ?? $item['name'] ?? null))
            ->map(function ($item) use ($activeBrands) {
                $brand = $activeBrands->get($item['brand'] ?? '');
                $name = $brand?->name ?? $item['title'] ?? $item['name'] ?? $item['brand'];
                $slug = $brand?->slug ?? $item['brand'] ?? $name;

                return [
                    'name' => $name,
                    'brand' => $slug,
                    'image' => $brand?->logo ?? $item['image'] ?? null,
                    'link' => $this->brandLink($slug, $item['link'] ?? null),
                ];
            })
            ->values();

        if ($items->isEmpty() && $activeBrands->isNotEmpty()) {
            $items = $activeBrands->values()
                ->map(fn ($brand) => [
                    'name' => $brand->name,
                    'brand' => $brand->slug,
                    'image' => $brand->logo,
                    'link' => $this->brandLink($brand->slug),
                ])
                ->values();
        }

        if ($items->isEmpty()) {
            $items = collect(explode(',', (string) ($settings['brands'] ?? '')))
                ->map(fn ($name) => trim($name))
                ->filter()
                ->unique(fn ($name) => mb_strtolower($name))
                ->map(fn ($name) => ['name' => $name, 'brand' => Str::slug($name), 'image' => null, 'link' => $this->brandLink($name)])
                ->values();
        }

        return Inertia::render('Shop/Brands', [
            'brands' => $items,
            'directory' => [
                'title' => $settings['directory_title'] ?? 'Shop By Brands',
                'eyebrow' => $settings['directory_eyebrow'] ?? 'Brand directory',
                'description' => $settings['directory_description'] ?? 'Brand browsing page with the names and collections used across the store.',
            ],
            'seo' => [
                'title' => 'Shop By Brands - ' . $storeName,
                'meta_description' => 'Browse all available brands and discover their products.',
                'canonical_url' => url('/shop-by-brands'),
            ],
        ]);
    }


    /**
     * Show the complete product catalog with filters and sorting.
     */
    public function shop(Request $request)
    {
        $storeName = $this->storeName();
        $products = $this->productListingQuery($request)->paginate(12)->withQueryString();
        $categories = Category::whereNull('parent_id')
            ->where('is_active', true)
            ->withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->orderBy('order_index')
            ->orderBy('name')
            ->get();

        $breadcrumbs = [
            ['name' => 'Home', 'url' => route('home')],
            ['name' => 'Shop', 'url' => route('shop.index')],
        ];

        return Inertia::render('Shop/Category', [
            'category' => [
                'id' => null,
                'name' => 'Shop',
                'slug' => null,
                'description' => 'Browse all available products and narrow the catalog using categories, price and sorting.',
                'image' => null,
            ],
            'products' => $products,
            'siblings' => $categories,
            'filters' => (object) $request->only(['min_price', 'max_price', 'sort', 'b']),
            'listing_route' => 'shop.index',
            'seo' => [
                'title' => 'Shop - ' . $storeName,
                'meta_description' => 'Browse the complete product catalog.',
                'canonical_url' => url('/shop'),
            ],
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Show Category listing with filters and sorting options.
     */
    public function category($slug, Request $request)
    {
        $storeName = $this->storeName();
        $category = Category::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $categoryIds = $this->descendantCategoryIds($category->id);
        $products = $this->productListingQuery($request, $categoryIds)
            ->paginate(12)
            ->withQueryString();

        $siblingCategories = Category::where('parent_id', $category->id)
            ->where('is_active', true)
            ->withCount(['products' => function ($query) {
                $query->where('status', 'active');
            }])
            ->orderBy('order_index')
            ->get();

        if ($siblingCategories->isEmpty()) {
            $siblingCategories = Category::where('parent_id', $category->parent_id)
                ->where('is_active', true)
                ->orderBy('order_index')
                ->withCount(['products' => function ($query) {
                    $query->where('status', 'active');
                }])
                ->get();
        }

        $breadcrumbs = [
            ['name' => 'Home', 'url' => route('home')],
            ['name' => 'Categories', 'url' => route('categories.index')],
        ];

        // Ancestor categories if hierarchical
        $currentParent = $category->parent;
        $ancestors = [];
        while ($currentParent) {
            array_unshift($ancestors, [
                'name' => $currentParent->name,
                'url' => route('category.show', ['slug' => $currentParent->slug]),
            ]);
            $currentParent = $currentParent->parent;
        }
        foreach ($ancestors as $ancestor) {
            $breadcrumbs[] = $ancestor;
        }

        $breadcrumbs[] = [
            'name' => $category->name,
            'url' => route('category.show', ['slug' => $category->slug]),
        ];

        $seo = [
            'title' => $category->meta_title ?? $category->name . ' - ' . $storeName,
            'meta_description' => $category->meta_description ?? $category->description,
            'canonical_url' => url('/category/' . $slug),
            'og_image' => $category->image ?? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
        ];

        return Inertia::render('Shop/Category', [
            'category' => $category,
            'products' => $products,
            'siblings' => $siblingCategories,
            'filters' => (object) $request->only(['min_price', 'max_price', 'sort', 'b']),
            'seo' => $seo,
            'breadcrumbs' => $breadcrumbs,
        ]);
    }

    /**
     * Show Product Details page with dynamic reviews, questions, variants, related, and schema.
     */
    public function product($slug)
    {
        $storeName = $this->storeName();
        $product = Product::where('slug', $slug)
            ->where('status', 'active')
            ->with(['images', 'variants.attributeValues.attribute', 'categories', 'relatedProducts.primaryImage', 'relatedProducts.priceUnit:id,name,code', 'relatedProducts.weightUnit:id,name,code', 'reviews.user', 'questions.user', 'sizeChart.columns', 'sizeChart.rows.values.column', 'priceUnit:id,name,code', 'weightUnit:id,name,code'])
            ->firstOrFail();

        // Fetch manual related products first; fallback to products from the same categories.
        $relatedProducts = $product->relatedProducts
            ->where('status', 'active')
            ->take(4)
            ->values();

        if ($relatedProducts->isEmpty()) {
            $relatedProducts = Product::where('status', 'active')
                ->where('id', '!=', $product->id)
                ->whereHas('categories', function ($q) use ($product) {
                    $q->whereIn('categories.id', $product->categories->pluck('id'));
                })
                ->with(['primaryImage', 'priceUnit:id,name,code', 'weightUnit:id,name,code'])
                ->limit(4)
                ->get();
        }

        // Generate JSON-LD Schema Markup for SEO Google Rich Snippet
        $avgRating = round((float) ($product->reviews->avg('rating') ?? 0), 1);
        $reviewCount = $product->reviews->count();

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->name,
            'image' => collect([$product->meta_image])->filter()->merge($product->images->pluck('image_path'))->values()->all(),
            'description' => strip_tags($product->short_description),
            'sku' => $product->sku ?? 'G-' . $product->id,
            'offers' => [
                '@type' => 'Offer',
                'url' => url('/product/' . $slug),
                'priceCurrency' => 'BDT',
                'price' => $product->sale_price ?? $product->price,
                'priceValidUntil' => '2027-12-31',
                'itemCondition' => 'https://schema.org/NewCondition',
                'availability' => $product->stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
            ],
            'aggregateRating' => $reviewCount > 0 ? [
                '@type' => 'AggregateRating',
                'ratingValue' => $avgRating,
                'reviewCount' => $reviewCount
            ] : null
        ];

        $seo = [
            'title' => $product->meta_title ?? $product->name . ' - ' . $storeName,
            'meta_description' => $product->meta_description ?? strip_tags($product->short_description),
            'canonical_url' => url('/product/' . $slug),
            'og_image' => $product->meta_image ?: ($product->images->first()->image_path ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'),
            'schema' => $schema
        ];

        // Meta CAPI Server-Side Tracking for ViewContent
        $eventId = uniqid('evt_vc_', true);
        \App\Jobs\SendMetaCapiEvent::dispatch(
            'ViewContent',
            [
                'email' => optional(auth()->user())->email,
                'phone' => optional(auth()->user())->phone,
            ],
            [
                'content_name' => $product->name,
                'content_category' => optional($product->categories->first())->name ?? 'General',
                'content_ids' => [$product->id],
                'content_type' => 'product',
                'value' => (float)($product->sale_price ?? $product->price),
                'currency' => 'BDT',
            ],
            $eventId
        );

        $breadcrumbs = [
            ['name' => 'Home', 'url' => route('home')],
        ];
        $primaryCategory = $product->categories->first();
        if ($primaryCategory) {
            $breadcrumbs[] = [
                'name' => $primaryCategory->name,
                'url' => route('category.show', ['slug' => $primaryCategory->slug]),
            ];
        }
        $breadcrumbs[] = [
            'name' => $product->name,
            'url' => route('product.show', ['slug' => $product->slug]),
        ];

        return Inertia::render('Shop/ProductDetail', [
            'product' => $product,
            'related' => $relatedProducts,
            'seo' => $seo,
            'eventId' => $eventId,
            'breadcrumbs' => $breadcrumbs,
        ]);
    }


    /**
     * Product comparison page.
     */
    public function compare(Request $request)
    {
        $ids = collect(explode(',', (string) $request->query('ids', '')))
            ->map(fn ($id) => (int) trim($id))
            ->filter()
            ->unique()
            ->take(6)
            ->values();

        $products = $ids->isEmpty()
            ? collect()
            : Product::where('status', 'active')
                ->whereIn('id', $ids)
                ->with([
                    'primaryImage',
                    'images',
                    'variants.attributeValues.attribute',
                    'categories',
                    'reviews' => fn ($query) => $query->where('is_approved', true),
                    'sizeChart.columns',
                    'sizeChart.rows.values.column',
                    'priceUnit:id,name,code',
                    'weightUnit:id,name,code',
                ])
                ->get()
                ->filter(fn ($product) => ($product->settings['comparison_status'] ?? 'enabled') !== 'disabled')
                ->sortBy(fn ($product) => $ids->search($product->id))
                ->values();

        return Inertia::render('Shop/Compare', [
            'products' => $products,
            'ids' => $ids,
            'seo' => [
                'title' => 'Compare Products - ' . $this->storeName(),
                'meta_description' => 'Compare product prices, ratings, availability and specifications side by side.',
                'canonical_url' => url('/compare'),
            ],
        ]);
    }

    /**
     * Render a dynamic storefront page.
     */
    public function page($slug)
    {
        if (!Schema::hasTable('pages')) {
            abort(404);
        }

        $page = Page::where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        $seo = [
            'title' => $page->meta_title ?: $page->title,
            'meta_description' => $page->meta_description ?: strip_tags($page->excerpt ?: $page->content ?: ''),
            'canonical_url' => url('/page/' . $page->slug),
        ];

        return Inertia::render('Shop/Page', [
            'page' => $page,
            'seo' => $seo,
        ]);
    }

    /**
     * Instant search suggestion endpoint.
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 1) {
            return response()->json([]);
        }

        // Analytics: Track search queries
        Log::info("Search Term Tracked: " . $query);
        DB::table('settings')->updateOrInsert(
            ['key' => 'search_analytics_last_term'],
            ['value' => $query, 'group' => 'analytics']
        );

        $products = Product::where('status', 'active')
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('sku', 'like', "%{$query}%")
                  ->orWhere('short_description', 'like', "%{$query}%");
            })
            ->with(['primaryImage', 'priceUnit:id,name,code', 'weightUnit:id,name,code'])
            ->limit(5)
            ->get(['id', 'name', 'slug', 'sku', 'price', 'sale_price']);

        return response()->json($products);
    }

    /**
     * Submit product reviews.
     */
    public function addReview(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        Review::create([
            'product_id' => $productId,
            'user_id' => auth()->id(),
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => false,
        ]);

        return back()->with('success', 'Thank you! Your review has been submitted for admin approval.');
    }

    /**
     * Submit product questions.
     */
    public function addQuestion(Request $request, $productId)
    {
        $request->validate([
            'question' => 'required|string|max:1000'
        ]);

        Question::create([
            'product_id' => $productId,
            'user_id' => auth()->id(),
            'question' => $request->question,
        ]);

        return back()->with('success', 'Your question has been submitted. We will answer shortly.');
    }

    /**
     * Show quotation request form.
     */
    public function quotationRequest()
    {
        $storeName = $this->storeName();
        $brands = Brand::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        return Inertia::render('Shop/QuotationRequest', [
            'brands' => $brands,
            'seo' => [
                'title' => 'Quotation Request - ' . $storeName,
                'meta_description' => 'Request a quotation for bulk orders, procurement and project purchases.',
                'canonical_url' => url('/quotation-request'),
            ],
        ]);
    }

    /**
     * Store quotation request form submission.
     */
    public function storeQuotationRequest(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'address' => 'nullable|string|max:255',
            'product_name' => 'nullable|string|max:1000',
            'quantity' => 'nullable|integer|min:1|max:999999',
            'products' => 'required|string|min:10|max:5000',
            'brand_preference' => 'nullable|string|max:255',
            'message' => 'required|string|min:20|max:5000',
        ]);

        $validated['product_description'] = $validated['products'];
        $validated['quantity'] = $validated['quantity'] ?? 1;

        QuotationRequest::create($validated);

        return redirect()->back()->with('success', 'Quotation request submitted successfully. Our team will contact you soon.');
    }

    /**
     * Show public campaigns directory.
     */
    public function campaigns()
    {
        $settings = Setting::whereIn('group', ['general', 'theme'])
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();

        $now = now();
        $campaigns = \App\Models\Campaign::where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->withCount(['products as active_products_count' => function ($query) {
                $query->where('status', 'active');
            }])
            ->with(['products' => function ($query) {
                $query->where('status', 'active')
                    ->with(['primaryImage', 'images', 'categories', 'reviews', 'variants.attributeValues.attribute', 'priceUnit:id,name,code', 'weightUnit:id,name,code'])
                    ->latest()
                    ->limit(4);
            }])
            ->orderByRaw('CASE WHEN starts_at IS NULL THEN 1 ELSE 0 END')
            ->orderBy('starts_at')
            ->latest()
            ->get();

        $storeName = $settings['theme_name'] ?? $settings['store_name'] ?? $settings['site_title'] ?? $settings['header_logo_text'] ?? 'Online Store';

        return Inertia::render('Shop/CampaignsIndex', [
            'campaigns' => $campaigns,
            'settings' => $settings,
            'seo' => [
                'title' => 'Promotions & Campaigns | ' . $storeName,
                'meta_description' => 'Explore active promotions, seasonal campaigns, and curated product collections.',
                'canonical_url' => url('/campaigns'),
                'og_image' => $settings['store_logo'] ?? null,
            ],
        ]);
    }
    /**
     * Show campaign page by slug.
     */
    public function campaign($slug)
    {
        $campaign = \App\Models\Campaign::where('slug', $slug)
            ->where('is_active', true)
            ->with(['products' => function($q) {
                $q->where('status', 'active')->with(['primaryImage', 'images', 'categories', 'reviews', 'variants.attributeValues.attribute', 'priceUnit:id,name,code', 'weightUnit:id,name,code']);
            }])
            ->firstOrFail();

        $settings = Setting::whereIn('group', ['general', 'theme'])
            ->get()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();

        $seo = [
            'title' => $campaign->title . ' Campaign | ' . ($settings['theme_name'] ?? $settings['store_name'] ?? $settings['site_title'] ?? $settings['header_logo_text'] ?? 'Online Store'),
            'meta_description' => $campaign->description ?? 'Special Campaign collection.',
            'canonical_url' => url('/campaign/' . $slug),
            'og_image' => $campaign->banner_image ?? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
        ];

        return Inertia::render('Shop/Campaign', [
            'campaign' => $campaign,
            'settings' => $settings,
            'campaigns' => fn () => \App\Models\Campaign::where('is_active', true)->where('id', '!=', $campaign->id)->take(6)->get(),
            'seo' => $seo,
        ]);
    }

    private function productListingQuery(Request $request, ?array $categoryIds = null)
    {
        $query = Product::where('status', 'active')
            ->with([
                'primaryImage',
                    'images',
                    'variants.attributeValues.attribute',
                    'categories',
                    'priceUnit:id,name,code',
                    'weightUnit:id,name,code',
                'reviews' => function ($reviewQuery) {
                    $reviewQuery->where('is_approved', true);
                },
            ]);

        if ($categoryIds !== null) {
            $query->whereHas('categories', function ($categoryQuery) use ($categoryIds) {
                $categoryQuery->whereIn('categories.id', $categoryIds);
            });
        }

        if ($request->filled('min_price')) {
            $query->where(function ($priceQuery) use ($request) {
                $priceQuery->where('sale_price', '>=', $request->min_price)
                    ->orWhere(function ($regularPriceQuery) use ($request) {
                        $regularPriceQuery->whereNull('sale_price')->where('price', '>=', $request->min_price);
                    });
            });
        }

        if ($request->filled('max_price')) {
            $query->where(function ($priceQuery) use ($request) {
                $priceQuery->where('sale_price', '<=', $request->max_price)
                    ->orWhere(function ($regularPriceQuery) use ($request) {
                        $regularPriceQuery->whereNull('sale_price')->where('price', '<=', $request->max_price);
                    });
            });
        }

        if ($request->filled('b')) {
            $brand = trim((string) $request->get('b'));
            $brandSlug = Str::slug($brand);

            $query->whereNotNull('brand')
                ->where(function ($brandQuery) use ($brand, $brandSlug) {
                    $brandQuery->where('brand', $brand)
                        ->orWhereRaw('LOWER(REPLACE(brand, " ", "-")) = ?', [$brandSlug]);
                });
        }

        return match ($request->get('sort', 'newest')) {
            'price_asc' => $query->orderByRaw('COALESCE(sale_price, price) asc'),
            'price_desc' => $query->orderByRaw('COALESCE(sale_price, price) desc'),
            'popularity' => $query->orderByDesc('is_featured')->orderByDesc('created_at'),
            default => $query->orderByDesc('created_at'),
        };
    }

    private function descendantCategoryIds(int $categoryId): array
    {
        $ids = collect([$categoryId]);
        $frontier = collect([$categoryId]);

        while ($frontier->isNotEmpty()) {
            $children = Category::whereIn('parent_id', $frontier)
                ->where('is_active', true)
                ->pluck('id');
            $newIds = $children->diff($ids)->values();

            if ($newIds->isEmpty()) {
                break;
            }

            $ids = $ids->merge($newIds);
            $frontier = $newIds;
        }

        return $ids->unique()->values()->all();
    }

    private function storeName(): string
    {
        return Setting::get('theme_name')
            ?: Setting::get('store_name')
            ?: Setting::get('site_title')
            ?: Setting::get('header_logo_text')
            ?: 'Online Store';
    }

    private function brandLink(?string $name, ?string $link = null): string
    {
        if (filled($link) && $link !== '#') {
            return $link;
        }

        return route('shop.index', ['b' => Str::slug((string) $name)]);
    }
}



