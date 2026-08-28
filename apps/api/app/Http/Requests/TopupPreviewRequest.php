<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TopupPreviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'game_id' => ['required', 'integer', 'exists:games,id'],
            'game_item_id' => ['required', 'integer', 'exists:game_items,id'],
            'user_id' => ['required', 'string', 'max:64'],
            'server_id' => ['nullable', 'string', 'max:64'],
            'contact_type' => ['required', 'string', 'in:phone,email'],
            'contact_value' => ['required', 'string', 'max:120'],
        ];
    }
}
