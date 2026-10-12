<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Traits\HandlesAdminMedia;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\PriceUnit;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\SizeChart;
use App\Models\WeightUnit;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    use HandlesAdminMedia;

    /**
     * Product List CRUD page.
     */
    public function products(Request $request)
    {
        $query = Product::with(['categories', 'relatedProducts:id,name,slug', 'images', 'variants.attributeValues.attribute', 'sizeChart:id,name,status,unit,type', 'priceUnit:id,name,code', 'weightUnit:id,name,code'])
            ->withCount(['reviews as approved_reviews_count' => fn ($reviewQuery) => $reviewQuery->where('is_approved', true)]);

        if (Schema::hasTable('order_items')) {
            $salesSubquery = DB::table('order_items')
                ->selectRaw('COALESCE(SUM(quantity), 0)')
                ->whereColumn('order_items.product_id', 'products.id');

            $query->select('products.*')->selectSub($salesSubquery, 'sold_qty');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $categoryId = $request->category;
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('visibility')) {
            if ($request->visibility === 'featured') {
                $query->where('is_featured', true);
            } elseif ($request->visibility === 'discounted') {
                $query->whereNotNull('sale_price')->whereColumn('sale_price', '<', 'price');
            } elseif ($request->visibility === 'latest') {
                $query->where('created_at', '>=', now()->subDays(30));
            } elseif ($request->visibility === 'best_selling' && Schema::hasTable('order_items')) {
                $query->orderByDesc('sold_qty');
            } elseif ($request->visibility === 'trending') {
                $query->orderByDesc('is_featured')
                    ->when(Schema::hasTable('order_items'), fn ($q) => $q->orderByDesc('sold_qty'))
                    ->orderByDesc('approved_reviews_count');
            }
        }

        if ($request->filled('size_chart_id')) {
            $query->where('size_chart_id', $request->size_chart_id);
        }

        if ($request->filled('stock_status')) {
            $status = $request->stock_status;
            if ($status === 'out') {
                $query->where('stock', '<=', 0);
            } elseif ($status === 'low') {
                $query->whereBetween('stock', [1, 5]);
            } elseif ($status === 'in') {
                $query->where('stock', '>', 5);
            }
        }

        if (! $request->filled('visibility') || ! in_array($request->visibility, ['best_selling', 'trending'], true)) {
            $query->orderBy('created_at', 'desc');
        }

        $products = $query->paginate(10)->withQueryString();
        $categories = Category::orderBy('name')->get();
        $sizeCharts = SizeChart::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'unit', 'status']);
        $activeBrands = Brand::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'logo']);

        $activePriceUnits = PriceUnit::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
        $activeWeightUnits = WeightUnit::where('is_active', true)
            ->orderBy('order_index')
            ->orderBy('name')
            ->get(['id', 'name', 'code']);
        $productOptions = Product::orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('Admin/Products', [
            'products' => $products,
            'categories' => $categories,
            'sizeCharts' => $sizeCharts,
            'activeBrands' => $activeBrands,
            'activePriceUnits' => $activePriceUnits,
            'activeWeightUnits' => $activeWeightUnits,
            'productOptions' => $productOptions,
            'filters' => $request->only(['search', 'category', 'type', 'stock_status', 'status', 'visibility', 'size_chart_id']),
        ]);
    }

    /**
     * Save/Create a product.
     */
    public function saveProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:simple,variable,digital,bundle',
            'status' => 'required|string|in:active,inactive',
            'is_featured' => 'nullable|boolean',
            'price' => 'required|numeric',
            'sale_price' => 'nullable|numeric',
            'price_unit_id' => 'nullable|exists:price_units,id',
            'stock' => 'required|integer',
            'weight' => 'nullable|numeric|min:0',
            'weight_unit_id' => 'nullable|exists:weight_units,id',
            'brand' => 'nullable|string|max:255',
            'category_ids' => 'required|array',
            'related_product_ids' => 'nullable|array',
            'related_product_ids.*' => 'integer|exists:products,id',
            'short_description' => 'required|string',
            'description' => 'nullable|string',
            'video_url' => 'nullable|string|max:2048',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_image' => 'nullable|file|image|max:10240',
            'meta_image_url' => 'nullable|string|max:2048',
            'size_chart_id' => 'nullable|exists:size_charts,id',
            'settings' => 'nullable',
            'primary_image' => 'nullable|file|image|max:10240',
            'additional_images' => 'nullable|array',
            'additional_images.*' => 'file|image|max:10240',
            'primary_image_url' => 'nullable|string',
            'additional_image_urls' => 'nullable|string',
            'variants' => 'nullable|string', // JSON serialized from React
        ]);

        $settingsData = null;
        if ($request->filled('settings')) {
            $settingsData = is_string($request->settings)
                ? json_decode($request->settings, true)
                : $request->settings;
        }

        $isUpdate = filled($request->id);
        $existingProduct = $isUpdate ? Product::find($request->id) : null;
        $slug = $isUpdate && $existingProduct
            ? $existingProduct->slug
            : $this->uniqueProductSlug($request->name);

        $sku = $this->normalizeProductSku($request->sku);
        if (blank($sku)) {
            $sku = $isUpdate && $existingProduct && filled($existingProduct->sku)
                ? $existingProduct->sku
                : $this->generateUniqueProductSku();
        } else {
            $sku = $this->uniqueProductSku($sku, $request->id);
        }

        $product = Product::updateOrCreate(
            ['id' => $request->id],
            [
                'name' => $request->name,
                'slug' => $slug,
                'type' => $request->type,
                'price' => $request->price,
                'sale_price' => $request->sale_price,
                'price_unit_id' => $request->price_unit_id ?: null,
                'is_featured' => $request->boolean('is_featured'),
                'stock' => $request->stock,
                'weight' => $request->weight,
                'weight_unit_id' => $request->weight_unit_id ?: null,
                'sku' => $sku,
                'brand' => $this->normalizeProductBrand($request->brand),
                'short_description' => $request->short_description,
                'description' => $request->description,
                'video_url' => $request->video_url,
                'meta_title' => $request->meta_title,
                'meta_description' => $request->meta_description,
                'meta_image' => $request->meta_image_url ? MediaUrl::resolve($request->meta_image_url) : ($existingProduct->meta_image ?? null),
                'size_chart_id' => $request->size_chart_id ?: null,
                'status' => $request->status ?? 'active',
                'settings' => $settingsData,
            ]
        );

        $product->categories()->sync($request->category_ids);
        $relatedIds = collect($request->input('related_product_ids', []))
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0 && $id !== (int) $product->id)
            ->unique()
            ->values()
            ->all();
        $product->relatedProducts()->sync($relatedIds);

        // Update SEO Meta Image
        if ($request->hasFile('meta_image')) {
            $path = $this->storeUploadedImageAsWebp($request->file('meta_image'), 'products/meta');
            $product->update(['meta_image' => MediaUrl::resolve('/storage/'.$path)]);
        } elseif ($request->filled('meta_image_url')) {
            $product->update(['meta_image' => MediaUrl::resolve($request->meta_image_url)]);
        }

        // Update Primary Image
        if ($request->hasFile('primary_image')) {
            $path = $this->storeUploadedImageAsWebp($request->file('primary_image'), 'products');
            $product->images()->where('is_primary', true)->delete();
            $product->images()->create([
                'image_path' => MediaUrl::resolve('/storage/'.$path),
                'is_primary' => true,
            ]);
        } elseif ($request->filled('primary_image_url')) {
            $product->images()->where('is_primary', true)->delete();
            $product->images()->create([
                'image_path' => MediaUrl::resolve($request->primary_image_url),
                'is_primary' => true,
            ]);
        } elseif (! $request->id) {
            // Default fallback image if new and blank
            $product->images()->create([
                'image_path' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
                'is_primary' => true,
            ]);
        }

        // Update Additional Images
        if ($request->has('additional_image_urls')) {
            $product->images()->where('is_primary', false)->delete();

            $urls = preg_split('/[\n,]+/', $request->additional_image_urls);
            foreach ($urls as $url) {
                $trimmed = trim($url);
                if (! empty($trimmed)) {
                    $product->images()->create([
                        'image_path' => MediaUrl::resolve($trimmed),
                        'is_primary' => false,
                    ]);
                }
            }
        }

        if ($request->hasFile('additional_images')) {
            foreach ($request->file('additional_images') as $file) {
                $path = $this->storeUploadedImageAsWebp($file, 'products');
                $product->images()->create([
                    'image_path' => MediaUrl::resolve('/storage/'.$path),
                    'is_primary' => false,
                ]);
            }
        }

        // Update Product Variants if variable product
        if ($request->type === 'variable' && $request->filled('variants')) {
            $variantsData = json_decode($request->variants, true);
            if (is_array($variantsData)) {
                $activeVariantIds = [];

                foreach ($variantsData as $vItem) {
                    $sku = $vItem['sku'] ?? null;
                    if (empty($sku)) {
                        $slugValues = array_map(function ($val) {
                            return Str::slug($val);
                        }, array_values($vItem['attributes'] ?? []));
                        $sku = ($product->sku ?: 'G-'.$product->id).'-'.strtoupper(implode('-', $slugValues));
                    }

                    $variant = $product->variants()->updateOrCreate(
                        ['product_id' => $product->id, 'sku' => $sku],
                        [
                            'price' => ! empty($vItem['price']) ? $vItem['price'] : $product->price,
                            'sale_price' => ! empty($vItem['sale_price']) ? $vItem['sale_price'] : null,
                            'stock' => $vItem['stock'] ?? 0,
                            'image_path' => $vItem['image_path'] ?? null,
                        ]
                    );

                    $activeVariantIds[] = $variant->id;

                    $attrValueIds = [];
                    foreach ($vItem['attributes'] ?? [] as $attrName => $attrVal) {
                        $trimmedName = trim($attrName);
                        $trimmedVal = trim($attrVal);

                        if (! empty($trimmedName) && ! empty($trimmedVal)) {
                            // Find or create attribute
                            $attribute = ProductAttribute::firstOrCreate(
                                ['code' => Str::slug($trimmedName)],
                                ['name' => $trimmedName]
                            );

                            // Find or create attribute value
                            $value = ProductAttributeValue::firstOrCreate([
                                'attribute_id' => $attribute->id,
                                'value' => $trimmedVal,
                            ]);

                            $attrValueIds[] = $value->id;
                        }
                    }

                    if (! empty($attrValueIds)) {
                        $variant->attributeValues()->sync($attrValueIds);
                    }
                }

                // Delete any variants that were not in the updated list
                $product->variants()->whereNotIn('id', $activeVariantIds)->delete();
            }
        } else {
            // Delete all variants if product type is changed to simple, digital, etc.
            $product->variants()->delete();
        }

        return redirect()->back()->with('success', 'Product saved successfully!');
    }

    /**
     * Normalize a product SKU string.
     */
    protected function normalizeProductSku(?string $sku): string
    {
        return trim((string) $sku);
    }

    /**
     * Normalize a product brand string.
     */
    protected function normalizeProductBrand(?string $brand): ?string
    {
        $brand = trim((string) $brand);

        return $brand === '' ? null : $brand;
    }

    /**
     * Generate a unique product slug for a new product.
     */
    protected function uniqueProductSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $counter = 2;

        while (
            Product::where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Generate a unique fallback SKU.
     */
    protected function generateUniqueProductSku(): string
    {
        do {
            $sku = 'G-'.rand(1000, 9999);
        } while (Product::where('sku', $sku)->exists());

        return $sku;
    }

    /**
     * Ensure the given SKU is unique across products.
     */
    protected function uniqueProductSku(string $sku, ?int $ignoreId = null): string
    {
        $base = trim($sku);
        if ($base === '') {
            return $this->generateUniqueProductSku();
        }

        $candidate = $base;
        $counter = 2;

        while (
            Product::where('sku', $candidate)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = $base.'-'.$counter;
            $counter++;
        }

        return $candidate;
    }

    /**
     * Delete product.
     */
    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return redirect()->back()->with('success', 'Product deleted successfully!');
    }

    /**
     * Delete selected products.
     */
    public function bulkDeleteProducts(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:products,id',
        ]);

        Product::whereIn('id', $validated['ids'])->delete();

        return redirect()->back()->with('success', count($validated['ids']).' product(s) deleted successfully!');
    }
}
