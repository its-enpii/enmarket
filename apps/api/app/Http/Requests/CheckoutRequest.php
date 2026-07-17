<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:100'],
            'wa' => ['required', 'string', 'min:8', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
            'session_id' => ['nullable', 'string', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'wa.regex' => 'Nomor WA hanya boleh berisi angka, spasi, +, atau -.',
        ];
    }
}
