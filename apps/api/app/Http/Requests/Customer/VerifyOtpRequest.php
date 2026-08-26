<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'min:8', 'max:20'],
            'code' => ['required', 'string', 'size:6'],
            'name' => ['nullable', 'string', 'max:100'],
            'session_id' => ['nullable', 'string', 'max:64'],
            'wishlist_session' => ['nullable', 'string', 'max:64'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'code.required' => 'Kode OTP wajib diisi.',
            'code.size' => 'Kode OTP harus berupa 6 digit angka.',
        ];
    }
}
