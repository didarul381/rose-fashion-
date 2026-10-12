<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SizeChart extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'unit',
        'status',
        'image_path',
        'measurement_instructions',
    ];

    public function getImagePathAttribute($value): ?string
    {
        return MediaUrl::resolve($value);
    }

    public function columns(): HasMany
    {
        return $this->hasMany(SizeChartColumn::class)->orderBy('sort_order');
    }

    public function rows(): HasMany
    {
        return $this->hasMany(SizeChartRow::class)->orderBy('sort_order');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
