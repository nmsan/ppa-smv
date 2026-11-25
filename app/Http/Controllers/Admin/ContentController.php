<?php

namespace App\Http\Controllers\Admin;

use App\Content\ContentSchema;
use App\Content\ContentTypes;
use App\Http\Controllers\Controller;
use App\Models\ContentEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Website content editor for the committee (content editors and super admins).
 * Plain content: no use-case layer (see docs/adr/0001). Every save is recorded
 * in the activity log with who made it.
 */
class ContentController extends Controller
{
    public function index(): Response
    {
        $latest = ContentEntry::query()
            ->with('editor:id,name')
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy('type')
            ->map(fn ($entries) => $entries->first());

        $types = collect(ContentTypes::all())->map(fn ($t, $key) => [
            'key' => $key,
            'label' => $t['label'],
            'description' => $t['description'] ?? null,
            'kind' => $t['kind'],
            'url' => $t['url'],
            'count' => $t['kind'] === 'collection' ? ContentEntry::query()->where('type', $key)->count() : null,
            'updated' => $this->stamp($latest->get($key)),
        ])->values();

        return Inertia::render('admin/content/index', ['types' => $types]);
    }

    /** A single page's form, or a collection's list. */
    public function show(string $type): Response
    {
        $definition = ContentTypes::get($type);

        if ($definition['kind'] === 'collection') {
            return Inertia::render('admin/content/list', [
                'type' => $this->typeProps($type, $definition),
                'entries' => ContentEntry::query()
                    ->with('editor:id,name')
                    ->where('type', $type)
                    ->orderBy('position')
                    ->get()
                    ->map(fn (ContentEntry $e) => [
                        'id' => $e->id,
                        'columns' => collect($definition['columns'])->mapWithKeys(fn ($c) => [$c => $this->display($definition, $c, $e->data[$c] ?? null)]),
                        'updated' => $this->stamp($e),
                    ]),
            ]);
        }

        $entry = ContentEntry::query()->with('editor:id,name')->where('type', $type)->first();

        return Inertia::render('admin/content/edit', [
            'type' => $this->typeProps($type, $definition),
            'entry' => $entry ? ['id' => $entry->id, 'data' => $entry->data, 'updated' => $this->stamp($entry)] : null,
            'blank' => ContentSchema::blank($definition['fields']),
            'action' => route('admin.content.update-single', $type),
            'method' => 'put',
        ]);
    }

    public function updateSingle(Request $request, string $type): RedirectResponse
    {
        $definition = $this->singleOrAbort($type);
        $data = $this->validated($request, $definition);

        ContentEntry::query()->updateOrCreate(['type' => $type], ['data' => $data, 'updated_by' => $request->user()->id]);

        return back()->with('success', "{$definition['label']} saved. The website now shows your changes.");
    }

    public function create(string $type): Response
    {
        $definition = $this->collectionOrAbort($type);

        return Inertia::render('admin/content/edit', [
            'type' => $this->typeProps($type, $definition),
            'entry' => null,
            'blank' => ContentSchema::blank($definition['fields']),
            'action' => route('admin.content.store', $type),
            'method' => 'post',
        ]);
    }

    public function store(Request $request, string $type): RedirectResponse
    {
        $definition = $this->collectionOrAbort($type);
        $data = $this->validated($request, $definition);

        $positions = ContentEntry::query()->where('type', $type);
        $position = $definition['new_first'] ? ($positions->min('position') ?? 0) - 1 : ($positions->max('position') ?? -1) + 1;

        ContentEntry::query()->create(['type' => $type, 'data' => $data, 'position' => $position, 'updated_by' => $request->user()->id]);

        return to_route('admin.content.show', $type)->with('success', 'Added. It is now on the website.');
    }

