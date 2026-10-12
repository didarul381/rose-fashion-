<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Traits\HandlesAdminMedia;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BrandController extends Controller
{
    use HandlesAdminMedia;

    /**
     * Brands CRUD List Page.
     */
    public function brands(Request $request)
    {
        $query = Brand::query();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $sort = $request->get('sort', 'order_index_asc');
        match ($sort) {
            'name_asc' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            'newest' => $query->orderBy('created_at', 'desc'),
            default => $query->orderBy('order_index', 'asc')->orderBy('name', 'asc'),
        };

        $brands = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Brands', [
            'brands' => $brands,
            'filters' => (object) [
                'search' => $request->get('search', ''),
                'status' => $request->get('status', ''),
                'sort' => $request->get('sort', 'order_index_asc'),
            ],
        ]);
    }

    /**
     * Store or update brand.
     */
    public function saveBrand(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|file|image|max:10240',
            'logo_url' => 'nullable|string',
            'order_index' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $isUpdate = filled($request->id);
        $existingBrand = $isUpdate ? Brand::findOrFail($request->id) : null;
        $baseSlug = trim((string) $request->slug) !== ''
            ? Str::slug($request->slug)
            : Str::slug($request->name);
        $slug = $isUpdate && $existingBrand && blank($request->slug)
            ? $existingBrand->slug
            : $this->uniqueBrandSlug($baseSlug ?: 'brand', $request->id);

        $logo = $existingBrand?->logo;
        if ($request->hasFile('logo')) {
            $path = $this->storeUploadedImageAsWebp($request->file('logo'), 'brands');
            $logo = MediaUrl::resolve('/storage/'.$path);
        } elseif ($request->filled('logo_url')) {
            $logo = MediaUrl::resolve($request->logo_url);
        } elseif (! $isUpdate) {
            $logo = null;
        }

        Brand::updateOrCreate(
            ['id' => $request->id],
            [
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'logo' => $logo,
                'order_index' => (int) $request->get('order_index', 0),
                'is_active' => $request->boolean('is_active'),
            ]
        );

        return redirect()->back()->with('success', 'Brand saved successfully.');
    }

    /**
     * Delete brand.
     */
    public function deleteBrand($id)
    {
        Brand::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Brand deleted successfully.');
    }

    /**
     * Delete selected brands.
     */
    public function bulkDeleteBrands(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:brands,id',
        ]);

        Brand::whereIn('id', $validated['ids'])->delete();

        return redirect()->back()->with('success', count($validated['ids']).' brand(s) deleted successfully.');
    }

    protected function uniqueBrandSlug(string $slug, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug) ?: 'brand';
        $candidate = $base;
        $counter = 2;

        while (
            Brand::where('slug', $candidate)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = $base.'-'.$counter;
            $counter++;
        }

        return $candidate;
    }
}
