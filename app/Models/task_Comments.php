<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class task_Comments extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'comment',
    ];

    public function task() {
        return $this->belongsTo(Tasks::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}
