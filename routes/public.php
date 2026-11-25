<?php

use App\Http\Controllers\Public\PageController;
use Illuminate\Support\Facades\Route;

Route::controller(PageController::class)->group(function () {
    Route::get('/', 'home')->name('home');
    Route::get('college/history', 'history')->name('college.history');
    Route::get('college/principals', 'principals')->name('college.principals');
    Route::get('association/goals', 'goals')->name('association.goals');
    Route::get('association/office-bearers', 'officeBearers')->name('association.office-bearers');
    Route::get('membership', 'membership')->name('membership');
    Route::get('projects', 'projects')->name('projects');
    Route::get('projects/sponsors', 'sponsors')->name('projects.sponsors');
    Route::get('projects/donors', 'donors')->name('projects.donors');
    Route::get('projects/{project}', 'project')->whereUlid('project')->name('projects.show');
    Route::get('news', 'news')->name('news');
    Route::get('news/{item}', 'newsItem')->whereUlid('item')->name('news.show');
    Route::get('contact', 'contact')->name('contact');
});
