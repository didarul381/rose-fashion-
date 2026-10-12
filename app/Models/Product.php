<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'brand',
        'type',
        'description',
        'short_description',
        'price',
        'sale_price',
        'price_unit_id',
        'cost_price',
        'is_featured',
        'status',
        'stock',
        'weight',
        'weight_unit_id',
        'material',
        'size_chart_id',
        'digital_file_url',
        'labels',
        'video_url',
        'meta_title',
        'meta_description',
        'meta_image',
        'settings',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'is_featured' => 'boolean',
        'labels' => 'array',
        'stock' => 'integer',
        'weight' => 'decimal:2',
        'price_unit_id' => 'integer',
        'weight_unit_id' => 'integer',
        'settings' => 'array',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function relatedProducts(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_related_product', 'product_id', 'related_product_id')
            ->withTimestamps();
    }

    public function sizeChart(): BelongsTo
    {
        return $this->belongsTo(SizeChart::class);
    }

    public function priceUnit(): BelongsTo
    {
        return $this->belongsTo(PriceUnit::class);
    }

    public function weightUnit(): BelongsTo
    {
        return $this->belongsTo(WeightUnit::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('order_index');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true)->withDefault([
            'image_path' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'
        ]);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('is_approved', true);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('created_at', 'desc');
    }
}
