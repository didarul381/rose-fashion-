<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    /**
     * Review moderation index.
     */
    public function reviews(Request $request)
    {
        $query = Review::with(['product', 'user'])->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            if ($request->status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_approved', false);
            }
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $reviews = $query->paginate(15)->withQueryString();
        $products = Product::orderBy('name')->get(['id', 'name']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Admin/Reviews', [
            'reviews' => $reviews,
            'products' => $products,
            'users' => $users,
            'filters' => $request->only(['search', 'status', 'product_id']),
        ]);
    }

    /**
     * Save or update a review.
     */
    public function saveReview(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'user_id' => 'required|exists:users,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'is_approved' => 'nullable|boolean',
        ]);

        $reviewData = [
            'product_id' => $request->product_id,
            'user_id' => $request->user_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'is_approved' => $request->boolean('is_approved'),
        ];

        Review::updateOrCreate(
            ['id' => $request->id],
            $reviewData
        );

        return back()->with('success', 'Review saved successfully.');
    }

    /**
     * Approve or reject a review.
     */
    public function toggleReviewApproval(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $review->is_approved = $request->has('is_approved') ? $request->boolean('is_approved') : ! $review->is_approved;
        $review->save();

        return back()->with('success', 'Review moderation status updated.');
    }

    /**
     * Delete a review.
     */
    public function deleteReview($id)
    {
        Review::findOrFail($id)->delete();

        return back()->with('success', 'Review deleted successfully.');
    }
}
