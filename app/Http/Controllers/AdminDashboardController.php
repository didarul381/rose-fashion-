<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CourierController;
use App\Http\Controllers\Admin\DashboardController;
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

/**
 * Class AdminDashboardController
 *
 * Backward-compatible wrapper. All administrative functionality has been decomposed
 * into dedicated, single-responsibility controllers under App\Http\Controllers\Admin\*.
 *
 * @see DashboardController
 * @see ProductController
 * @see CategoryController
 * @see BrandController
 * @see UnitController
 * @see OrderController
 * @see InvoiceController
 * @see OrderStatusController
 * @see ShippingMethodController
 * @see CourierController
 * @see QuotationRequestController
 * @see PageBuilderController
 * @see PageController
 * @see ThemeController
 * @see SettingController
 * @see PromotionController
 * @see ReviewController
 * @see MarketingController
 * @see UserController
 */
class AdminDashboardController extends DashboardController {}
