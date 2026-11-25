<?php

namespace App\Http\Requests\Member;

use App\Application\Membership\DTO\SubmitApplicationData;
use App\Http\Requests\Concerns\NormalisesContactInput;
use Illuminate\Foundation\Http\FormRequest;

class SubmitApplicationRequest extends FormRequest
{
    use NormalisesContactInput;

    protected function prepareForValidation(): void
    {
        $this->normaliseContactInput(['phone']);
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
            'email' => ['required', 'email', 'max:150'],
            'phone' => ['required', 'string', 'regex:/^(0\d{9}|\+\d{8,15})$/'],
            'nic' => ['required', 'string', 'regex:/^(\d{9}[VX]|\d{12}|\d{12}[VX]|[A-Z]\d{7,8})$/'],
            'ol_year' => ['nullable', 'integer', 'between:1940,2100', 'required_without:al_year'],
            'al_year' => ['nullable', 'integer', 'between:1940,2100', 'required_without:ol_year'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Enter a mobile number such as 077 123 4567, or +44... from overseas.',
            'nic.regex' => 'Enter an old (9 digits + V/X) or new (12 digits) NIC number.',
        ];
    }

    public function toData(): SubmitApplicationData
    {
        return new SubmitApplicationData(
            userId: $this->user()->id,
            fullName: $this->string('full_name'),
            email: $this->string('email'),
            phone: $this->string('phone'),
            nic: $this->string('nic'),
            olYear: $this->integer('ol_year') ?: null,
            alYear: $this->integer('al_year') ?: null,
        );
    }
}
