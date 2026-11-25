<?php

namespace App\Content;

use Illuminate\Contracts\Validation\Rule;

/** Turns a content type's field list into validation rules, and cleans submitted data. */
final class ContentSchema
{
    /**
     * @param  list<array<string, mixed>>  $fields
     * @return array<string, list<string|Rule>>
     */
    public static function rules(array $fields, string $prefix = 'data'): array
    {
        $rules = [$prefix => ['required', 'array']];

        foreach ($fields as $field) {
            $rules += self::fieldRules($field, "{$prefix}.{$field['name']}");
        }

        return $rules;
    }

    /** @return array<string, list<string>> */
    private static function fieldRules(array $field, string $key): array
    {
        $presence = ($field['required'] ?? false) ? 'required' : 'nullable';

        return match ($field['type']) {
            'text' => [$key => [$presence, 'string', 'max:500']],
            'textarea' => [$key => [$presence, 'string', 'max:10000']],
            'number' => [$key => [$presence, 'integer', 'between:-1000000,100000000']],
            'date' => [$key => [$presence, 'date_format:Y-m-d']],
            'url' => [$key => [$presence, 'url:https,http', 'max:500']],
            'email' => [$key => [$presence, 'email', 'max:200']],
            'boolean' => [$key => ['boolean']],
            'select' => [$key => [$presence, 'in:'.implode(',', array_keys($field['options']))]],
            'image' => [$key => [$presence, 'string', 'max:500', 'regex:#^/(images|storage)/[A-Za-z0-9/_.-]+$#']],
            'list' => [$key => [$presence, 'array', 'max:100'], "{$key}.*" => ['required', 'string', 'max:10000']],
            'group' => [$key => [$presence, 'array']] + self::nested($field['fields'], $key),
            'repeater' => [$key => ['present', 'array', 'max:500']] + self::nested($field['fields'], "{$key}.*"),
        };
    }

    /** @return array<string, list<string>> */
    private static function nested(array $fields, string $prefix): array
    {
        $rules = [];
        foreach ($fields as $field) {
            $rules += self::fieldRules($field, "{$prefix}.{$field['name']}");
        }

        return $rules;
    }

    /**
     * Keeps only known fields, re-numbers lists, casts numbers and booleans,
     * and turns empty optional values into null.
     *
     * @param  list<array<string, mixed>>  $fields
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function clean(array $fields, array $data): array
    {
        $out = [];
        foreach ($fields as $field) {
            $out[$field['name']] = self::cleanValue($field, $data[$field['name']] ?? null);
        }

        return $out;
    }

    private static function cleanValue(array $field, mixed $value): mixed
    {
        return match ($field['type']) {
            'boolean' => (bool) $value,
            'number' => $value === null || $value === '' ? null : (int) $value,
            'list' => array_values(array_filter(array_map('trim', (array) $value), fn ($v) => $v !== '')),
            'group' => self::clean($field['fields'], (array) $value),
            'repeater' => array_values(array_map(fn ($item) => self::clean($field['fields'], (array) $item), (array) $value)),
            default => is_string($value) && trim($value) === '' ? null : (is_string($value) ? trim($value) : $value),
        };
    }

    /**
     * Drops empty paragraphs (an editor clicked "Add paragraph" and left it
     * blank) before validation, so they never block a save.
     */
    public static function withoutBlankParagraphs(array $fields, mixed $data): mixed
    {
        if (! is_array($data)) {
            return $data;
        }

        foreach ($fields as $field) {
            $name = $field['name'];
            if (! array_key_exists($name, $data)) {
                continue;
            }
            $value = $data[$name];
            $data[$name] = match ($field['type']) {
                'list' => is_array($value) ? array_values(array_filter($value, fn ($v) => is_string($v) && trim($v) !== '')) : $value,
                'group' => self::withoutBlankParagraphs($field['fields'], $value),
                'repeater' => is_array($value) ? array_map(fn ($item) => self::withoutBlankParagraphs($field['fields'], $item), $value) : $value,
                default => $value,
            };
        }

        return $data;
    }

    /** An empty record shaped like the fields, for "add" forms. */
    public static function blank(array $fields): array
    {
        $out = [];
        foreach ($fields as $field) {
            $out[$field['name']] = match ($field['type']) {
                'boolean' => false,
                'list', 'repeater' => [],
                'group' => self::blank($field['fields']),
                'select' => array_key_first($field['options']),
                default => null,
            };
        }

        return $out;
    }
}
