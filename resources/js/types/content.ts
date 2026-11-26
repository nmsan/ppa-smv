export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'url' | 'email' | 'select' | 'boolean' | 'image' | 'list' | 'group' | 'repeater';

export interface FieldDef {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: Record<string, string>;
    fields?: FieldDef[];
    item_label?: string;
    /** Repeaters: badge for the last item (e.g. "Present principal"); it opens by default. */
    highlight_last?: string;
    /** Repeaters: show the last item first in the editor (stored order is unchanged); "Add" goes on top. */
    newest_first?: boolean;
    /** Repeaters: title each item with this field's value ("Principal No. 29") instead of its position. */
    number_field?: string;
}

export interface ContentTypeDef {
    key: string;
    label: string;
    description?: string | null;
    kind: 'single' | 'collection';
    url: string;
    fields: FieldDef[];
    columns?: string[];
}

export interface Stamp {
    at: string | null;
    by: string | null;
}

export type Data = Record<string, unknown>;
