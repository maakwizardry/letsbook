<?php

namespace App\Providers;

use App\Models\Provider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Restricts /log-viewer (opcodesio/log-viewer) to a single admin
        // account rather than opening it to every provider — the package's
        // AuthorizeLogViewer middleware calls Gate::authorize('viewLogViewer')
        // whenever this gate is defined.
        Gate::define('viewLogViewer', function (?Provider $user) {
            return $user?->email === 'fury+provider@yopmail.com';
        });
    }
}
