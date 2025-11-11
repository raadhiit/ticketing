<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('feature_id')->constrained('features')->cascadeOnDelete()->nullable();
            $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnDelete()->nullable();
            $table->foreignId('column_id')->constrained('kanban_columns')->cascadeOnDelete();
            $table->string('title');
            $table->longText('description')->nullable();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->unsignedSmallInteger('story_points')->default(1);
            $table->unsignedInteger('sort_order')->default(1);
            $table->date('due_date')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'column_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
