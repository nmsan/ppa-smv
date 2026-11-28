<?php

namespace App\Http\Controllers\Admin;

use App\Application\Membership\DTO\MemberListQuery;
use App\Application\Membership\UseCases\AddMember;
use App\Application\Membership\UseCases\EditMember;
use App\Application\Membership\UseCases\ListMembers;
use App\Application\Ports\ActorResolver;
use App\Domain\Membership\MembershipCategory;
use App\Domain\Membership\MembershipStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AddMemberRequest;
use App\Http\Requests\Admin\EditMemberRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** The member list with search, filters and server-side pagination, and the secretary's add and edit forms. */
class MemberController extends Controller
{
    public function __construct(private readonly ActorResolver $actors) {}

    public function index(Request $request, ListMembers $list): Response
    {
        $v = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(MembershipStatus::class)],
            'category' => ['nullable', Rule::enum(MembershipCategory::class)],
            'batch' => ['nullable', 'integer', 'between:1940,2100'],
            'source' => ['nullable', 'in:application,register,secretary'],
            'country' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in(MemberListQuery::SORTS)],
            'direction' => ['nullable', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', Rule::in(MemberListQuery::PER_PAGE)],
        ]);

        $query = new MemberListQuery(
            search: ($v['search'] ?? '') !== '' ? trim($v['search']) : null,
            status: $v['status'] ?? null,
            category: $v['category'] ?? null,
            batch: isset($v['batch']) ? (int) $v['batch'] : null,
            source: $v['source'] ?? null,
            country: $v['country'] ?? null,
            sort: $v['sort'] ?? 'number',
            direction: $v['direction'] ?? 'asc',
            page: (int) ($v['page'] ?? 1),
            perPage: (int) ($v['per_page'] ?? 25),
        );

        $actor = $this->actors->forUser($request->user()->id);
        $result = $list->execute($query, $actor);

        return Inertia::render('admin/members/index', [
            ...$result,
            'canEdit' => $actor->canEditMembers(),
            'filters' => [
                'search' => $query->search ?? '',
                'status' => $query->status ?? '',
                'category' => $query->category ?? '',
                'batch' => $query->batch ? (string) $query->batch : '',
                'source' => $query->source ?? '',
                'country' => $query->country ?? '',
                'sort' => $query->sort,
                'direction' => $query->direction,
                'per_page' => $query->perPage,
            ],
            'statuses' => array_map(fn (MembershipStatus $s) => $s->value, MembershipStatus::cases()),
            'categories' => array_map(fn (MembershipCategory $c) => $c->value, MembershipCategory::cases()),
        ]);
    }

    public function store(AddMemberRequest $request, AddMember $add): RedirectResponse
    {
        $member = $add->execute($request->toData(), $request->boolean('give_number'), $this->actors->forUser($request->user()->id));

        return back()->with('success', $member->membershipNumber()
            ? "{$member->fullName} is added as {$member->membershipNumber()}. The treasurer can now record their fee."
            : "{$member->fullName} is added and is waiting under Applicants for approval.");
    }

    /** The current details for the edit form, fetched when it opens. */
    public function show(Request $request, string $member, EditMember $edit): JsonResponse
    {
        return response()->json($edit->details($member, $this->actors->forUser($request->user()->id)));
    }

    public function update(EditMemberRequest $request, string $member, EditMember $edit): RedirectResponse
    {
        $saved = $edit->execute($member, $request->toData(), $this->actors->forUser($request->user()->id));

        return back()->with('success', "{$saved->fullName}'s record is saved.");
    }
}
