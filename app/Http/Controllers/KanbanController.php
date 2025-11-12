<?php

namespace App\Http\Controllers;

use Throwable;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\kanban;
use App\Models\projects;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\KanbanRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Database\Eloquent\SoftDeletes;

class KanbanController extends Controller
{
    public function index(Request $request) 
    {
        $sort = $request->get('sort', 'name');
        $direction = $request->get('direction', 'asc');

        $kanbans = kanban::with('project')
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString()
            ->through( fn(kanban $b) => [
                'id' => $b->id,
                'project_id' => $b->project_id,
                'name' => $b->name,
                'created_at' => $b->created_at? Carbon::parse($b->created_at)->format('Y-m-d'):null,
                'project' => $b->project ? 
                        [
                            'id' => $b->project->id,
                            'name' => $b->project->name,
                            'code' => $b->project->code,
                            'description' => $b->project->description
                        ] : null,
            ]);

        $projects = projects::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('kanban/page', [
            'kanbans' => $kanbans,
            'projects' => $projects,
            'filters' => ['sort' => $sort, 'direction' => $direction],
        ]);
    }

    public function store(KanbanRequest $r): RedirectResponse
    {
        try {
            DB::transaction(function() use ($r) {
                kanban::create($r->validated());
            });

            return redirect()->route('kanbans.index')->with('toast', ['type' => 'success']);

        }catch(Throwable $th) {
            return redirect()->route('kanbans.index')->withInput()->with('toast', ['type' => 'error']);
        }
    }

    public function update(kanban $kanban, KanbanRequest $r) {
        try {

            DB::transaction( fn() => $kanban->update($r->validated()));

            return redirect()->route('kanbans.index')->with('toast', ['type' => 'success']);

        }catch(Throwable $th) {
            return redirect()->route('kanbans.index')->withInput()->with('toast', ['type' => 'error']);
        }
    }

    public function destroy(Request $request, kanban $kanban)
    {
        $force = $request->boolean('force');

        try {
            DB::transaction(function() use ($kanban, $force) {
                if ( $force && in_array(SoftDeletes::class, class_uses_recursive($kanban))) {
                    $kanban->forceDelete();
                } else {
                    $kanban->delete();
                }
            });
            
            return redirect()->route('kanbans.index')->with('toast', [
                'type' => 'success',
            ]);
            
        }catch(Throwable $th){
            return back()->with('toast', ['type' => 'error']);
        }
    }

}
