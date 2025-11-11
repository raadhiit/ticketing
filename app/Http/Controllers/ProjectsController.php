<?php

namespace App\Http\Controllers;

use Throwable;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\system;
use App\Models\projects;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\ProjectRequest;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectsController extends Controller
{
    public function index(Request $request) {
        $q = trim((string) $request->get('q', ''));
        $sort = $request->get('sort', 'name');
        $direction = $request->get('direction', 'asc');

        $projects = projects::with('system')
        ->when(
            $q !== '',
            fn($qb) => $qb->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('code', 'like', "%{$q}%");
            })
        )
        ->orderBy($sort, $direction)
        ->paginate(10)
        ->withQueryString()
            ->through(fn(projects $p) => [
                'id'          => $p->id,
                'system_id'   => $p->system_id,
                'name'        => $p->name,
                'code'        => $p->code,
                'description' => $p->description,
                'start_date' => $p->start_date? Carbon::parse($p->start_date)->format('Y-m-d'): null,
                'end_date'    => $p->end_date? Carbon::parse($p->end_date)->format('Y-m-d'): null,
                'created_at'  => $p->created_at? Carbon::parse($p->created_at)->format('Y-m-d'): null,
                'system'      => $p->system
                    ? [
                        'id'   => $p->system->id,
                        'code' => $p->system->code,
                        'name' => $p->system->name,
                    ]
                    : null,
            ]);

        $systems = system::orderBy('name')
        ->get(['id', 'name', 'code']);

        return Inertia::render('projects/page', [
            'projects' => $projects,
            'systems' => $systems,
            'filters' => ['q' => $q, 'sort' => $sort, 'direction' => $direction],
        ]);
    }

    public function store(ProjectRequest $request) {
        try { 
            $project = null;

            DB::transaction(function () use ($request, &$project) {
                $data = $request->validated();
                $project = projects::create($data);
            });

            return redirect()->route('projects.index')->with('toast', ['type' => 'success']);
        } catch(Throwable $th) {
            report($th);

            return back()->withInput()->with('toast', ['type' => 'error']);
        }
    }

    public function update(projects $project, ProjectRequest $request) {
        try{
            DB::transaction(fn() => $project->update($request->validated()));
            return redirect()->route('projects.index')->with('toast', [
                'type' => 'success'
            ]);
        }catch(Throwable $th) {
            report($th);

            return back()->withInput()->with('toast', ['type' => 'error']);
        }
    }

    public function destroy(projects $project, Request $request) {
        $force = $request->boolean('force');
        try {
            DB::transaction( function() use ($project, $force) {
                if ( $force && in_array(SoftDeletes::class, class_uses_recursive($project))) {
                    $project->forceDelete();
                } else {
                    $project->delete();
                }
            });

            return redirect()->route('projects.index')->with('toast', [
                'type' => 'success',
            ]);
        }catch(Throwable $th) {
            report($th);
            return back()->with('toast', ['type' => 'error']);
        }
    }
}
