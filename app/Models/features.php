<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class features extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'originating_ticket_id',
        'title',
        'status',
        'order_index',
    ];

    public function project() {
        return $this->belongsTo(Projects::class);
    }

    public function originatingTicket() {
        return $this->belongsTo(Tickets::class, 'originating_ticket_id');
    }

    public function tasks() {
        return $this->hasMany(Tasks::class);
    }
}
