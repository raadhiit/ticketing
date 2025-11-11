<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\departments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\DepartmentsRequest;

class DepartmentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $r)
    {
        $q = trim((string) $r->get('q', ''));
        $sort = $r->get('sort', 'name');
        $direction = $r->get('direction', 'asc');

        $departments = departments::query()
            ->when(
                $q !== '',
                fn($qb) =>
                $qb->where('name', 'like', "%{$q}%")
            )
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString()
            ->through(fn(departments $d) => [
                'id'         => $d->id,
                'name'       => $d->name,
                'created_at' => $d->created_at?->format('Y-m-d'),
            ]);

        return Inertia::render('departments/page', [
            'departments' => $departments,
            'filters'     => ['q' => $q, 'sort' => $sort, 'direction' => $direction],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DepartmentsRequest $request)
    {
        try{
            DB::transaction(function () use ($request) {
                departments::create($request->validated());
            });

            return redirect()->route('departments.index')->with('toast', [
                'type' => 'success',
            ]);
        } catch (\Throwable $th) {
            return redirect()->route('departments.index')->withInput()->with('toast', [
                'type' => 'error',
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(departments $departments)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DepartmentsRequest $request, departments $departments)
    {

        // 
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(DepartmentsRequest $request, departments $department)
    {
        try {
            DB::transaction(fn() => $department->update($request->validated()));

            return redirect()
                ->route('departments.index')
                ->with('toast', ['type' => 'success']);
        } catch (\Throwable $th) {
            if ($request->wantsJson()) {
                return response()->json([
                    'ok' => false, 
                    'message' => 'Gagal mengupdate data'
                ], 500);
            }
            return back()->withInput()->with('toast', ['type' => 'error']);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, departments $department)
    {
        $force = $request->boolean('force');

        try {
            DB::transaction(function () use ($department, $force) {
                // Soft delete (default). Jika ?force=1 dan model pakai SoftDeletes → forceDelete
                if ($force && in_array(\Illuminate\Database\Eloquent\SoftDeletes::class, class_uses_recursive($department))) {
                    $department->forceDelete();
                } else {
                    $department->delete();
                }
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'ok'      => true,
                    'message' => $force ? 'Department permanently deleted' : 'Department deleted',
                ], 200);
            }

            return redirect()
                ->route('departments.index')
                ->with('toast', [
                    'type'    => 'success',
                ]);
        } catch (\Throwable $th) {
            if ($request->wantsJson()) {
                return response()->json(['ok' => false, 'message' => 'Gagal menghapus data'], 500);
            }
            return back()->with('toast', ['type' => 'error', 'message' => 'Gagal menghapus data']);
        }
    }
}
