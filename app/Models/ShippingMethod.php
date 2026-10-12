<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ShippingMethod extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'charge',
        'weight_based_enabled',
        'weight_rates',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'charge' => 'decimal:2',
        'weight_based_enabled' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::saving(function (ShippingMethod $method) {
            if (!$method->slug) {
                $method->slug = Str::slug($method->name);
            }
        });
    }
}
