<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuotationRequest;
use App\Services\QuotationPdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuotationRequestController extends Controller
{
    /**
     * Quotation requests list.
     */
    public function quotationRequests(Request $request)
    {
        $query = QuotationRequest::orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($searchQuery) use ($search) {
                $searchQuery->where('name', 'like', '%'.$search.'%')
                    ->orWhere('company', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('phone', 'like', '%'.$search.'%')
                    ->orWhere('address', 'like', '%'.$search.'%')
                    ->orWhere('product_name', 'like', '%'.$search.'%')
                    ->orWhere('products', 'like', '%'.$search.'%');
            });
        }

        return Inertia::render('Admin/QuotationRequests', [
            'quotationRequests' => $query->paginate(12)->withQueryString(),
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Edit quotation request.
     */
    public function editQuotationRequest($id)
    {
        return Inertia::render('Admin/QuotationRequestEdit', [
            'quotationRequest' => QuotationRequest::findOrFail($id),
        ]);
    }

    /**
     * Update quotation request details.
     */
    public function updateQuotationRequest(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'address' => 'nullable|string|max:255',
            'product_name' => 'nullable|string|max:1000',
            'quantity' => 'nullable|integer|min:1|max:999999',
            'price' => 'nullable|numeric|min:0|max:999999999.99',
            'product_description' => 'nullable|string|max:5000',
            'delivery_time' => 'nullable|string|max:255',
            'advance_payment' => 'nullable|string|max:255',
            'at_delivery_payment' => 'nullable|string|max:255',
            'brand_preference' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
            'status' => 'required|string|in:pending,processing,quoted,closed',
            'admin_notes' => 'nullable|string|max:5000',
        ]);

        $quotationRequest = QuotationRequest::findOrFail($id);
        $quotationRequest->update($validated);

        return redirect()->back()->with('success', 'Quotation request updated.');
    }

    /**
     * Download quotation request PDF.
     */
    public function downloadQuotationRequest($id, QuotationPdf $quotationPdf)
    {
        $quotationRequest = QuotationRequest::findOrFail($id);
        $fileName = 'quotation-'.$quotationRequest->id.'-'.now()->format('Ymd-His').'.pdf';

        return response($quotationPdf->make($quotationRequest), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
        ]);
    }

    /**
     * Delete quotation request.
     */
    public function deleteQuotationRequest($id)
    {
        QuotationRequest::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Quotation request deleted.');
    }
}
