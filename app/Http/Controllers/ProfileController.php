<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\Traits\HandlesAdminMedia;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use HandlesAdminMedia;

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $stats = [
            'total_orders' => $user->orders()->count(),
            'completed_orders' => $user->orders()->whereIn('status', ['delivered', 'completed'])->count(),
            'pending_orders' => $user->orders()->whereIn('status', ['pending', 'processing'])->count(),
            'total_spent' => (float) $user->orders()->whereNotIn('status', ['cancelled', 'failed'])->sum('total'),
            'wallet_balance' => (float) $user->wallet_balance,
            'loyalty_points' => (int) $user->loyalty_points_balance,
        ];

        $recentOrders = $user->orders()
            ->latest()
            ->take(5)
            ->get(['id', 'order_number', 'status', 'total', 'created_at']);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'stats' => $stats,
            'recentOrders' => $recentOrders,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }

        // Handle avatar removal or upload
        if ($request->boolean('remove_avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = null;
        } elseif ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            if ($file->isValid()) {
                if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $user->avatar = $this->storeUploadedImageAsWebp($file, 'avatars');
            }
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
