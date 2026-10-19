<?php

use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CourierController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\MarketingController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\OrderStatusController;
use App\Http\Controllers\Admin\PageBuilderController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\QuotationRequestController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ShippingMethodController;
use App\Http\Controllers\Admin\ThemeController;
use App\Http\Controllers\Admin\UnitController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CustomerDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\SizeChartController;
use App\Http\Controllers\TrackingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Shop Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [ShopController::class, 'index'])->name('home');
Route::get('/main-categories', [ShopController::class, 'mainCategories'])->name('categories.index');
Route::get('/shop-by-brands', [ShopController::class, 'brands'])->name('brands.index');
Route::get('/shop', [ShopController::class, 'shop'])->name('shop.index');
Route::get('/compare', [ShopController::class, 'compare'])->name('compare.index');
Route::get('/category/{slug}', [ShopController::class, 'category'])->name('category.show');
Route::redirect('/collections', '/main-categories');
Route::redirect('/jamdani', '/category/jamdani');
Route::redirect('/lehengas', '/category/lehengas');
Route::get('/product/{slug}', [ShopController::class, 'product'])->name('product.show');
Route::get('/page/{slug}', [ShopController::class, 'page'])->name('page.show');
Route::get('/api/search', [ShopController::class, 'search'])->name('api.search');
Route::get('/track-order', [CustomerDashboardController::class, 'track'])->name('track-order');
Route::get('/quotation-request', [ShopController::class, 'quotationRequest'])->name('quotation.request');
Route::post('/quotation-request', [ShopController::class, 'storeQuotationRequest'])->name('quotation.store');
Route::get('/campaigns', [ShopController::class, 'campaigns'])->name('campaigns.index');
Route::get('/campaign/{slug}', [ShopController::class, 'campaign'])->name('shop.campaign');
Route::get('/cart', fn () => Inertia::render('Shop/Cart'))->name('cart.index');

/*
|--------------------------------------------------------------------------
| AJAX Cart & Discount Engine Routes
|--------------------------------------------------------------------------
*/
Route::post('/api/cart/apply-coupon', [CartController::class, 'applyCoupon'])->name('api.cart.coupon');
Route::post('/api/cart/shipping', [CartController::class, 'calculateShipping'])->name('api.cart.shipping');
Route::post('/api/tracking/event', [TrackingController::class, 'trackEvent'])->name('api.tracking.event');

