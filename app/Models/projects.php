<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class projects extends Model
{
    protected $fillable = [
        'system_id',
        'name',
        'code',
        'description',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function system() {
        return $this->belongsTo(system::class);
    }

    public function members() {
        return $this->belongsToMany(User::class, 'projects_members')->withTimestamps()->withPivot('role');
    }

    public function tickets() {
        return $this->hasMany(Tickets::class);
    }

    public function board() {
        return $this->hasOne(Kanban::class);
    }

    public function features() {
        return $this->hasMany(Features::class);
    }

    public function tasks() {
        return $this->hasMany(Tasks::class);
    }
}
