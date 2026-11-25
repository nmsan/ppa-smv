<?php

namespace App\Http\Requests\Member;

use Illuminate\Foundation\Http\FormRequest;

class ClaimRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'membership_number' => ['required', 'string', 'max:10', 'regex:/^\s*[Mm]?\s*-?\s*\d{1,6}\s*$/'],
            'phone' => ['nullable', 'required_without:nic', 'string', 'max:20'],
            'nic' => ['nullable', 'required_without:phone', 'string', 'max:20'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'membership_number.regex' => 'Enter your membership number, for example M-123.',
            'phone.required_without' => 'Enter the phone number or the NIC you gave the association.',
            'nic.required_without' => 'Enter the phone number or the NIC you gave the association.',
        ];
    }
}
