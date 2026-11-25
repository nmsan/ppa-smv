export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'url' | 'email' | 'select' | 'boolean' | 'image' | 'list' | 'group' | 'repeater';

export interface FieldDef {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: Record<string, string>;
    fields?: FieldDef[];
    item_label?: string;
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
