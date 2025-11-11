<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'dept_id'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function department() {
        return $this->belongsTo(departments::class, 'dept_id');
    }

    public function projectMembership() {
        return $this->hasMany(projects_member::class);
    }

    public function projects() {
        return $this->belongsToMany(Projects::class, 'projects_members')->withTimestamps()->withPivot('role');
    }

    public function submittedTickets() {
        return $this->hasMany(Tickets::class, 'requester_id');
    }

    public function insertedTickets() {
        return $this->hasMany(Tickets::class, 'inserted_by');
    }

    public function assignedTickets() {
        return $this->hasMany(Tickets::class, 'assigned_to');
    }

    public function reportedTasks() {
        return $this->hasMany(Tasks::class, 'reporter_id');
    }

    public function assignedTasks() {
        return $this->belongsToMany(Tasks::class, 'task_assignees')->withTimestamps();
    }

    public function taskComments() {
        return $this->hasMany(task_Comments::class);
    }
}
