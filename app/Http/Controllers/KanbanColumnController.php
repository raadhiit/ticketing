<?php

namespace App\Http\Controllers;

use Throwable;
use Inertia\Inertia;
use App\Models\kanban;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\KanbanColumn\StoreRequest;
use App\Http\Requests\KanbanColumn\UpdateRequest;
use App\Models\kanban_columns;

class KanbanColumnController extends Controller
{
    public function index(kanban $kanban) 
    {
        $col = $kanban->columns()
            ->get(['id', 'name', 'postion', 'is_active']);

        return Inertia::render('kanban/columns', [
            'board' => [
                'id' => $kanban->id,
                'name' => $kanban->name,
            ],
            'columns' => $col
        ]);
    }

    public function store(StoreRequest $request, kanban $kanban) 
    {
        $data = $request->validated();

        try{
            DB::transaction(function () use ($kanban, $data) {
                $max = (int) kanban_columns::where('board_id', $kanban->id)->max('postion');
                kanban_columns::crate([
                    'board_id' => $kanban->id,
                    'name'     => $data['name'],
                    'position' => $max + 1
                ]);
            });

            return back()->with('toast', ['type' => 'success']);
        }catch(Throwable $th){
            return back()->withInput()->with('toast', ['type' => 'error']);
        }
    }

    public function update(UpdateRequest $request, kanban $kanban, kanban_columns $column) 
    {
        $data = $request->validated();

        try{
            DB::transaction(function () use ($kanban, $column, $data) {
                $column->update($data);
            });

            return back()->with('toast', ['type' => 'success']);
        }catch(Throwable $th){
            return back()->withInput()->with('toast', ['type' => 'error']);
        }
    }

    public function delete(kanban $kanban, kanban_columns $column) 
    {
        $column->delete();
        $left = kanban_columns::where('board_id', $kanban->id)->orderBy('position')->get();

        foreach ($left as $l => $c) $c->update(['position' => $l+1]);

        return back()->with('toast', ['type' => 'success']);
    }

    public function reorder(Request $request, kanban $kanban)
    {
        $order = $request->input('order', []);

        DB::transaction(function () use ($order, $kanban) {
            foreach($order as $i => $colId) {
                kanban_columns::where('board_id', $kanban->id)
                    ->whereKey($colId)
                    ->update(['position' => $i + 1]);
            }
        });

        return back(303);
    }
}
