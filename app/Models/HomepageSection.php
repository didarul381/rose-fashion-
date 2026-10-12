<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    protected $fillable = [
        'title',
        'type',
        'settings',
        'order_index',
        'is_active',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
        'order_index' => 'integer',
    ];

    public function getSettingsAttribute($value): array
    {
        $settings = is_string($value) ? (json_decode($value, true) ?: []) : (is_array($value) ? $value : []);

        return $this->normalizeMediaValues($settings);
    }

    protected function normalizeMediaValues(array $values): array
    {
        foreach ($values as $key => $value) {
            if (is_array($value)) {
                $values[$key] = $this->normalizeMediaValues($value);
                continue;
            }

            if (is_string($value)) {
                $values[$key] = MediaUrl::resolve($value);
            }
        }

        return $values;
    }
}
