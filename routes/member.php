<?php

use App\Http\Controllers\Member\MyMembershipController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->controller(MyMembershipController::class)->group(function () {
    Route::get('my-membership', 'show')->name('my-membership');
    Route::post('my-membership/apply', 'apply')->name('my-membership.apply');
    Route::put('my-membership', 'update')->name('my-membership.update');
    // Five tries a minute: the claim form must not be usable to guess who is a member.
    Route::post('my-membership/claim', 'claim')->middleware('throttle:5,1')->name('my-membership.claim');
});

// The old address, kept so existing links still work.
Route::redirect('apply', 'my-membership', 301);
