<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class kanban_columns extends Model
{
    protected $fillable = [
        'board_id',
        'name',
        'positon',
        'is_active'
    ];

    public function board() {
        return $this->belongsTo(kanban::class);
    }

    public function tasks() {
        return $this->hasMany(tasks::class, 'kanban_columns_id')->orderBy('sort_order', 'asc');
    }
}
