<?php


namespace Database\Seeders;

use App\Models\kanban;
use App\Models\kanban_columns;
use Illuminate\Database\Seeder;


class DefaultKanbanColumnsSeeder extends Seeder
{
    public function run(): void
    {
        kanban::chunk(100, function ($boards) {
            foreach ($boards as $board) {
                if ($board->columns()->count() === 0) {
                    $names = ['Backlog', 'Todo', 'In Progress', 'Review', 'Done'];
                    foreach ($names as $i => $name) {
                        kanban_columns::create([
                            'board_id' => $board->id,
                            'name' => $name,
                            'position' => $i + 1,
                        ]);
                    }
                }
            }
        });
    }
}
