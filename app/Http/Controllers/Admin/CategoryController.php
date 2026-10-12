<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Traits\HandlesAdminMedia;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\MediaUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoryController extends Controller
{
    use HandlesAdminMedia;

    /**
     * Categories CRUD List Page.
     */
    public function categories(Request $request)
    {
        $query = Category::with('parent');

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('level')) {
            if ($request->level === 'main') {
                $query->whereNull('parent_id');
            } elseif ($request->level === 'sub') {
                $query->whereNotNull('parent_id');
            }
        }

        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        if ($request->filled('show_on_home')) {
            $query->where('show_on_home', $request->show_on_home === '1' || $request->show_on_home === 'true');
        }

        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->is_featured === '1' || $request->is_featured === 'true');
        }

        $categories = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();
        $parentCategories = Category::whereNull('parent_id')->get();

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
            'parentCategories' => $parentCategories,
            'filters' => $request->only(['search', 'level', 'parent_id', 'status', 'show_on_home', 'is_featured']),
        ]);
    }

    /**
     * Store or update category.
     */
    public function saveCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($request->id)],
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'image' => 'nullable|file|image|max:4096',
            'image_url' => 'nullable|string',
            'is_featured' => 'required|boolean',
            'show_on_home' => 'required|boolean',
            'is_active' => 'required|boolean',
        ]);

        $imagePath = $request->image_url;

        if ($request->hasFile('image')) {
            $path = $this->storeUploadedImageAsWebp($request->file('image'), 'categories');
            $imagePath = MediaUrl::resolve('/storage/'.$path);
        }

        $categorySlug = $request->filled('slug')
            ? Str::slug($request->slug)
            : ($request->id ? Category::find($request->id)->slug : Str::slug($request->name));

        Category::updateOrCreate(
            ['id' => $request->id],
            [
                'name' => $request->name,
                'slug' => $categorySlug,
                'parent_id' => $request->parent_id,
                'description' => $request->description,
                'image' => $imagePath,
                'is_featured' => $request->is_featured,
                'show_on_home' => $request->show_on_home,
                'is_active' => $request->is_active,
            ]
        );

        return redirect()->back()->with('success', 'Category saved successfully!');
    }

    /**
     * Delete Category.
     */
    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return redirect()->back()->with('success', 'Category deleted successfully!');
    }

    /**
     * Delete selected categories.
     */
    public function bulkDeleteCategories(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:categories,id',
        ]);

        Category::whereIn('id', $validated['ids'])->delete();

        return redirect()->back()->with('success', count($validated['ids']).' category(ies) deleted successfully!');
    }
}
