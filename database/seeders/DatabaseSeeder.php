<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // seed permission & role dulu
        $this->call(RolesandPermissions::class);

        // pastikan role admin ada
        Role::findOrCreate('admin', 'web');

        // buat/ambil user admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'), // ganti di production!
            ]
        );

        // assign role admin (idempotent)
        $admin->syncRoles(['admin']);
    }
}
