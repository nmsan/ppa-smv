<?php

namespace App\Content;

/**
 * Every editable part of the public website, and the form fields that edit it.
 *
 * - "single" types are one record (a page such as History).
 * - "collection" types are many records (news posts, projects).
 *
 * Field types: text, textarea, number, date, url, email, select, boolean,
 * image, list (several paragraphs), group (fields grouped as an object),
 * repeater (a list of groups). Groups and repeaters can contain each other.
 *
 * The stored data has exactly the shape the public pages already use.
 */
final class ContentTypes
{
    /** @return array<string, array<string, mixed>> */
    public static function all(): array
    {
        $person = [
            ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
            ['name' => 'note', 'label' => 'Note (e.g. A/L 1998)', 'type' => 'text'],
        ];
        $contribution = [
            ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
            ['name' => 'note', 'label' => 'Batch or event', 'type' => 'text'],
            ['name' => 'amount', 'label' => 'Amount (e.g. LKR 100,000.00)', 'type' => 'text', 'required' => true],
        ];

        return [
            'news' => [
                'label' => 'News, notices and events',
                'description' => 'Posts on the News page. Upcoming events also appear on the home page until their date.',
                'kind' => 'collection',
                'url' => '/news',
                'columns' => ['title', 'type', 'date'],
                'new_first' => true,
                'fields' => [
                    ['name' => 'type', 'label' => 'Type', 'type' => 'select', 'required' => true, 'options' => ['news' => 'News', 'notice' => 'Notice', 'event' => 'Event']],
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => true],
                    ['name' => 'date', 'label' => 'Date (event date for events)', 'type' => 'date'],
                    ['name' => 'deadline', 'label' => 'Closing date (notices)', 'type' => 'date'],
                    ['name' => 'image', 'label' => 'Image', 'type' => 'image'],
                    ['name' => 'body', 'label' => 'Paragraphs', 'type' => 'list', 'required' => true],
                ],
            ],
            'projects' => [
                'label' => 'School projects',
                'description' => 'Projects on the Projects page and home page. Each project also has its own page.',
                'kind' => 'collection',
                'url' => '/projects',
                'columns' => ['title'],
                'new_first' => false,
                'fields' => [
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => true],
                    ['name' => 'image', 'label' => 'Photo', 'type' => 'image', 'required' => true],
                    ['name' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => ['planned' => 'Planned', 'ongoing' => 'Ongoing', 'completed' => 'Completed']],
                    ['name' => 'summary', 'label' => 'Short summary (shown on the Projects page)', 'type' => 'textarea'],
                    ['name' => 'body', 'label' => 'Details (paragraphs on the project page)', 'type' => 'list'],
                    ['name' => 'estimate', 'label' => 'Estimated cost (e.g. LKR 5,000,000.00)', 'type' => 'text'],
                    ['name' => 'gallery', 'label' => 'More photos', 'type' => 'repeater', 'item_label' => 'Photo', 'fields' => [
                        ['name' => 'image', 'label' => 'Photo', 'type' => 'image', 'required' => true],
                        ['name' => 'caption', 'label' => 'Caption', 'type' => 'text'],
                    ]],
                ],
            ],
            'home' => [
                'label' => 'Home page',
                'description' => 'Top banner, anniversary years, member numbers and the join box.',
                'kind' => 'single',
                'url' => '/',
                'fields' => [
                    ['name' => 'hero', 'label' => 'Top banner', 'type' => 'group', 'fields' => [
                        ['name' => 'headline', 'label' => 'Headline (the last word is shown in gold)', 'type' => 'text', 'required' => true],
                        ['name' => 'text', 'label' => 'Text under the headline', 'type' => 'textarea', 'required' => true],
                        ['name' => 'image', 'label' => 'Photo (wide, at least 1600px)', 'type' => 'image', 'required' => true],
                        ['name' => 'caption', 'label' => 'Photo caption', 'type' => 'text'],
                    ]],
                    ['name' => 'anniversary', 'label' => 'Anniversary banner', 'type' => 'group', 'fields' => [
                        ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => true],
                        ['name' => 'from', 'label' => 'From', 'type' => 'date', 'required' => true],
                        ['name' => 'to', 'label' => 'To', 'type' => 'date', 'required' => true],
                    ]],
                    ['name' => 'stats', 'label' => 'Numbers', 'type' => 'repeater', 'item_label' => 'Number', 'fields' => [
                        ['name' => 'label', 'label' => 'Label', 'type' => 'text', 'required' => true],
                        ['name' => 'value', 'label' => 'Value', 'type' => 'number', 'required' => true],
                    ]],
                    ['name' => 'join', 'label' => 'Join box', 'type' => 'group', 'fields' => [
                        ['name' => 'title', 'label' => 'Heading', 'type' => 'text', 'required' => true],
                        ['name' => 'text', 'label' => 'Text', 'type' => 'textarea', 'required' => true],
                    ]],
                ],
            ],
            'site' => [
                'label' => 'Contact us',
                'description' => 'Contact people, address, email, Facebook and the bank account. The name and address also appear in the header and footer.',
                'kind' => 'single',
                'url' => '/contact',
                'fields' => [
                    ['name' => 'name', 'label' => 'Association name', 'type' => 'text', 'required' => true],
                    ['name' => 'school', 'label' => 'School name (English)', 'type' => 'text', 'required' => true],
                    ['name' => 'school_si', 'label' => 'School name (Sinhala)', 'type' => 'text', 'required' => true],
                    ['name' => 'founded', 'label' => 'School founded', 'type' => 'date', 'required' => true],
                    ['name' => 'address', 'label' => 'Address', 'type' => 'textarea', 'required' => true],
                    ['name' => 'email', 'label' => 'Email', 'type' => 'email', 'required' => true],
                    ['name' => 'facebook', 'label' => 'Facebook page', 'type' => 'url'],
                    ['name' => 'contacts', 'label' => 'Contact people', 'type' => 'repeater', 'item_label' => 'Contact', 'fields' => [
                        ['name' => 'role', 'label' => 'Role', 'type' => 'text', 'required' => true],
                        ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                        ['name' => 'note', 'label' => 'Note (e.g. A/L 1998)', 'type' => 'text'],
                        ['name' => 'phone', 'label' => 'Phone', 'type' => 'text', 'required' => true],
                        ['name' => 'whatsapp', 'label' => 'Reachable on WhatsApp', 'type' => 'boolean'],
                        ['name' => 'image', 'label' => 'Photo', 'type' => 'image'],
                    ]],
                    ['name' => 'bank', 'label' => 'Official bank account (also shown on Projects and Best donors)', 'type' => 'group', 'fields' => [
                        ['name' => 'note', 'label' => 'Note', 'type' => 'textarea'],
                        ['name' => 'account_number', 'label' => 'Account number', 'type' => 'text', 'required' => true],
                        ['name' => 'account_name', 'label' => 'Account name', 'type' => 'text', 'required' => true],
                        ['name' => 'bank', 'label' => 'Bank', 'type' => 'text', 'required' => true],
                        ['name' => 'branch', 'label' => 'Branch', 'type' => 'text', 'required' => true],
                    ]],
                ],
            ],
            'history' => [
                'label' => 'Founder and history',
                'kind' => 'single',
                'url' => '/college/history',
                'fields' => [
                    ['name' => 'title', 'label' => 'Page subtitle', 'type' => 'text', 'required' => true],
                    ['name' => 'school', 'label' => 'About the school', 'type' => 'list', 'required' => true],
                    ['name' => 'founder', 'label' => 'Founder', 'type' => 'group', 'fields' => [
                        ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                        ['name' => 'image', 'label' => 'Image', 'type' => 'image', 'required' => true],
                    ]],
                    ['name' => 'kannangara', 'label' => 'Dr. C. W. W. Kannangara', 'type' => 'group', 'fields' => [
                        ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                        ['name' => 'tagline', 'label' => 'Tagline', 'type' => 'text'],
                        ['name' => 'image', 'label' => 'Image', 'type' => 'image', 'required' => true],
                        ['name' => 'paragraphs', 'label' => 'Paragraphs', 'type' => 'list', 'required' => true],
                    ]],
                ],
            ],
            'principals' => [
                'label' => 'Principals',
                'kind' => 'single',
                'url' => '/college/principals',
                'fields' => [
                    ['name' => 'title', 'label' => 'Heading', 'type' => 'text', 'required' => true],
                    ['name' => 'subtitle', 'label' => 'Subtitle', 'type' => 'text'],
                    ['name' => 'message', 'label' => 'Message (also on the home page)', 'type' => 'group', 'fields' => [
                        ['name' => 'text', 'label' => 'Message', 'type' => 'textarea', 'required' => true],
                        ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                        ['name' => 'role', 'label' => 'Role', 'type' => 'text', 'required' => true],
                    ]],
                    ['name' => 'principals', 'label' => 'Principals in order', 'type' => 'repeater', 'item_label' => 'Principal', 'fields' => [
                        ['name' => 'number', 'label' => 'Number (blank for a period with no principal)', 'type' => 'number'],
                        ['name' => 'from', 'label' => 'From (YYYY-MM-DD, or a period such as 1987-1989)', 'type' => 'text'],
                        ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                        ['name' => 'note', 'label' => 'Note', 'type' => 'text'],
                    ]],
                ],
            ],
            'goals' => [
                'label' => 'Goals and objectives',
                'kind' => 'single',
                'url' => '/association/goals',
                'fields' => [
                    ['name' => 'title', 'label' => 'Page subtitle', 'type' => 'text', 'required' => true],
                    ['name' => 'intro', 'label' => 'Introduction', 'type' => 'textarea', 'required' => true],
                    ['name' => 'items', 'label' => 'Goals', 'type' => 'repeater', 'item_label' => 'Goal', 'fields' => [
                        ['name' => 'marker', 'label' => 'Letter', 'type' => 'text', 'required' => true],
                        ['name' => 'text', 'label' => 'Goal', 'type' => 'textarea', 'required' => true],
                    ]],
                ],
            ],
            'office-bearers' => [
                'label' => 'Office bearers',
                'description' => 'Add a new term at the top after each AGM.',
                'kind' => 'single',
                'url' => '/association/office-bearers',
                'fields' => [
                    ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => true],
                    ['name' => 'basis', 'label' => 'Constitution reference', 'type' => 'textarea'],
                    ['name' => 'terms', 'label' => 'Terms (newest first)', 'type' => 'repeater', 'item_label' => 'Term', 'fields' => [
                        ['name' => 'term', 'label' => 'Term (e.g. 2026/2027)', 'type' => 'text', 'required' => true],
                        ['name' => 'elected', 'label' => 'Elected at', 'type' => 'text'],
                        ['name' => 'officers', 'label' => 'Officers', 'type' => 'repeater', 'item_label' => 'Office', 'fields' => [
                            ['name' => 'role', 'label' => 'Office (e.g. Secretary)', 'type' => 'text', 'required' => true],
                            ['name' => 'people', 'label' => 'People', 'type' => 'repeater', 'item_label' => 'Person', 'fields' => $person],
                        ]],
                        ['name' => 'committee', 'label' => 'Executive committee members', 'type' => 'repeater', 'item_label' => 'Member', 'fields' => $person],
                        ['name' => 'advisory', 'label' => 'Non-executive committee', 'type' => 'repeater', 'item_label' => 'Group', 'fields' => [
                            ['name' => 'role', 'label' => 'Group (e.g. Consultants)', 'type' => 'text', 'required' => true],
                            ['name' => 'people', 'label' => 'People', 'type' => 'repeater', 'item_label' => 'Person', 'fields' => $person],
                        ]],
                    ]],
                ],
            ],
            'membership' => [
                'label' => 'Membership',
                'kind' => 'single',
                'url' => '/membership',
                'fields' => [
                    ['name' => 'title', 'label' => 'Constitution heading', 'type' => 'text', 'required' => true],
                    ['name' => 'intro', 'label' => 'Introduction', 'type' => 'textarea', 'required' => true],
                    ['name' => 'fees', 'label' => 'Fees', 'type' => 'repeater', 'item_label' => 'Fee', 'fields' => [
                        ['name' => 'name', 'label' => 'Name', 'type' => 'text', 'required' => true],
                        ['name' => 'sinhala', 'label' => 'Name in Sinhala', 'type' => 'text'],
                        ['name' => 'amount', 'label' => 'Amount (e.g. Rs. 1,000.00)', 'type' => 'text', 'required' => true],
                        ['name' => 'period', 'label' => 'Period (e.g. per year)', 'type' => 'text', 'required' => true],
                    ]],
                    ['name' => 'sections', 'label' => 'Constitution clauses', 'type' => 'repeater', 'item_label' => 'Section', 'fields' => [
                        ['name' => 'number', 'label' => 'Number', 'type' => 'text', 'required' => true],
                        ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => true],
                        ['name' => 'clauses', 'label' => 'Clauses', 'type' => 'repeater', 'item_label' => 'Clause', 'fields' => [
                            ['name' => 'number', 'label' => 'Number', 'type' => 'text', 'required' => true],
                            ['name' => 'text', 'label' => 'Text', 'type' => 'textarea', 'required' => true],
                        ]],
                    ]],
                ],
            ],
        ];
    }

    /** @return array<string, mixed> */
    public static function get(string $type): array
    {
        return self::all()[$type] ?? abort(404);
    }

    public static function exists(string $type): bool
    {
        return array_key_exists($type, self::all());
    }

    public static function isCollection(string $type): bool
    {
        return self::get($type)['kind'] === 'collection';
    }
}
