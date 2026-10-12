# Govaly Project Guidelines & Rules

Rules and instructions for AI coding agents when working on the Govaly project.

## Tech Stack & Architecture
- **Backend**: Laravel framework (v13.x), PHP 8.3+.
- **Frontend**: React 18+ (using standard JavaScript/ES6, `.jsx` for components, no TypeScript).
- **Communication Layer**: Inertia.js for seamless routing and server-side state hydration without REST API overhead.
- **Styling**: Tailwind CSS (configured with Vite and PostCSS/Vite plugins).
- **Database**: SQLite/MySQL (Eloquent ORM).

## Formatting & Code Quality
- **PHP Style**: Follow standard Laravel style guidelines. Always format PHP files with Laravel Pint before completing a task:
  ```bash
  vendor/bin/pint path/to/changed/file.php
  ```
- **JavaScript Style**: Keep code neat, modular, and follow ES6+ standards. Use functional components with hooks.
- **Comments**: Maintain docstrings and comments. Do not delete existing comments unless they are direct, deprecated logic.

## Backend (Laravel) Guidelines
1. **Controllers**: Prefer resource controllers. Keep controllers lean by pushing business logic to services or models. Always return `Inertia::render('PageName', [...])` responses for pages.
2. **Models & Migrations**: Define relationships properly (`hasMany`, `belongsTo`, etc.) in the Eloquent models. Always create migrations for database structure changes and never edit existing migrations that have already been run.
3. **Validation**: Use Request validation. For complex inputs, create Form Request classes (`php artisan make:request`).
4. **Routing**: Declare routes in `routes/web.php` or `routes/api.php`. Use named routes (`->name('name')`) for UI navigation consistency. Group related routes under prefix/middleware blocks.

## Frontend (React/Inertia) Guidelines
1. **Routing / Navigation**: Use the `<Link>` component from `@inertiajs/react` for in-app page transitions. Always resolve URLs using the Ziggy global `route('route.name')` helper.
2. **Components**: Organize reusable pieces in `resources/js/Components/` and layouts in `resources/js/Layouts/`. Pages belong in `resources/js/Pages/`. **User Preference**: Always design UI elements (e.g., Breadcrumbs, Modals, Badges, Cards) modularly as standalone reusable React components rather than inline duplication.
3. **State**: Use Context API (`resources/js/Contexts/`) to manage global state like cart operations (`CartContext.jsx`). Avoid prop-drilling.
4. **Forms**: Use standard Inertia form utilities (`useForm` from `@inertiajs/react`) or React Hook Form (`react-hook-form`) where advanced client validation is required.

## General AI Agent Rules
- **Non-destructive Edits**: Do not break existing features when implementing new ones. Make sure to review files in the context of the entire application.
- **Verification**: Run `composer run test` after any major modification to verify tests are still passing.
- **Paths**: Keep all modified or newly created files strictly within the workspace directory `d:\wamp-3.2.0\www\Govaly`. Do not write temporary code files to system-wide temp folders.
