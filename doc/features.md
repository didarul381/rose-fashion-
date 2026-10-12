# Govaly - Project Features

Detailed breakdown of the existing features in the Govaly Laravel-React-Inertia e-commerce application.

---

## 1. User Authentication & Profile Management
* **Breeze Authentication**: Includes full registration, login, password recovery, and email verification. (See [routes/auth.php](file:///d:/wamp-3.2.0/www/Govaly/routes/auth.php))
* **Role-Based Access**: Middleware routing separates Admin dashboard areas from regular Customer dashboard pages.
* **Customer Dashboard**: Displays order histories, wallet details, and loyalty status. (See [CustomerDashboardController.php](file:///d:/wamp-3.2.0/www/Govaly/app/Http/Controllers/CustomerDashboardController.php))

---

## 2. Product Catalog & Inventory
* **Attributes & Variants System**: Supports complex variant configurations (sizes, colors, custom values). (See [ProductVariant.php](file:///d:/wamp-3.2.0/www/Govaly/app/Models/ProductVariant.php))
* **Multiple Images / Gallery**: Product detail pages support image gallery sliders.
* **Categories & Slug-Based Routing**: Clean URLs for categories and individual products.

---

## 3. Shopping Cart & Checkout Flow
* **Interactive Frontend Cart**: Powered by React Context for state synchronization. (See [CartContext.jsx](file:///d:/wamp-3.2.0/www/Govaly/resources/js/Contexts/CartContext.jsx))
* **Calculated Shipping**: Dynamic pricing calculations depending on courier configurations (e.g., inside vs. outside Dhaka).
* **Payment Gateways**:
  * **bKash Payment Integration**: Automated digital payment callback handler.
  * **Cash on Delivery (COD)**.
  * **Customer Wallet balance payment**.
  * (See [CheckoutController.php](file:///d:/wamp-3.2.0/www/Govaly/app/Http/Controllers/CheckoutController.php))

---

## 4. Loyalty, Wallet & Referrals
* **Loyalty Points Engine**: Accumulates points on order actions that customers can track and redeem. (See [LoyaltyPoint.php](file:///d:/wamp-3.2.0/www/Govaly/app/Models/LoyaltyPoint.php))
* **Digital Wallet**: Supports manual deposits, balance tracking, and transactions. (See [WalletTransaction.php](file:///d:/wamp-3.2.0/www/Govaly/app/Models/WalletTransaction.php))
* **Referral Tracking**: Simple affiliate/referral link mechanism for rewards.

---

## 5. Coupon & Discount Engine
* **Flexible Coupon Configuration**: Supports fixed/percentage values, expiration timelines, minimum order amounts, and usage caps. (See [Coupon.php](file:///d:/wamp-3.2.0/www/Govaly/app/Models/Coupon.php))
* **Flash Sales & Campaigns**: Time-limited promo pricing tags for specific products. (See [FlashSale.php](file:///d:/wamp-3.2.0/www/Govaly/app/Models/FlashSale.php))

---

## 6. Courier & Order Logistics (Admin Panel)
* **Logistics Integrations**: Integrated with delivery networks (includes built-in API support for **Steadfast Courier** in Bangladesh). (See [AdminDashboardController.php](file:///d:/wamp-3.2.0/www/Govaly/app/Http/Controllers/AdminDashboardController.php#L769-L858))
* **Bulk Operations**: Bulk dispatch to couriers, status updates, and admin user assignments.
* **Invoice Suite**: Configuration of custom layout fields and generation of individual or bulk printable invoices.

---

## 7. Marketing Suite
* **SMS Broadcast**: Send SMS directly to customers.
* **Email Campaigns**: Admin suite to compose and dispatch bulk promotional emails.
* **Push Notifications**: Web push campaigns targeted directly to customers.

---

## 8. Homepage Builder & CMS (Content Management)
* **Dynamic Homepage Sections**: Section builder supporting banners, campaigns, and grids. (See [HomepageSection.php](file:///d:/wamp-3.2.0/www/Govaly/app/Models/HomepageSection.php))
* **Brand Customizer**: Custom logo uploads, color schemes, and brand aesthetics.
