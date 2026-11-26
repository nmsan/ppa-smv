<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

require __DIR__.'/public.php';

Route::middleware(['auth', 'admin-portal'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/member.php';
require __DIR__.'/admin.php';
require __DIR__.'/auth.php';
