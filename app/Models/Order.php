<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'subtotal',
        'tax',
        'shipping_cost',
        'shipping_method',
        'shipping_method_label',
        'discount',
        'total',
        'payment_method',
        'payment_status',
        'shipping_address',
        'billing_address',
        'phone',
        'email',
        'notes',
        'coupon_code',
        'loyalty_points_used',
        'tracking_number',
        'courier_code',
        'assigned_user_id',
        'created_by_id',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'billing_address' => 'array',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'loyalty_points_used' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function orderNotes(): HasMany
    {
        return $this->hasMany(OrderNote::class)->orderBy('created_at', 'desc');
    }
}
