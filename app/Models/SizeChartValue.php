<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SizeChartValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'size_chart_row_id',
        'size_chart_column_id',
        'value',
    ];

    public function row(): BelongsTo
    {
        return $this->belongsTo(SizeChartRow::class, 'size_chart_row_id');
    }

    public function column(): BelongsTo
    {
        return $this->belongsTo(SizeChartColumn::class, 'size_chart_column_id');
    }
}
