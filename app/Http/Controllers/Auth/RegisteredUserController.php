<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendAdminAlertEmail;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+() -]{7,20}$/'],
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ]);

        $user = User::create([
            'name' => $request->name,
            'phone' => trim($request->phone),
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Process referral logic
        if ($request->filled('referral_code')) {
            $referrer = User::where('referral_code', $request->referral_code)->first();
            if ($referrer) {
                \App\Models\Referral::create([
                    'referrer_id' => $referrer->id,
                    'referred_id' => $user->id,
                    'commission_amount' => 50.00,
                    'status' => 'completed'
                ]);

                \App\Models\WalletTransaction::create([
                    'user_id' => $referrer->id,
                    'amount' => 50.00,
                    'type' => 'deposit',
                    'description' => 'Referral reward bonus for inviting ' . $user->name
                ]);
            }
        }

        event(new Registered($user));

        try {
            SendAdminAlertEmail::dispatch('register', ['user_id' => $user->id])->afterResponse();
        } catch (\Throwable $e) {
            report($e);
        }

        Auth::login($user);

        return redirect(route('customer.dashboard', absolute: false));
    }
}
