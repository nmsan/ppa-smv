<?php

namespace App\Http\Requests\Admin;

/** The secretary's "Add member" form: the edit form's fields, a batch year, and whether to give a number now. */
class AddMemberRequest extends EditMemberRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = parent::rules();
        unset($rules['clear_nic']);

        return [
            ...$rules,
            'ol_year' => ['nullable', 'required_without:al_year', 'integer', 'between:1940,2100'],
            'al_year' => ['nullable', 'required_without:ol_year', 'integer', 'between:1940,2100'],
            'give_number' => ['boolean'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            ...parent::messages(),
            'ol_year.required_without' => 'Enter the O/L or A/L year, so the member is placed in a batch.',
            'al_year.required_without' => 'Enter the O/L or A/L year, so the member is placed in a batch.',
        ];
    }
}
