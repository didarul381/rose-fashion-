<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Courier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourierController extends Controller
{
    /**
     * Courier Management List.
     */
    public function couriers(Request $request)
    {
        $query = Courier::orderBy('name');
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }
        $couriers = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Couriers', [
            'couriers' => $couriers,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Save/Update Courier config.
     */
    public function saveCourier(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:couriers,code,'.$request->id,
            'inside_city_charge' => 'required|numeric|min:0',
            'outside_city_charge' => 'required|numeric|min:0',
            'is_default' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'api_key' => 'nullable|string',
            'secret_key' => 'nullable|string',
        ]);

        if ($request->is_default) {
            Courier::where('is_default', true)->update(['is_default' => false]);
        }

        Courier::updateOrCreate(
            ['id' => $request->id],
            [
                'name' => $request->name,
                'code' => $request->code,
                'inside_city_charge' => $request->inside_city_charge,
                'outside_city_charge' => $request->outside_city_charge,
                'is_default' => $request->is_default ?? false,
                'is_active' => $request->is_active ?? true,
                'api_key' => $request->api_key,
                'secret_key' => $request->secret_key,
            ]
        );

        return redirect()->back()->with('success', 'Courier saved successfully!');
    }

    public function deleteCourier($id)
    {
        $courier = Courier::findOrFail($id);
        $courier->delete();

        return redirect()->back()->with('success', 'Courier deleted successfully!');
    }
}
