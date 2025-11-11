<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ticket_details extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'description',
        'attachment',
    ];

    public function project() {
        return $this->belongsTo(Projects::class);
    }

    public function columns() {
        return $this->hasMany(Kanban_Columns::class, 'board_id')->orderBy('position', 'asc');
    }
}
