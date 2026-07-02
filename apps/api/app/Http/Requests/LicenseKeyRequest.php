<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LicenseKeyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'count' => ['required', 'integer', 'min:1', 'max:500'],
            'prefix' => ['nullable', 'string', 'min:2', 'max:10', 'regex:/^[A-Z0-9]+$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'prefix.regex' => 'Prefix hanya boleh huruf besar dan angka (tanpa spasi).',
        ];
    }
}
