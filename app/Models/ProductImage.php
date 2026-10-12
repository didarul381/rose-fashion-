<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'image_path',
        'is_primary',
        'order_index',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'order_index' => 'integer',
    ];

    public function getImagePathAttribute($value): ?string
    {
        return MediaUrl::resolve($value);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
