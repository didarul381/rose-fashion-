# Govaly - Developer Guide

Developer reference for building, testing, formatting, and developing the Govaly Laravel-React-Inertia e-commerce application.

## Development Commands

### Environment Setup
- Install dependencies, copy environment file, generate key, migrate, and build assets:
  ```bash
  composer run setup
  ```

### Run Development Server
- Run Laravel server, queue listener, log tailing, and Vite dev server simultaneously:
  ```bash
  composer run dev
  ```

### Run Tests
- Run full test suite:
  ```bash
  composer run test
  ```
- Run a specific test class:
  ```bash
  php artisan test --filter=TestClassName
  ```

### Code Formatting
- Format PHP code using Laravel Pint:
  ```bash
  vendor/bin/pint
  ```
- Format a specific PHP file:
  ```bash
  vendor/bin/pint path/to/file.php
  ```

## Project Standards & Conventions

### Directory Map
- **Backend Logics**: Controllers are located under `app/Http/Controllers/`. Models are under `app/Models/`.
- **Database Schema**: Migrations are under `database/migrations/`, Seeders in `database/seeders/`.
- **Frontend Source**: React components and pages are located under `resources/js/`.
  - Pages: `resources/js/Pages/` (automatically mapped by Inertia).
  - Reusable Components: `resources/js/Components/`.
  - Layouts: `resources/js/Layouts/`.
  - Contexts (e.g. `CartContext`): `resources/js/Contexts/`.
  - Services (e.g. API clients): `resources/js/Services/`.
- **Styles**: Custom CSS resides in `resources/css/app.css`.

### Backend Guidelines (Laravel)
- **Routes**: Define web/app routes in `routes/web.php`. Use named routes (`->name('route.name')`).
- **Controllers**: Use resource controllers where possible. Return Inertia views:
  ```php
  return Inertia::render('Category/Show', [
      'category' => $category,
  ]);
  ```
- **Validation**: Enforce request validation. Use Laravel Form Requests (`app/Http/Requests/`) or validator arrays inline.
- **Eloquent**: Use Eloquent models and relationship features (e.g., `hasMany`, `belongsTo`) rather than raw SQL where possible. Maintain database-level foreign key constraints in migrations.

### Frontend Guidelines (React/Inertia)
- **Language**: Standard JavaScript (ES6+), React 18. Use `.jsx` file extension for React components and `.js` for vanilla JS modules. No TypeScript.
- **Routing**: Use the Inertia `<Link>` component for client-side navigation. Use the global `route()` helper (provided by Ziggy) to generate URLs, e.g., `route('product.show', { slug: product.slug })`.
- **Styling**: Tailwind CSS classes. Follow responsive design practices and maintain visual coherence. Use custom CSS in `resources/css/app.css` sparingly.
- **State Management**: Utilize Context API (like `CartContext.jsx`) for global frontend states like the shopping cart.
