<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ShippingMethodController extends Controller
{
    /**
     * Shipping Method Management List.
     */
    public function shippingMethods(Request $request)
    {
        $query = ShippingMethod::orderBy('sort_order')->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }
        $shippingMethods = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/ShippingMethods', [
            'shippingMethods' => $shippingMethods,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Save/Update Shipping Method.
     */
    public function saveShippingMethod(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'charge' => 'required|numeric|min:0',
            'weight_based_enabled' => 'nullable|boolean',
            'weight_rates' => 'nullable|string|max:5000',
            'status' => 'required|in:active,inactive',
            'sort_order' => 'required|integer|min:0',
        ]);

        $slug = $this->uniqueShippingMethodSlug($request->name, $request->id);
        ShippingMethod::updateOrCreate(
            ['id' => $request->id],
            [
                'name' => $request->name,
                'slug' => $slug,
                'charge' => $request->charge,
                'weight_based_enabled' => $request->boolean('weight_based_enabled'),
                'weight_rates' => $request->weight_rates,
                'status' => $request->status,
                'sort_order' => $request->sort_order,
            ]
        );

        return redirect()->back()->with('success', 'Shipping method saved successfully!');
    }

    public function deleteShippingMethod($id)
    {
        $shippingMethod = ShippingMethod::findOrFail($id);
        $shippingMethod->delete();

        return redirect()->back()->with('success', 'Shipping method deleted successfully!');
    }

    protected function uniqueShippingMethodSlug(string $name, $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $index = 1;

        while (
            ShippingMethod::where('slug', $slug)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $baseSlug.'-'.$index;
            $index++;
        }

        return $slug;
    }
}
