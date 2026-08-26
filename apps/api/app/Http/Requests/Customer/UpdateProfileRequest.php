<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'min:2', 'max:100'],
            'phone' => ['nullable', 'string', 'min:8', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
            'email' => ['nullable', 'email:rfc', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex' => 'Format nomor WhatsApp tidak valid.',
            'email.email' => 'Format email tidak valid.',
        ];
    }
}
