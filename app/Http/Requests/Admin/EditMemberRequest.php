<?php

namespace App\Http\Requests\Admin;

use App\Application\Membership\DTO\MemberCorrectionData;
use App\Domain\Membership\MembershipCategory;
use App\Http\Requests\Concerns\NormalisesContactInput;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EditMemberRequest extends FormRequest
{
    use NormalisesContactInput;

    protected function prepareForValidation(): void
    {
        $this->normaliseContactInput(['phone', 'whatsapp']);
    }

    public function authorize(): bool
    {
        return $this->user() !== null; // the use case checks the role
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
            'clear_nic' => ['boolean'],
            'ol_year' => ['nullable', 'integer', 'between:1940,2100'],
            'al_year' => ['nullable', 'integer', 'between:1940,2100'],
            'country' => ['nullable', 'string', 'max:80'],
            'gender' => ['nullable', 'in:male,female'],
            'admission_number' => ['nullable', 'string', 'max:30'],
            'category' => ['required', Rule::enum(MembershipCategory::class)],
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

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['ol_year' => 'O/L year', 'al_year' => 'A/L year', 'nic' => 'NIC'];
    }

    public function toData(): MemberCorrectionData
    {
        $nullable = fn (string $key) => ($v = trim((string) $this->input($key))) === '' ? null : $v;

        return new MemberCorrectionData(
            fullName: (string) $this->string('full_name'),
            email: $nullable('email'),
            phone: $nullable('phone'),
            whatsapp: $nullable('whatsapp'),
            nic: $nullable('nic'),
            clearNic: $this->boolean('clear_nic'),
            olYear: $this->integer('ol_year') ?: null,
            alYear: $this->integer('al_year') ?: null,
            country: $nullable('country'),
            gender: $nullable('gender'),
            admissionNumber: $nullable('admission_number'),
            category: MembershipCategory::from((string) $this->string('category')),
        );
    }
}
