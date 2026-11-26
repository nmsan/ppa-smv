<?php

namespace App\Application\Membership\DTO;

/** What the member list was asked for: free-text search, filters, sort order and the page to return. */
final readonly class MemberListQuery
{
    public const SORTS = ['name', 'number', 'batch', 'joined'];

    public const PER_PAGE = [25, 50, 100];

    public function __construct(
        public ?string $search = null,
        public ?string $status = null,
        public ?string $category = null,
        public ?int $batch = null,
        public ?string $source = null,
        public ?string $country = null,
        public string $sort = 'number',
        public string $direction = 'asc',
        public int $page = 1,
        public int $perPage = 25,
    ) {}

    /** The same query limited to one batch, used for batch representatives. */
    public function forBatch(int $batch): self
    {
        return new self($this->search, $this->status, $this->category, $batch, $this->source, $this->country, $this->sort, $this->direction, $this->page, $this->perPage);
    }
}
