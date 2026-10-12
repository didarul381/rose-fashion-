<?php

namespace App\Http\Controllers\Admin\Traits;

use App\Support\MediaUrl;
use Illuminate\Support\Facades\File;

trait HandlesAdminMedia
{
    /**
     * Recursively normalize stored media URLs so legacy /storage paths still work.
     */
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

    /**
     * Store uploaded raster images as WebP for faster storefront delivery.
     * Falls back to the original file when GD/WebP conversion is unavailable.
     */
    protected function storeUploadedImageAsWebp($file, string $directory, int $quality = 82): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        $mimeType = strtolower((string) $file->getMimeType());
        $convertible = in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)
            && in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp'], true)
            && function_exists('imagecreatefromstring')
            && function_exists('imagewebp');

        if (! $convertible) {
            return $file->store($directory, 'public');
        }

        try {
            $contents = file_get_contents($file->getRealPath());
            $image = $contents ? imagecreatefromstring($contents) : false;

            if (! $image) {
                return $file->store($directory, 'public');
            }

            if (function_exists('imagepalettetotruecolor')) {
                imagepalettetotruecolor($image);
            }

            imagealphablending($image, true);
            imagesavealpha($image, true);

            $filename = bin2hex(random_bytes(16)).'.webp';
            $path = trim($directory, '/').'/'.$filename;
            $absoluteDirectory = storage_path('app/public/'.trim($directory, '/'));
            File::ensureDirectoryExists($absoluteDirectory);

            $saved = imagewebp($image, storage_path('app/public/'.$path), $quality);
            imagedestroy($image);

            if (! $saved) {
                return $file->store($directory, 'public');
            }

            return $path;
        } catch (\Throwable $e) {
            return $file->store($directory, 'public');
        }
    }
}
