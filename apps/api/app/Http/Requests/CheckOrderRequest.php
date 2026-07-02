<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_order' => ['required', 'string', 'regex:/^EPS-\d{8}-[A-Z0-9]{4,8}$/'],
            'email' => ['required', 'email'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_order.regex' => 'Format kode order tidak valid. Contoh: EPS-20240701-A3KX',
        ];
    }
}