# ADR 0001: Use-case-driven Clean Architecture

**Status:** accepted · 2026-11-25

## Decision

The platform's business rules (membership, payments, fundraising, events) are built as
use cases on Clean Architecture, inside a single Laravel + Inertia + React application.

| Layer | Folder | May depend on |
|---|---|---|
| Domain | `app/Domain` | nothing |
| Application | `app/Application` | Domain |
| Infrastructure | `app/Infrastructure` | Application, Domain, Laravel |
| Interface | `app/Http`, jobs, listeners | Application, Domain, Laravel |

The rule is enforced in CI by Deptrac (`deptrac.yaml`).

Simple content (news, pages, galleries, office bearers) does not use this layering:
plain controllers, Form Requests and policies are enough.

## Why

- The system handles members' money and personal data; rules must not be bypassable.
- Use cases are testable without a database (see `tests/Fakes`).
- Gateways and services (PayHere, email, SMS) can be swapped by changing one binding
  in `App\Providers\DomainServiceProvider`.

## Consequences

More files per feature (entity, use case, port, adapter). New developers read this ADR
and copy the membership slice (`SubmitApplication`, `ApproveApplicant`) as the pattern.
