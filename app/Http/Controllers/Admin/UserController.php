<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a searchable user directory for the admin panel.
     */
    public function users(Request $request)
    {
        $search = trim((string) $request->query('search', ''));
        $role = trim((string) $request->query('role', ''));

        $query = User::query()->withCount('orders');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%")
                    ->orWhere('referral_code', 'like', "%{$search}%");
            });
        }

        if (in_array($role, ['admin', 'customer'], true)) {
            $query->where('role', $role);
        }

        $statsQuery = User::query();

        $users = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
            'stats' => [
                'total_users' => (clone $statsQuery)->count(),
                'admins_count' => (clone $statsQuery)->where('role', 'admin')->count(),
                'customers_count' => (clone $statsQuery)->where('role', 'customer')->count(),
                'verified_count' => (clone $statsQuery)->whereNotNull('email_verified_at')->count(),
            ],
        ]);
    }
}
