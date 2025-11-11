<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DepartmentsController;
use App\Http\Controllers\ProjectsController;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    Route::prefix('profile')->group(function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    Route::middleware('role:admin')->group(function() {
        Route::resource('departments', DepartmentsController::class);
        Route::resource('systems', SystemController::class);
    });

    Route::resource('projects', ProjectsController::class);

    // Route::middleware('role:admin')->prefix('departments')->group(function () {
    //     Route::get('/', [DepartmentsController::class,'index'])->name('departments.index');
    //     Route::post('/store', [DepartmentsController::class,'store'])->name('departments.store');
    //     Route::put('/edit/{id}', [DepartmentsController::class,'edit'])->name('departments.edit');
    // });
});


require __DIR__.'/auth.php';
