<?php

use App\Http\Controllers\Admin\ApplicantController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\MembershipPaymentController;
use App\Http\Controllers\Admin\MembershipPlanController;
use App\Http\Controllers\Admin\SupporterController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:super-admin|membership-secretary|batch-representative'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('members', [MemberController::class, 'index'])->name('members.index');
        Route::post('members', [MemberController::class, 'store'])->name('members.store');
        Route::get('members/{member}', [MemberController::class, 'show'])->name('members.show');
        Route::put('members/{member}', [MemberController::class, 'update'])->name('members.update');
        Route::get('applicants', [ApplicantController::class, 'index'])->name('applicants.index');
        Route::post('applicants/{member}/approve', [ApplicantController::class, 'approve'])->name('applicants.approve');
    });

Route::middleware(['auth', 'role:super-admin|content-editor'])
    ->prefix('admin/content')
    ->name('admin.content.')
    ->controller(ContentController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('uploads', 'upload')->name('upload');
        Route::get('{type}', 'show')->name('show');
        Route::put('{type}', 'updateSingle')->name('update-single');
        Route::get('{type}/create', 'create')->name('create');
        Route::post('{type}/entries', 'store')->name('store');
        Route::get('{type}/{entry}/edit', 'edit')->name('edit');
        Route::put('{type}/{entry}', 'update')->name('update');
        Route::delete('{type}/{entry}', 'destroy')->name('destroy');
        Route::post('{type}/{entry}/move', 'move')->name('move');
    });

Route::middleware(['auth', 'role:super-admin|treasurer'])
    ->prefix('admin/supporters')
    ->name('admin.supporters.')
    ->controller(SupporterController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('events/{event}', 'renameEvent')->name('events.update');
        Route::post('contributions/{contribution}/void', 'void')->name('contributions.void');
        Route::get('{supporter}', 'show')->name('show');
        Route::put('{supporter}', 'update')->name('update');
        Route::put('{supporter}/member', 'link')->name('link');
        Route::post('{supporter}/contributions', 'contribute')->name('contribute');
    });

Route::middleware(['auth', 'role:super-admin|treasurer'])
    ->prefix('admin/membership')
    ->name('admin.membership.')
    ->group(function () {
        Route::get('plans', [MembershipPlanController::class, 'index'])->name('plans.index');
        Route::put('plans/{category}', [MembershipPlanController::class, 'update'])->name('plans.update');
        Route::get('payments', [MembershipPaymentController::class, 'index'])->name('payments.index');
        Route::post('payments/{member}', [MembershipPaymentController::class, 'store'])->name('payments.store');
    });

// The earlier address, kept so bookmarks still work.
Route::redirect('admin/sponsors', '/admin/supporters', 301);
