<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrderStatusController extends Controller
{
    /**
     * Order Statuses List CRUD page.
     */
    public function orderStatuses()
    {
        $statuses = OrderStatus::orderBy('sort_order')->get();

        return Inertia::render('Admin/OrderStatuses', [
            'statuses' => $statuses,
        ]);
    }

    /**
     * Store or update an order status.
     */
    public function saveOrderStatus(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
            'sort_order' => 'required|integer',
            'is_default' => 'nullable|boolean',
        ]);

        $slug = Str::slug($request->name);

        if ($request->is_default) {
            OrderStatus::where('is_default', true)->update(['is_default' => false]);
        }

        OrderStatus::updateOrCreate(
            ['id' => $request->id],
            [
                'name' => $request->name,
                'slug' => $request->id ? OrderStatus::find($request->id)->slug : $slug,
                'color' => $request->color ?? '#6b7280',
                'sort_order' => $request->sort_order,
                'is_default' => $request->is_default ?? false,
            ]
        );

        return redirect()->back()->with('success', 'Order status saved successfully!');
    }

    /**
     * Delete an order status.
     */
    public function deleteOrderStatus($id)
    {
        $status = OrderStatus::findOrFail($id);

        // Prevent deleting default status
        if ($status->is_default) {
            return redirect()->back()->with('error', 'Cannot delete default order status.');
        }

        $status->delete();

        return redirect()->back()->with('success', 'Order status deleted successfully!');
    }
}
