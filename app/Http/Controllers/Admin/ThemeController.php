<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Traits\HandlesAdminMedia;
use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ThemeController extends Controller
{
    use HandlesAdminMedia;

    /**
     * Theme & Brand Customizer Page.
     */
    public function themeCustomize()
    {
        $settings = Setting::all()->groupBy('group');

        return Inertia::render('Admin/ThemeCustomize', [
            'settings' => $settings,
        ]);
    }

    /**
     * Save Theme & Brand Customizer settings.
     */
    public function saveThemeCustomize(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($this->normalizeMediaValues($request->settings) as $key => $value) {
            $group = 'theme';
            if (in_array($key, ['theme_name', 'store_logo', 'favicon', 'loader_toggle'])) {
                $group = 'general';
            }
            Setting::set($key, $value, $group);

            if ($key === 'theme_name') {
                Setting::set('store_name', $value, 'general');
            }
            if ($key === 'store_logo') {
                Setting::set('header_logo_image', $value, 'general');
            }
        }

        return redirect()->back()->with('success', 'Theme customizations saved successfully!');
    }
}
