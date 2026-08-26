<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CustomBuildRequest extends FormRequest
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
            'jenis_proyek' => ['required', 'string', 'in:website,mobile-app,webapp,automation,other'],
            'deskripsi' => ['required', 'string', 'min:10', 'max:5000'],
            'budget_range' => ['required', 'string', 'in:<5jt,5-15jt,15-50jt,50jt+,discuss'],
            'timeline' => ['required', 'string', 'in:<2minggu,2-4minggu,1-3bulan,3-6bulan,flexible'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama wajib diisi.',
            'nama.min' => 'Nama minimal 2 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'wa.required' => 'Nomor WhatsApp wajib diisi.',
            'wa.regex' => 'Nomor WA hanya boleh berisi angka, spasi, +, atau -.',
            'jenis_proyek.required' => 'Jenis proyek wajib dipilih.',
            'jenis_proyek.in' => 'Jenis proyek yang dipilih tidak valid.',
            'deskripsi.required' => 'Deskripsi kebutuhan wajib diisi.',
            'deskripsi.min' => 'Deskripsi minimal 10 karakter.',
            'budget_range.required' => 'Estimasi budget wajib dipilih.',
            'budget_range.in' => 'Pilihan budget tidak valid.',
            'timeline.required' => 'Timeline proyek wajib dipilih.',
            'timeline.in' => 'Pilihan timeline tidak valid.',
        ];
    }
}
