<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $redirectUrl = $user && $user->role === 'admin'
            ? route('admin.dashboard', absolute: false)
            : route('customer.dashboard', absolute: false);

        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended($redirectUrl);
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }
}