    public function edit(string $type, ContentEntry $entry): Response
    {
        $definition = $this->collectionOrAbort($type);
        abort_unless($entry->type === $type, 404);
        $entry->load('editor:id,name');

        return Inertia::render('admin/content/edit', [
            'type' => $this->typeProps($type, $definition),
            'entry' => ['id' => $entry->id, 'data' => $entry->data, 'updated' => $this->stamp($entry)],
            'blank' => ContentSchema::blank($definition['fields']),
            'action' => route('admin.content.update', [$type, $entry]),
            'method' => 'put',
        ]);
    }

    public function update(Request $request, string $type, ContentEntry $entry): RedirectResponse
    {
        $definition = $this->collectionOrAbort($type);
        abort_unless($entry->type === $type, 404);

        $entry->update(['data' => $this->validated($request, $definition), 'updated_by' => $request->user()->id]);

        return to_route('admin.content.show', $type)->with('success', 'Saved. The website now shows your changes.');
    }

    public function destroy(string $type, ContentEntry $entry): RedirectResponse
    {
        $this->collectionOrAbort($type);
        abort_unless($entry->type === $type, 404);
        $entry->delete();

        return to_route('admin.content.show', $type)->with('success', 'Deleted from the website.');
    }

    /** Moves an entry one place up or down in its list. */
    public function move(Request $request, string $type, ContentEntry $entry): RedirectResponse
    {
        $this->collectionOrAbort($type);
        abort_unless($entry->type === $type, 404);
        $direction = $request->validate(['direction' => ['required', 'in:up,down']])['direction'];

        $neighbour = ContentEntry::query()
            ->where('type', $type)
            ->where('position', $direction === 'up' ? '<' : '>', $entry->position)
            ->orderBy('position', $direction === 'up' ? 'desc' : 'asc')
            ->first();

        if ($neighbour) {
            [$entry->position, $neighbour->position] = [$neighbour->position, $entry->position];
            $entry->save();
            $neighbour->save();
        }

        return back();
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate(['image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120']]);

        $path = $request->file('image')->storeAs(
            'content/'.now()->format('Y/m'),
            Str::ulid().'.'.$request->file('image')->extension(),
            'public',
        );

        return response()->json(['path' => '/storage/'.$path]);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, array $definition): array
    {
        $request->merge(['data' => ContentSchema::withoutBlankParagraphs($definition['fields'], $request->input('data'))]);
        $validated = $request->validate(ContentSchema::rules($definition['fields']), [], $this->attributeNames($definition['fields']));

        return ContentSchema::clean($definition['fields'], $validated['data']);
    }

    /** Friendly names in error messages, e.g. "Title" instead of "data.title". */
    private function attributeNames(array $fields, string $prefix = 'data'): array
    {
        $names = [];
        foreach ($fields as $f) {
            $key = "{$prefix}.{$f['name']}";
            $names[$key] = $f['label'];
            if (in_array($f['type'], ['group', 'repeater'], true)) {
                $names += $this->attributeNames($f['fields'], $f['type'] === 'repeater' ? "{$key}.*" : $key);
            }
        }

        return $names;
    }

    private function typeProps(string $key, array $definition): array
    {
        return ['key' => $key] + collect($definition)->only(['label', 'description', 'kind', 'url', 'fields', 'columns'])->all();
    }

    private function display(array $definition, string $column, mixed $value): ?string
    {
        $field = collect($definition['fields'])->firstWhere('name', $column);

        return $field && $field['type'] === 'select' ? ($field['options'][$value] ?? $value) : $value;
    }

    private function stamp(?ContentEntry $entry): ?array
    {
        return $entry ? ['at' => $entry->updated_at?->toIso8601String(), 'by' => $entry->editor?->name] : null;
    }

    private function singleOrAbort(string $type): array
    {
        $definition = ContentTypes::get($type);
        abort_unless($definition['kind'] === 'single', 404);

        return $definition;
    }

    private function collectionOrAbort(string $type): array
    {
        $definition = ContentTypes::get($type);
        abort_unless($definition['kind'] === 'collection', 404);

        return $definition;
    }
}
