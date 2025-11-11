<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RolesandPermissions extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'ticket.create',
            'ticket.view.any',
            'ticket.view.own',
            'ticket.view.assigned',
            'ticket.update.any',
            'ticket.update.own',
            'ticket.update.assigned',
            'ticket.assign',       // assign ke dev
            'ticket.comment',
            'ticket.delete.own',   // komentar
            'user.manage',         // kelola user/role
        ];

        foreach ($permissions as $p) {
            Permission::findOrCreate($p, 'web');
        }

        $user = Role::findOrCreate('user', 'web');
        $dev = Role::findOrCreate('dev', 'web');
        $admin = Role::findOrCreate('admin', 'web');

        $user->syncPermissions([
            'ticket.create',
            'ticket.view.own',
            'ticket.update.own',
            'ticket.comment',
            'ticket.delete.own',
        ]);

        $dev->syncPermissions([
            'ticket.view.assigned',
            'ticket.update.assigned',
            'ticket.comment',
        ]);

        $admin->syncPermissions([
            'ticket.view.any',
            'ticket.update.any',
            'ticket.assign',
            'ticket.comment',
            'user.manage',
        ]);
    }
}
