<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PriceUnit;
use App\Models\WeightUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UnitController extends Controller
{
    /**
     * Price unit manager.
     */
    public function priceUnits()
    {
        return Inertia::render('Admin/Units', [
            'units' => PriceUnit::orderBy('order_index')->orderBy('name')->paginate(15),
            'unitType' => 'price',
            'title' => 'Price Unit',
            'description' => 'Manage product selling units such as piece, set, box, carton, dozen or meter. Active units appear in the product form.',
            'examples' => ['pcs', 'set', 'box', 'ctn'],
        ]);
    }

    public function savePriceUnit(Request $request)
    {
        $data = $this->validateUnit($request, 'price_units');
        PriceUnit::updateOrCreate(['id' => $request->id], $data);

        return back()->with('success', 'Price unit saved successfully.');
    }

    public function deletePriceUnit($id)
    {
        PriceUnit::findOrFail($id)->delete();

        return back()->with('success', 'Price unit deleted successfully.');
    }

    /**
     * Weight unit manager.
     */
    public function weightUnits()
    {
        return Inertia::render('Admin/Units', [
            'units' => WeightUnit::orderBy('order_index')->orderBy('name')->paginate(15),
            'unitType' => 'weight',
            'title' => 'Weight Unit',
            'description' => 'Manage product weight units such as gram, kilogram, pound or ton. Active units appear in the product form.',
            'examples' => ['g', 'kg', 'lb', 'ton'],
        ]);
    }

    public function saveWeightUnit(Request $request)
    {
        $data = $this->validateUnit($request, 'weight_units');
        WeightUnit::updateOrCreate(['id' => $request->id], $data);

        return back()->with('success', 'Weight unit saved successfully.');
    }

    public function deleteWeightUnit($id)
    {
        WeightUnit::findOrFail($id)->delete();

        return back()->with('success', 'Weight unit deleted successfully.');
    }

    protected function validateUnit(Request $request, string $table): array
    {
        $request->merge([
            'code' => Str::slug($request->code ?: $request->name),
        ]);

        return $request->validate([
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:50', Rule::unique($table, 'code')->ignore($request->id)],
            'description' => 'nullable|string|max:1000',
            'order_index' => 'nullable|integer|min:0|max:999999',
            'is_active' => 'nullable|boolean',
        ]) + ['is_active' => false, 'order_index' => 0];
    }
}
