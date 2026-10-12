<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('status')->default('active');
            $table->integer('sort_order')->default(0);
            $table->boolean('show_in_footer')->default(true);
            $table->timestamps();
        });

        $defaultPages = [
            [
                'title' => 'Return & Refund Policy',
                'slug' => Str::slug('Return & Refund Policy'),
                'excerpt' => 'Learn how returns and refunds are handled for eligible orders.',
                'content' => '<h2>Return & Refund Policy</h2><p>Update this page from the admin panel with your final policy text.</p>',
                'meta_title' => 'Return & Refund Policy',
                'meta_description' => 'Review the store return and refund policy.',
                'status' => 'active',
                'sort_order' => 1,
                'show_in_footer' => true,
            ],
            [
                'title' => 'Exchange Policy',
                'slug' => Str::slug('Exchange Policy'),
                'excerpt' => 'Read the exchange rules before requesting a swap.',
                'content' => '<h2>Exchange Policy</h2><p>Update this page from the admin panel with your final policy text.</p>',
                'meta_title' => 'Exchange Policy',
                'meta_description' => 'Review the store exchange policy.',
                'status' => 'active',
                'sort_order' => 2,
                'show_in_footer' => true,
            ],
            [
                'title' => 'Shipping & Delivery Policy',
                'slug' => Str::slug('Shipping & Delivery Policy'),
                'excerpt' => 'See how delivery charges, timing, and shipping work.',
                'content' => '<h2>Shipping & Delivery Policy</h2><p>Update this page from the admin panel with your final policy text.</p>',
                'meta_title' => 'Shipping & Delivery Policy',
                'meta_description' => 'Review the store shipping and delivery policy.',
                'status' => 'active',
                'sort_order' => 3,
                'show_in_footer' => true,
            ],
            [
                'title' => 'Cancellation Policy',
                'slug' => Str::slug('Cancellation Policy'),
                'excerpt' => 'Understand order cancellation windows and rules.',
                'content' => '<h2>Cancellation Policy</h2><p>Update this page from the admin panel with your final policy text.</p>',
                'meta_title' => 'Cancellation Policy',
                'meta_description' => 'Review the store cancellation policy.',
                'status' => 'active',
                'sort_order' => 4,
                'show_in_footer' => true,
            ],
            [
                'title' => 'Privacy Policy',
                'slug' => Str::slug('Privacy Policy'),
                'excerpt' => 'Find out how customer data is collected and used.',
                'content' => '<h2>Privacy Policy</h2><p>Update this page from the admin panel with your final policy text.</p>',
                'meta_title' => 'Privacy Policy',
                'meta_description' => 'Review the store privacy policy.',
                'status' => 'active',
                'sort_order' => 5,
                'show_in_footer' => true,
            ],
            [
                'title' => 'Terms & Conditions',
                'slug' => Str::slug('Terms & Conditions'),
                'excerpt' => 'Read the terms that apply when using the store.',
                'content' => '<h2>Terms & Conditions</h2><p>Update this page from the admin panel with your final policy text.</p>',
                'meta_title' => 'Terms & Conditions',
                'meta_description' => 'Review the store terms and conditions.',
                'status' => 'active',
                'sort_order' => 6,
                'show_in_footer' => true,
            ],
        ];

        DB::table('pages')->insert(array_map(function (array $page) {
            return array_merge($page, [
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }, $defaultPages));
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
    }
};
