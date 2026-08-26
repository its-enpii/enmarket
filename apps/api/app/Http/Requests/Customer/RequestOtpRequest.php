<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class RequestOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'min:8', 'max:20', 'regex:/^[0-9+\-\s]+$/'],
            'locale' => ['nullable', 'string', 'in:id,en'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'phone.regex' => 'Format nomor WhatsApp tidak valid.',
            'phone.min' => 'Nomor WhatsApp minimal 8 digit.',
            'phone.max' => 'Nomor WhatsApp maksimal 20 digit.',
        ];
    }
}
