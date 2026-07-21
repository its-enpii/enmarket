<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi untuk mark-ready / regenerate account provisioning.
 *
 * credentials fleksibel — minimal harus punya username+password, optional
 * field lain (server, profile, expiry, dsb.) yang akan di-forward ke buyer.
 */
class AccountProvisioningRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'credentials' => ['required', 'array'],
            'credentials.username' => ['required', 'string', 'max:255'],
            'credentials.password' => ['required', 'string', 'max:255'],
            'credentials.server' => ['nullable', 'string', 'max:255'],
            'credentials.profile' => ['nullable', 'string', 'max:255'],
            'credentials.expiry' => ['nullable', 'string', 'max:255'],
            'credentials.*' => ['nullable'],
            'catatan' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'credentials.required' => 'Kredensial wajib diisi.',
            'credentials.username.required' => 'Username wajib diisi.',
            'credentials.password.required' => 'Password wajib diisi.',
        ];
    }
}
