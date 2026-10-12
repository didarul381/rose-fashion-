<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Courier extends Model
{
    protected $fillable = [
        'name',
        'code',
        'inside_city_charge',
        'outside_city_charge',
        'is_default',
        'is_active',
        'api_key',
        'secret_key',
    ];

    protected $casts = [
        'inside_city_charge' => 'decimal:2',
        'outside_city_charge' => 'decimal:2',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];
}
