<?php

namespace App\Http\Requests\KanbanColumn;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $kanbanId = $this->route('kanban')->id;

        return [
            'name' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('kanban_columns', 'name')->where('kanban_board_id', $kanbanId),],
        ];
    }
}
