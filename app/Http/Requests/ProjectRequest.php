<?php

namespace App\Http\Requests;

use App\Models\projects;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
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
        $params = $this->route('project');
        $id = $params instanceof projects ? $params->id : $params;

        return [
            'system_id' => ['required', 'integer', 'exists:systems,id'],
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }

    public function prepareForValidation() {
        $this->merge([
            'description' => $this->description ?: null,
            'start_date' => $this->start_date ?: null,
            'end_date' => $this->end_date ?: null
        ]);
    }
}
