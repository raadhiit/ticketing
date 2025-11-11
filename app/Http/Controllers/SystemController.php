<?php

namespace App\Http\Controllers;

use Throwable;
use Inertia\Inertia;
use App\Models\system;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\SystemRequest;
use Illuminate\Database\Eloquent\SoftDeletes;

class SystemController extends Controller
{
    public function index(Request $request) {
        $q = trim((string) $request->get('q', ''));
        $sort = $request->get('sort', 'name');
        $direction = $request->get('direction', 'asc');

        $systems = system::when(
            $q !== '',
            fn($qb) => $qb->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            })
        )
        ->orderBy($sort, $direction)
        ->paginate(10)
        ->withQueryString()
        ->through(fn(system $s) => [
            'id'         => $s->id,
            'name'       => $s->name,
            'code'       => $s->code,
            'created_at' => $s->created_at?->format('Y-m-d'), 
        ]);

        return Inertia::render('systems/page', [
            'systems' => $systems,
            'filters' => ['q' => $q, 'sort' => $sort, 'direction' => $direction],
        ]);
    }

    public function store(SystemRequest $request) {
        try{
            DB::transaction(function () use ($request) {
                system::create($request->validated());
            });

            return redirect()->route('systems.index')->with('toast', [
                'type' => 'success',
            ]);

        } catch (Throwable $th) {
            return redirect()->route('systems.index')->with('toast', [
                'type' => 'error',
            ]);
        }
    }

    public function update(system $system, SystemRequest $request) {
        try {
            DB::transaction(fn() => $system->update($request->validated()));

            return redirect()->route('systems.index')->with('toast', [
                'type' => 'success',
            ]);

        }catch(Throwable $th) {
            return redirect()->route('systems.index')->with('toast', [
                'type' => 'error',
            ]);
        }
    }

    public function destroy(Request $request, system $system) {
        $force = $request->boolean('force');

        try {
            DB::transaction(function() use ($system, $force) {
                if ( $force && in_array(SoftDeletes::class, class_uses_recursive($system))) {
                    $system->forceDelete();
                } else {
                    $system->delete();
                }
            });

            return redirect()->route('systems.index')->with('toast', [
                'type' => 'success',
            ]);
        }catch (Throwable $th) {
            return back()->with('toast', [
                'type' => 'error',
            ]);
        }
    }

}

