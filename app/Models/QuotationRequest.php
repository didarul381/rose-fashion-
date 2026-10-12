<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company',
        'email',
        'phone',
        'address',
        'products',
        'product_name',
        'quantity',
        'price',
        'product_description',
        'delivery_time',
        'advance_payment',
        'at_delivery_payment',
        'brand_preference',
        'message',
        'status',
        'admin_notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
    ];
}