<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class system extends Model
{
    protected $fillable = [
        'name',
        'code',
    ];

    public function projects() {
        return $this->hasMany(Projects::class);
    }

    public function tickets() {
        return $this->hasMany(Tickets::class);
    }
}
