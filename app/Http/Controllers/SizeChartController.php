<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\SizeChart;
use App\Models\SizeChartColumn;
use App\Models\SizeChartRow;
use App\Models\SizeChartValue;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SizeChartController extends Controller
{
    public function index(Request $request)
    {
        $query = SizeChart::query()
            ->withCount(['products', 'rows', 'columns'])
            ->with(['columns', 'rows.values.column']);

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $sort = $request->get('sort', 'updated_desc');
        match ($sort) {
            'name_asc' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            'created_asc' => $query->orderBy('created_at', 'asc'),
            'created_desc' => $query->orderBy('created_at', 'desc'),
            'products_desc' => $query->orderBy('products_count', 'desc'),
            'products_asc' => $query->orderBy('products_count', 'asc'),
            default => $query->orderBy('updated_at', 'desc'),
        };

        return Inertia::render('Admin/SizeCharts', [
            'sizeCharts' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status', 'type', 'sort']),
            'typeOptions' => $this->typeOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/SizeCharts/Form', [
            'mode' => 'create',
            'sizeChart' => null,
            'typeOptions' => $this->typeOptions(),
            'statusOptions' => $this->statusOptions(),
            'unitOptions' => $this->unitOptions(),
        ]);
    }

    public function edit($id)
    {
        $sizeChart = SizeChart::withCount(['products', 'rows', 'columns'])
            ->with([
                'columns' => fn ($query) => $query->orderBy('sort_order'),
                'rows.values.column',
                'rows' => fn ($query) => $query->orderBy('sort_order'),
            ])
            ->findOrFail($id);

        return Inertia::render('Admin/SizeCharts/Form', [
            'mode' => 'edit',
            'sizeChart' => $sizeChart,
            'typeOptions' => $this->typeOptions(),
            'statusOptions' => $this->statusOptions(),
            'unitOptions' => $this->unitOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);

        $sizeChart = DB::transaction(function () use ($validated, $request) {
            $sizeChart = new SizeChart();
            $sizeChart->fill($this->payloadFields($validated));
            $sizeChart->image_path = $this->resolveImagePath($request, null);
            $sizeChart->save();

            $this->syncChartStructure($sizeChart, $validated);

            return $sizeChart;
        });

        return redirect()
            ->route('admin.size-charts.edit', $sizeChart->id)
            ->with('success', 'Size chart created successfully.');
    }

    public function update(Request $request, $id)
    {
        $sizeChart = SizeChart::findOrFail($id);
        $validated = $this->validatePayload($request);

        DB::transaction(function () use ($validated, $request, $sizeChart) {
            $sizeChart->fill($this->payloadFields($validated));
            $sizeChart->image_path = $this->resolveImagePath($request, $sizeChart->image_path);
            $sizeChart->save();

            $sizeChart->columns()->delete();
            $sizeChart->rows()->delete();

            $this->syncChartStructure($sizeChart, $validated);
        });

        return redirect()
            ->route('admin.size-charts.edit', $sizeChart->id)
            ->with('success', 'Size chart updated successfully.');
    }

    public function duplicate($id)
    {
        $source = SizeChart::with(['columns', 'rows.values'])->findOrFail($id);

        $copy = DB::transaction(function () use ($source) {
            $copy = $source->replicate();
            $copy->name = $source->name . ' (Copy)';
            $copy->status = 'draft';
            $copy->save();

            $columnMap = [];
            foreach ($source->columns as $index => $column) {
                $newColumn = $copy->columns()->create([
                    'name' => $column->name,
                    'sort_order' => $index,
                ]);
                $columnMap[$column->id] = $newColumn->id;
            }

            foreach ($source->rows as $rowIndex => $row) {
                $newRow = $copy->rows()->create([
                    'label' => $row->label,
                    'sort_order' => $rowIndex,
                ]);

                foreach ($row->values as $value) {
                    $newColumnId = $columnMap[$value->size_chart_column_id] ?? null;
                    if (!$newColumnId) {
                        continue;
                    }

                    $newRow->values()->create([
                        'size_chart_column_id' => $newColumnId,
                        'value' => $value->value,
                    ]);
                }
            }

            return $copy;
        });

        return redirect()
            ->route('admin.size-charts.edit', $copy->id)
            ->with('success', 'Size chart duplicated successfully.');
    }

    public function toggle($id)
    {
        $sizeChart = SizeChart::findOrFail($id);
        $sizeChart->status = $sizeChart->status === 'active' ? 'inactive' : 'active';
        $sizeChart->save();

        return back()->with('success', 'Size chart status updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $sizeChart = SizeChart::withCount('products')->findOrFail($id);

        if ($sizeChart->products_count > 0 && !$request->boolean('force')) {
            return back()->with('error', "This size chart is currently assigned to {$sizeChart->products_count} products.");
        }

        DB::transaction(function () use ($sizeChart, $request) {
            if ($sizeChart->products_count > 0 && $request->boolean('force')) {
                Product::where('size_chart_id', $sizeChart->id)->update(['size_chart_id' => null]);
            }

            if ($sizeChart->image_path && Str::startsWith($sizeChart->image_path, '/storage/')) {
                $relativePath = Str::after($sizeChart->image_path, '/storage/');
                Storage::disk('public')->delete($relativePath);
            }

            $sizeChart->delete();
        });

        return redirect()
            ->route('admin.size-charts')
            ->with('success', 'Size chart deleted successfully.');
    }

    protected function validatePayload(Request $request): array
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|string|in:clothing,shoes,kids,pants,accessories,custom',
            'unit' => 'required|string|in:cm,inch',
            'status' => 'required|string|in:active,inactive,draft',
            'image' => 'nullable|file|image|max:10240',
            'image_url' => 'nullable|string|max:2048',
            'measurement_instructions' => 'nullable|string',
            'columns' => 'required|array|min:1',
            'columns.*.key' => 'required|string|max:100',
            'columns.*.name' => 'required|string|max:100',
            'rows' => 'required|array|min:1',
            'rows.*.key' => 'required|string|max:100',
            'rows.*.label' => 'required|string|max:100',
            'values' => 'nullable|array',
        ]);

        $this->ensureUniqueNames($validated['columns'], 'name', 'Measurement names must be unique.');
        $this->ensureUniqueNames($validated['rows'], 'label', 'Size labels must be unique.');

        return $validated;
    }

    protected function ensureUniqueNames(array $items, string $field, string $message): void
    {
        $normalized = collect($items)
            ->map(function ($item) use ($field) {
                return trim(Str::lower((string) Arr::get($item, $field, '')));
            })
            ->filter()
            ->values();

        if ($normalized->count() !== $normalized->unique()->count()) {
            throw ValidationException::withMessages([
                $field === 'name' ? 'columns' : 'rows' => $message,
            ]);
        }
    }

    protected function syncChartStructure(SizeChart $sizeChart, array $validated): void
    {
        $columnMap = [];
        foreach (array_values($validated['columns']) as $index => $columnData) {
            $column = $sizeChart->columns()->create([
                'name' => trim($columnData['name']),
                'sort_order' => $index,
            ]);
            $columnMap[$columnData['key']] = $column->id;
        }

        foreach (array_values($validated['rows']) as $index => $rowData) {
            $row = $sizeChart->rows()->create([
                'label' => trim($rowData['label']),
                'sort_order' => $index,
            ]);

            $rowValues = Arr::get($validated['values'] ?? [], $rowData['key'], []);
            foreach ($rowValues as $columnKey => $value) {
                $columnId = $columnMap[$columnKey] ?? null;
                if (!$columnId) {
                    continue;
                }

                $row->values()->create([
                    'size_chart_column_id' => $columnId,
                    'value' => is_string($value) ? trim($value) : $value,
                ]);
            }
        }
    }

    protected function payloadFields(array $validated): array
    {
        return Arr::only($validated, [
            'name',
            'description',
            'type',
            'unit',
            'status',
            'measurement_instructions',
        ]);
    }

    protected function resolveImagePath(Request $request, ?string $existingPath): ?string
    {
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('size-charts', 'public');
            return '/storage/' . $path;
        }

        if ($request->filled('image_url')) {
            return trim($request->image_url);
        }

        return $existingPath;
    }

    protected function typeOptions(): array
    {
        return [
            ['value' => 'clothing', 'label' => 'Clothing'],
            ['value' => 'shoes', 'label' => 'Shoes'],
            ['value' => 'kids', 'label' => 'Kids'],
            ['value' => 'pants', 'label' => 'Pants'],
            ['value' => 'accessories', 'label' => 'Accessories'],
            ['value' => 'custom', 'label' => 'Custom'],
        ];
    }

    protected function statusOptions(): array
    {
        return [
            ['value' => 'active', 'label' => 'Active'],
            ['value' => 'inactive', 'label' => 'Inactive'],
            ['value' => 'draft', 'label' => 'Draft'],
        ];
    }

    protected function unitOptions(): array
    {
        return [
            ['value' => 'cm', 'label' => 'cm'],
            ['value' => 'inch', 'label' => 'inch'],
        ];
    }
}
