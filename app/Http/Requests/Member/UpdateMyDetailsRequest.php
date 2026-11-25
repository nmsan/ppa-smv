<?php

namespace App\Http\Requests\Member;

use App\Application\Membership\DTO\MemberDetailsData;
use App\Http\Requests\Concerns\NormalisesContactInput;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMyDetailsRequest extends FormRequest
{
    use NormalisesContactInput;

    protected function prepareForValidation(): void
    {
        $this->normaliseContactInput(['phone', 'whatsapp']);
    }

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'regex:/^(\+\d{8,15}|0\d{9})$/'],
            'whatsapp' => ['nullable', 'string', 'regex:/^(\+\d{8,15}|0\d{9})$/'],
            'nic' => ['nullable', 'string', 'regex:/^(\d{9}[VvXx]|\d{12}|[A-Za-z]\d{7,8})$/'],
            'ol_year' => ['nullable', 'integer', 'between:1940,2100'],
            'al_year' => ['nullable', 'integer', 'between:1940,2100'],
            'country' => ['nullable', 'string', 'max:80'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a mobile number such as 0771234567, or +44... from overseas.',
            'whatsapp.regex' => 'Enter a number such as 0771234567, or +44... from overseas.',
            'nic.regex' => 'Enter an old (9 digits + V/X) or new (12 digits) NIC, or a passport number.',
        ];
    }

    public function toData(): MemberDetailsData
    {
        $nullable = fn (string $key) => ($v = trim((string) $this->input($key))) === '' ? null : $v;

        return new MemberDetailsData(
            fullName: (string) $this->string('full_name'),
            email: $nullable('email'),
            phone: $nullable('phone'),
            whatsapp: $nullable('whatsapp'),
            nic: $nullable('nic'),
            olYear: $this->integer('ol_year') ?: null,
            alYear: $this->integer('al_year') ?: null,
            country: $nullable('country'),
        );
    }
}
