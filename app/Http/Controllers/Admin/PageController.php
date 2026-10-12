<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Dynamic Pages Management List.
     */
    public function pages(Request $request)
    {
        if (! Schema::hasTable('pages')) {
            return Inertia::render('Admin/Pages', [
                'pages' => new LengthAwarePaginator([], 0, 10),
                'filters' => $request->only(['search', 'status']),
            ]);
        }

        $query = Page::orderBy('sort_order')->orderBy('title');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $pages = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Pages', [
            'pages' => $pages,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Save or update a storefront page.
     */
    public function savePage(Request $request)
    {
        if (! Schema::hasTable('pages')) {
            return redirect()->back()->with('error', 'The pages table has not been created yet. Please run the migration first.');
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('pages', 'slug')->ignore($request->id)],
            'layout' => 'nullable|in:standard,single',
            'hero_image' => 'nullable|string|max:2048',
            'gallery_images' => 'nullable|string',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'status' => 'nullable|in:active,inactive',
            'sort_order' => 'nullable|integer|min:0',
            'show_in_footer' => 'nullable|boolean',
        ]);

        $slug = $this->uniquePageSlug($request->slug, $request->title, $request->id);
        $galleryImages = $this->parseImageList($request->gallery_images);
        $isNewPage = empty($request->id);
        $sortOrder = $request->filled('sort_order')
            ? (int) $request->sort_order
            : ($isNewPage ? ((int) Page::max('sort_order') + 1) : (int) ($request->sort_order ?? 0));

        Page::updateOrCreate(
            ['id' => $request->id],
            [
                'title' => $request->title,
                'slug' => $slug,
                'layout' => $request->layout ?: 'standard',
                'hero_image' => $request->hero_image ?: null,
                'gallery_images' => $galleryImages,
                'excerpt' => $request->excerpt,
                'content' => $request->content,
                'meta_title' => $request->meta_title,
                'meta_description' => $request->meta_description,
                'status' => $request->status ?: 'active',
                'sort_order' => $sortOrder,
                'show_in_footer' => $request->has('show_in_footer') ? $request->boolean('show_in_footer') : true,
            ]
        );

        return redirect()->back()->with('success', 'Page saved successfully!');
    }

    /**
     * Delete a storefront page.
     */
    public function deletePage($id)
    {
        if (! Schema::hasTable('pages')) {
            return redirect()->back()->with('error', 'The pages table has not been created yet. Please run the migration first.');
        }

        Page::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Page deleted successfully!');
    }

    /**
     * Make a unique page slug.
     */
    protected function uniquePageSlug(?string $slug, string $title, ?int $ignoreId = null): string
    {
        $baseSlug = trim((string) $slug) !== '' ? Str::slug($slug) : Str::slug($title);
        $baseSlug = $baseSlug !== '' ? $baseSlug : 'page';
        $candidate = $baseSlug;
        $index = 2;

        while (
            Page::where('slug', $candidate)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = $baseSlug.'-'.$index;
            $index++;
        }

        return $candidate;
    }

    /**
     * Convert a comma/newline separated image list into an array.
     */
    protected function parseImageList($images): array
    {
        if (is_array($images)) {
            return array_values(array_filter(array_map('trim', $images)));
        }

        $raw = trim((string) $images);
        if ($raw === '') {
            return [];
        }

        $items = preg_split('/[\r\n,]+/', $raw) ?: [];

        return array_values(array_filter(array_map('trim', $items)));
    }
}
