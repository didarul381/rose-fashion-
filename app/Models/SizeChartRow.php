<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SizeChartRow extends Model
{
    use HasFactory;

    protected $fillable = [
        'size_chart_id',
        'label',
        'sort_order',
    ];

    public function sizeChart(): BelongsTo
    {
        return $this->belongsTo(SizeChart::class);
    }

    public function values(): HasMany
    {
        return $this->hasMany(SizeChartValue::class);
    }
}
