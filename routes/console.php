<?php

use App\Support\MediaUrl;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('db:restore-sqlite {--seed-demo : Seed demo data after the restore if the database is still empty}', function () {
    $sqlitePath = database_path('database.sqlite');

    if (! file_exists($sqlitePath)) {
        $this->error("SQLite backup not found at {$sqlitePath}.");

        return 1;
    }

    config(['database.connections.sqlite.database' => $sqlitePath]);
    DB::purge('sqlite');
    DB::purge('mysql');

    $sqlite = DB::connection('sqlite');
    $mysql = DB::connection('mysql');

    $tables = collect($sqlite->select("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name"))
        ->pluck('name')
        ->values()
        ->all();

    $this->info('SQLite source tables: ' . implode(', ', $tables));

    $mysql->statement('SET FOREIGN_KEY_CHECKS=0');

    foreach ($tables as $table) {
        if (! Schema::connection('mysql')->hasTable($table)) {
            $this->warn("Skipping missing MySQL table: {$table}");
            continue;
        }

        $count = (int) $sqlite->table($table)->count();
        $this->line("Copying {$table} ({$count} rows)");

        $mysql->table($table)->truncate();

        if ($count === 0) {
            continue;
        }

        $rows = $sqlite->table($table)->get()->map(fn ($row) => (array) $row)->all();

        foreach (array_chunk($rows, 500) as $chunk) {
            $mysql->table($table)->insert($chunk);
        }
    }

    $mysql->statement('SET FOREIGN_KEY_CHECKS=1');

    $summaryTables = ['users', 'categories', 'products', 'orders', 'reviews', 'questions', 'homepage_sections', 'settings'];

    $this->newLine();
    $this->info('Restore summary:');

    foreach ($summaryTables as $table) {
        if (Schema::connection('mysql')->hasTable($table)) {
            $this->line(sprintf(' - %s: %d', $table, $mysql->table($table)->count()));
        }
    }

    if ($this->option('seed-demo')) {
        $productCount = Schema::connection('mysql')->hasTable('products') ? (int) $mysql->table('products')->count() : 0;
        $categoryCount = Schema::connection('mysql')->hasTable('categories') ? (int) $mysql->table('categories')->count() : 0;

        if ($productCount === 0 || $categoryCount === 0) {
            $this->warn('Database still looks empty, so seeding demo data now.');
            $this->call('db:seed', [
                '--class' => \Database\Seeders\DummyDataSeeder::class,
                '--force' => true,
            ]);
        } else {
            $this->info('Demo seed skipped because the restored data is already present.');
        }
    }

    return 0;
})->purpose('Restore MySQL data from database/database.sqlite');

Artisan::command('media:normalize-urls', function () {
    $normalizeArray = function (array $values) use (&$normalizeArray) {
        foreach ($values as $key => $value) {
            if (is_array($value)) {
                $values[$key] = $normalizeArray($value);
                continue;
            }

            if (is_string($value)) {
                $values[$key] = MediaUrl::resolve($value);
            }
        }

        return $values;
    };

    $tableColumns = [
        'categories' => ['image'],
        'product_images' => ['image_path'],
        'product_variants' => ['image_path'],
        'size_charts' => ['image_path'],
        'campaigns' => ['banner_image'],
        'settings' => ['value'],
    ];

    foreach ($tableColumns as $table => $columns) {
        if (! Schema::hasTable($table)) {
            $this->warn("Skipping missing table: {$table}");
            continue;
        }

        foreach (DB::table($table)->get() as $row) {
            $updates = [];

            foreach ($columns as $column) {
                $value = $row->{$column} ?? null;

                if ($table === 'settings' && is_string($value)) {
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $updates[$column] = json_encode($normalizeArray($decoded));
                        continue;
                    }
                }

                if (is_string($value)) {
                    $resolved = MediaUrl::resolve($value);
                    if ($resolved !== $value) {
                        $updates[$column] = $resolved;
                    }
                }
            }

            if (! empty($updates)) {
                DB::table($table)->where('id', $row->id)->update($updates);
            }
        }
    }

    if (Schema::hasTable('homepage_sections')) {
        foreach (DB::table('homepage_sections')->get() as $row) {
            $settings = $row->settings ? json_decode($row->settings, true) : null;

            if (is_array($settings)) {
                $normalized = $normalizeArray($settings);
                if ($normalized !== $settings) {
                    DB::table('homepage_sections')->where('id', $row->id)->update([
                        'settings' => json_encode($normalized),
                    ]);
                }
            }
        }
    }

    $this->info('Media URLs normalized successfully.');
})->purpose('Normalize legacy /storage media URLs stored in the database');
