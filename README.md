# Senanayake PPA Platform

Members' platform for the Past Pupils' Association of Senanayake Central College, Madampe.
Laravel 12 · Inertia 2 · React 19 · TypeScript · Tailwind · shadcn/ui.

## Run locally

```bash
composer install && npm install
cp .env.example .env && php artisan key:generate
php artisan migrate --seed     # roles, local logins and the website content
php artisan storage:link       # makes uploaded images public
composer run dev               # Laravel + Vite + queue + logs
```

Local logins (seeded, development only): `admin@ppa.test` (super admin) and
`editor@ppa.test` (content editor), password `password`.

## Checks

```bash
php artisan test               # Pest: unit + feature tests
vendor/bin/deptrac analyse     # architecture rules
vendor/bin/pint                # code style
```

## Architecture

Use-case-driven Clean Architecture. See [docs/adr/0001-clean-architecture.md](docs/adr/0001-clean-architecture.md).

```
app/Domain/          entities, value objects, rules (no Laravel)
app/Application/     use cases + ports (interfaces)
app/Infrastructure/  adapters: Eloquent, PayHere, email/SMS
app/Http/            thin controllers: validate → one use case → response
resources/js/pages/  public/, member/, admin/ React pages (Inertia)
tests/Fakes/         in-memory adapters for fast use-case tests
```

### Reference slice: membership applications

| Step | File |
|---|---|
| Page | `resources/js/pages/member/apply.tsx` |
| Validation | `app/Http/Requests/Member/SubmitApplicationRequest.php` |
| Controller | `app/Http/Controllers/Member/ApplicationController.php` |
| Use case | `app/Application/Membership/UseCases/SubmitApplication.php` |
| Rules | `app/Domain/Membership/Member.php`, `Batch.php` |
| Storage | `app/Infrastructure/Persistence/EloquentMemberRepository.php` |
| Wiring | `app/Providers/DomainServiceProvider.php` |
| Tests | `tests/Unit/Application/ApproveApplicantTest.php`, `tests/Feature/Membership/` |

Approval (`ApproveApplicant`) follows the same path from `/admin/applicants`.
Batch representatives can approve only their own batch; numbers continue from the
highest existing M-number, so imported legacy members keep theirs.

## Public website

Pages live in `resources/js/pages/public/` and share `layouts/public-layout.tsx`.
Their content is stored in the `content_entries` table and read through
`App\Support\SiteContent`. The starting content, extracted from the old
senanayakeppa.lk site, is in `resources/content/*.json` and is loaded with
`php artisan content:import` (run by the seeder; it never overwrites edited content).

## Website content editor

`/admin/content`, for the **content-editor** and **super-admin** roles.

- Every editable part of the site is defined once in `app/Content/ContentTypes.php`:
  its fields, and whether it is a single page or a list (news, projects).
- The React editor (`resources/js/components/admin/content-fields.tsx`) draws the form
  from those fields, including repeating groups (slides, officers, donors, clauses).
- `app/Content/ContentSchema.php` turns the same fields into server-side validation.
- Images are uploaded to `storage/app/public/content` (run `php artisan storage:link`).
- Every save is recorded in the activity log with who made it.

To make something new editable, add a type or field in `ContentTypes.php`; no new
screens are needed. Local editor login: `editor@ppa.test` / `password`.

| URL | Page |
|---|---|
| `/` | Home: highlights, 80th anniversary, message, join, upcoming event, news, projects |
| `/college/history`, `/college/principals` | Founder and history; all 29 principals |
| `/association/goals`, `/association/office-bearers` | Goals (clause 3); 2026/2027 committee |
| `/membership` | Fees and constitution clause 4 |
| `/projects`, `/projects/sponsors`, `/projects/donors` | Projects, sponsors, donors, bank details |
| `/news`, `/contact` | News and notices; contacts |

## Not built yet

PayHere gateway, email/SMS notifiers (a log notifier stands in), member import,
Sinhala translations, MySQL production config. Folders are in place for each.
