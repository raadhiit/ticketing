<?php

namespace App\Models;

use Illuminate\Console\View\Components\Task;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tickets extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'ticket_code',
        'requester_id',
        'system_id',
        'project_id',
        'type',
        'status',
        'category',
        'Approval',
        'inserted_by',
        'assigned_to',
        'title', 
        'description', 
        'status',
    ];

    public function requester() {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function inserter() {
        return $this->belongsTo(User::class, 'inserted_by');
    }

    public function assignee() {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function system() {
        return $this->belongsTo(System::class);
    }

    public function project() {
        return $this->belongsTo(Projects::class);
    }

    public function features() {
        return $this->hasMany(Features::class, 'originating_ticket_id');
    }

    public function details() {
        return $this->hasMany(Ticket_Details::class, 'ticket_id');
    }

    public function tasks() {
        return $this->hasMany(Task::class);
    }
}
