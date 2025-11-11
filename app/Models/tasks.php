<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class tasks extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'feature_id',
        'ticket_id',
        'column_id',
        'title',
        'description',
        'reporter_id',
        'priority',
        'story_points',
        'sort_order',
        'due_date',
        'status',
    ];

    public function project() {
        return $this->belongsTo(Projects::class);
    }

    public function feature() {
        return $this->belongsTo(Features::class);
    }

    public function ticket() {
        return $this->belongsTo(Tickets::class);
    }

    public function column() {
        return $this->belongsTo(kanban_columns::class, 'column_id');
    }

    public function reporter() {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignees() {
        return $this->belongsToMany(User::class, 'task_assignees')->withTimestamps();
    }

    public function comments() {
        return $this->hasMany(task_Comments::class);
    }
}
