<?php

namespace App\Http\Requests;

use App\Models\system;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class SystemRequest extends FormRequest
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
        $params = $this->route('system');
        $id = $params instanceof system ? $params->id : $params;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('systems', 'name')->ignore($id),
            ],
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('systems', 'code')->ignore($id),
            ]
        ];
    }
}
