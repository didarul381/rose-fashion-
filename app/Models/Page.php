<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'layout',
        'hero_image',
        'gallery_images',
        'excerpt',
        'content',
        'meta_title',
        'meta_description',
        'status',
        'sort_order',
        'show_in_footer',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'show_in_footer' => 'boolean',
        'gallery_images' => 'array',
    ];

    public function getHeroImageAttribute($value): ?string
    {
        return MediaUrl::resolve($value);
    }

    public function getGalleryImagesAttribute($value): array
    {
        $images = is_array($value) ? $value : (json_decode($value, true) ?: []);

        return array_values(array_filter(array_map(fn ($image) => MediaUrl::resolve($image), $images)));
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
