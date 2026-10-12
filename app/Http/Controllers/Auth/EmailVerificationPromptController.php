<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        $user = $request->user();
        $redirectUrl = $user && $user->role === 'admin'
            ? route('admin.dashboard', absolute: false)
            : route('customer.dashboard', absolute: false);

        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended($redirectUrl)
                    : Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
    }
}
