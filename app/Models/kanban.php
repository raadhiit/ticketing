<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class kanban extends Model
{
    protected $fillable = [
        'project_id',
        'name',
    ];

    public function project()
    {
        return $this->belongsTo(projects::class);
    }

    public function columns()
    {
        return $this->hasMany(kanban_columns::class);
    }

}