/*
|--------------------------------------------------------------------------
| Checkout Flow Routes
|--------------------------------------------------------------------------
*/
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/place-order', [CheckoutController::class, 'placeOrder'])->name('checkout.place');
Route::get('/checkout/success/{orderNumber}', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/bkash/callback', [CheckoutController::class, 'bkashCallback'])->name('bkash.callback');

/*
|--------------------------------------------------------------------------
| Customer Dashboard Routes (Auth Protected)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->get('/dashboard', [CustomerDashboardController::class, 'index'])->name('dashboard');
Route::middleware(['auth'])->prefix('customer')->group(function () {
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])->name('customer.dashboard');
    Route::get('/orders', [CustomerDashboardController::class, 'orders'])->name('customer.orders');
    Route::get('/orders/{orderNumber}', [CustomerDashboardController::class, 'viewOrder'])->name('customer.order-view');
    Route::post('/wallet/deposit', [CustomerDashboardController::class, 'walletDeposit'])->name('customer.wallet-deposit');

    // Reviews & Q&A submissions
    Route::post('/product/{productId}/review', [ShopController::class, 'addReview'])->name('product.review.submit');
    Route::post('/product/{productId}/question', [ShopController::class, 'addQuestion'])->name('product.question.submit');
});

/*
|--------------------------------------------------------------------------
| Admin Panel Routes (Auth + Admin Protected)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // Products Management
    Route::get('/products', [ProductController::class, 'products'])->name('admin.products');
    Route::post('/products/save', [ProductController::class, 'saveProduct'])->name('admin.products.save');
    Route::delete('/products/bulk-delete', [ProductController::class, 'bulkDeleteProducts'])->name('admin.products.bulk-delete');
    Route::delete('/products/{id}', [ProductController::class, 'deleteProduct'])->name('admin.products.delete');

    // Categories Management
    Route::get('/categories', [CategoryController::class, 'categories'])->name('admin.categories');
    Route::post('/categories/save', [CategoryController::class, 'saveCategory'])->name('admin.categories.save');
    Route::delete('/categories/bulk-delete', [CategoryController::class, 'bulkDeleteCategories'])->name('admin.categories.bulk-delete');
    Route::delete('/categories/{id}', [CategoryController::class, 'deleteCategory'])->name('admin.categories.delete');

    // Brands Management
    Route::get('/brands', [BrandController::class, 'brands'])->name('admin.brands');
    Route::post('/brands/save', [BrandController::class, 'saveBrand'])->name('admin.brands.save');
    Route::delete('/brands/bulk-delete', [BrandController::class, 'bulkDeleteBrands'])->name('admin.brands.bulk-delete');
    Route::delete('/brands/{id}', [BrandController::class, 'deleteBrand'])->name('admin.brands.delete');

    // Product Unit Management
    Route::get('/price-units', [UnitController::class, 'priceUnits'])->name('admin.price-units');
    Route::post('/price-units/save', [UnitController::class, 'savePriceUnit'])->name('admin.price-units.save');
    Route::delete('/price-units/{id}', [UnitController::class, 'deletePriceUnit'])->name('admin.price-units.delete')->whereNumber('id');
    Route::get('/weight-units', [UnitController::class, 'weightUnits'])->name('admin.weight-units');
    Route::post('/weight-units/save', [UnitController::class, 'saveWeightUnit'])->name('admin.weight-units.save');
    Route::delete('/weight-units/{id}', [UnitController::class, 'deleteWeightUnit'])->name('admin.weight-units.delete')->whereNumber('id');

    // Size Charts Management
    Route::get('/size-charts', [SizeChartController::class, 'index'])->name('admin.size-charts');
    Route::get('/size-charts/create', [SizeChartController::class, 'create'])->name('admin.size-charts.create');
    Route::get('/size-charts/{id}/edit', [SizeChartController::class, 'edit'])->name('admin.size-charts.edit')->whereNumber('id');
    Route::post('/size-charts', [SizeChartController::class, 'store'])->name('admin.size-charts.store');
    Route::put('/size-charts/{id}', [SizeChartController::class, 'update'])->name('admin.size-charts.update')->whereNumber('id');
    Route::post('/size-charts/{id}/duplicate', [SizeChartController::class, 'duplicate'])->name('admin.size-charts.duplicate')->whereNumber('id');
    Route::post('/size-charts/{id}/toggle', [SizeChartController::class, 'toggle'])->name('admin.size-charts.toggle')->whereNumber('id');
    Route::delete('/size-charts/{id}', [SizeChartController::class, 'destroy'])->name('admin.size-charts.delete')->whereNumber('id');

    // Orders Management
    Route::get('/orders', [OrderController::class, 'orders'])->name('admin.orders');
    Route::post('/orders/bulk-update-status', [OrderController::class, 'bulkUpdateStatus'])->name('admin.orders.bulk-update-status');
    Route::post('/orders/send-to-courier', [OrderController::class, 'sendToCourier'])->name('admin.orders.send-to-courier');
    Route::post('/orders/bulk-assign-user', [OrderController::class, 'bulkAssignUser'])->name('admin.orders.bulk-assign-user');
    Route::get('/quotation-requests', [QuotationRequestController::class, 'quotationRequests'])->name('admin.quotation-requests');
    Route::get('/quotation-requests/{id}/edit', [QuotationRequestController::class, 'editQuotationRequest'])->name('admin.quotation-requests.edit')->whereNumber('id');
    Route::get('/quotation-requests/{id}/download', [QuotationRequestController::class, 'downloadQuotationRequest'])->name('admin.quotation-requests.download')->whereNumber('id');
    Route::post('/quotation-requests/{id}', [QuotationRequestController::class, 'updateQuotationRequest'])->name('admin.quotation-requests.update')->whereNumber('id');
    Route::delete('/quotation-requests/{id}', [QuotationRequestController::class, 'deleteQuotationRequest'])->name('admin.quotation-requests.delete')->whereNumber('id');

    // Users Management
    Route::get('/users', [UserController::class, 'users'])->name('admin.users');

    // Invoices Settings & Printing
    Route::get('/invoices', [InvoiceController::class, 'invoices'])->name('admin.invoices');
    Route::post('/invoices/settings', [InvoiceController::class, 'saveInvoiceSettings'])->name('admin.invoices.settings.save');
    Route::get('/orders/bulk-invoice', [InvoiceController::class, 'printBulkInvoice'])->name('admin.orders.bulk-invoice');
    Route::get('/orders/{id}', [OrderController::class, 'showOrder'])->name('admin.orders.show')->whereNumber('id');
    Route::post('/orders/{id}/update', [OrderController::class, 'updateOrder'])->name('admin.orders.update')->whereNumber('id');
    Route::post('/orders/{id}/items', [OrderController::class, 'storeOrderItem'])->name('admin.orders.items.store')->whereNumber('id');
    Route::post('/orders/{id}/notes', [OrderController::class, 'storeOrderNote'])->name('admin.orders.notes.store')->whereNumber('id');
    Route::get('/orders/{id}/invoice', [InvoiceController::class, 'printInvoice'])->name('admin.orders.invoice');

    // Order Statuses Management
    Route::get('/order-statuses', [OrderStatusController::class, 'orderStatuses'])->name('admin.order-statuses');
    Route::post('/order-statuses/save', [OrderStatusController::class, 'saveOrderStatus'])->name('admin.order-statuses.save');
    Route::delete('/order-statuses/{id}', [OrderStatusController::class, 'deleteOrderStatus'])->name('admin.order-statuses.delete');

    // Shipping Methods Management
    Route::get('/shipping-methods', [ShippingMethodController::class, 'shippingMethods'])->name('admin.shipping-methods');
    Route::post('/shipping-methods/save', [ShippingMethodController::class, 'saveShippingMethod'])->name('admin.shipping-methods.save');
    Route::delete('/shipping-methods/{id}', [ShippingMethodController::class, 'deleteShippingMethod'])->name('admin.shipping-methods.delete');

    // Couriers Management
    Route::get('/couriers', [CourierController::class, 'couriers'])->name('admin.couriers');
    Route::post('/couriers/save', [CourierController::class, 'saveCourier'])->name('admin.couriers.save');
    Route::delete('/couriers/{id}', [CourierController::class, 'deleteCourier'])->name('admin.couriers.delete');

    // Homepage Builder & Configs
    Route::get('/page-builder', [PageBuilderController::class, 'pageBuilder'])->name('admin.page-builder');
    Route::post('/page-builder/section', [PageBuilderController::class, 'addSection'])->name('admin.page-builder.add');
    Route::post('/page-builder/section/{id}', [PageBuilderController::class, 'updateSection'])->name('admin.page-builder.update');
    Route::post('/page-builder/upload-image', [PageBuilderController::class, 'uploadSectionImage'])->name('admin.page-builder.upload-image');
    Route::delete('/page-builder/section/{id}', [PageBuilderController::class, 'deleteSection'])->name('admin.page-builder.delete');

    // Dynamic Pages Management
    Route::get('/pages', [PageController::class, 'pages'])->name('admin.pages');
    Route::post('/pages/save', [PageController::class, 'savePage'])->name('admin.pages.save');
    Route::delete('/pages/{id}', [PageController::class, 'deletePage'])->name('admin.pages.delete');

    // Theme & Brand Customizer Settings
    Route::get('/theme-customize', [ThemeController::class, 'themeCustomize'])->name('admin.theme-customize');
    Route::post('/theme-customize/save', [ThemeController::class, 'saveThemeCustomize'])->name('admin.theme-customize.save');

    // Reviews Moderation
    Route::get('/reviews', [ReviewController::class, 'reviews'])->name('admin.reviews');
    Route::post('/reviews/save', [ReviewController::class, 'saveReview'])->name('admin.reviews.save');
    Route::post('/reviews/{id}/approve', [ReviewController::class, 'toggleReviewApproval'])->name('admin.reviews.approve');
    Route::delete('/reviews/{id}', [ReviewController::class, 'deleteReview'])->name('admin.reviews.delete');

    // General Settings
    Route::get('/settings', [SettingController::class, 'settings'])->name('admin.settings');
    Route::post('/settings/save', [SettingController::class, 'saveSettings'])->name('admin.settings.save');
    Route::post('/settings/sitemap', [SettingController::class, 'generateSitemap'])->name('admin.settings.sitemap');

    // Payment Methods Settings
    Route::get('/payment-methods', [SettingController::class, 'paymentMethods'])->name('admin.payment-methods');
    Route::post('/payment-methods/save', [SettingController::class, 'savePaymentMethods'])->name('admin.payment-methods.save');

    // Coupon Management Settings
    Route::get('/coupons', [PromotionController::class, 'coupons'])->name('admin.coupons');
    Route::post('/coupons/save', [PromotionController::class, 'saveCoupon'])->name('admin.coupons.save');
    Route::delete('/coupons/{id}', [PromotionController::class, 'deleteCoupon'])->name('admin.coupons.delete');

    // Flash Sales Settings
    Route::get('/flash-sales', [PromotionController::class, 'flashSales'])->name('admin.flash-sales');
    Route::post('/flash-sales/save', [PromotionController::class, 'saveFlashSale'])->name('admin.flash-sales.save');
    Route::delete('/flash-sales/{id}', [PromotionController::class, 'deleteFlashSale'])->name('admin.flash-sales.delete');

    // Campaigns Settings
    Route::get('/campaigns', [PromotionController::class, 'campaigns'])->name('admin.campaigns');
    Route::post('/campaigns/save', [PromotionController::class, 'saveCampaign'])->name('admin.campaigns.save');
    Route::delete('/campaigns/{id}', [PromotionController::class, 'deleteCampaign'])->name('admin.campaigns.delete');

    // Marketing Suite (Email, SMS, Push config & dispatch)
    Route::get('/marketing', [MarketingController::class, 'marketing'])->name('admin.marketing');
    Route::get('/marketing/integrations/{integration}', [MarketingController::class, 'marketingIntegration'])->name('admin.marketing.integrations.show');
    Route::post('/marketing/integrations/{integration}', [MarketingController::class, 'saveMarketingIntegration'])->name('admin.marketing.integrations.save');
    Route::post('/marketing/integrations/{integration}/toggle', [MarketingController::class, 'toggleMarketingIntegration'])->name('admin.marketing.integrations.toggle');
    Route::post('/marketing/integrations/{integration}/test', [MarketingController::class, 'testMarketingIntegration'])->name('admin.marketing.integrations.test');
    Route::post('/marketing/email/send', [MarketingController::class, 'sendEmailCampaign'])->name('admin.marketing.email.send');
    Route::post('/marketing/sms/send', [MarketingController::class, 'sendSMSCampaign'])->name('admin.marketing.sms.send');
    Route::post('/marketing/push/send', [MarketingController::class, 'sendPushCampaign'])->name('admin.marketing.push.send');
    Route::post('/marketing/settings/save', [MarketingController::class, 'saveMarketingSettings'])->name('admin.marketing.settings.save');
});

/*
|--------------------------------------------------------------------------
| Breeze Auth & Account Profile Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['patch', 'post'], '/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
