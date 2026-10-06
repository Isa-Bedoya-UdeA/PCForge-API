# Project Constitution

| Field | Value |
| --- | --- |
| Project | PCForge API |
| Document | Constitution |
| Version | 0.1 |
| Status | Draft |
| Last Updated | 2026-10-01 |

## 1. Purpose

This constitution defines the non-negotiable engineering principles for the PCForge API repository. It governs specifications, requirements, plans, architecture, implementation, tests, and operational documentation. The repository is not scaffolded yet; these principles apply when the user creates `pcforge-api` and moves the staged documents into it.

## 2. Authority and Precedence

### Source of Truth

The constitution establishes engineering constraints. `SPEC.md` defines product behavior; `REQUIREMENTS.md` makes that behavior testable; `PLAN.md` records the approved implementation strategy; `ARCHITECTURE.md` defines module boundaries; and `AGENTS.md` defines operational workflows. API contract and security details belong in `API.md` and `SECURITY.md` when those documents are created.

### Conflict Resolution

Do not silently resolve conflicts. Stop the affected work, identify the conflicting statements and documents, and ask the user to decide. An approved product change must update `SPEC.md` first, followed by affected requirements, plan, architecture, and implementation guidance.

---

## 3. Non-Negotiable Principles

### P-001 — Specification Authority

#### 3.1.1 Principle

Approved product specifications define API behavior and scope.

#### 3.1.2 Rule

Implement only behavior traceable to the approved SPEC and REQUIREMENTS. If implementation or source-data inspection reveals a contradiction or missing decision, ask before choosing behavior.

#### 3.1.3 Verification

Review changed routes and tests against the corresponding feature, FR, AC, and API contract.

### P-002 — Layered Separation of Concerns

#### 3.2.1 Principle

HTTP transport, catalog use cases, repository access, and source-file access have separate responsibilities.

#### 3.2.2 Rule

Preserve the approved flow `routes → controllers → services → repositories → JSON adapter`. Controllers do not read files, services do not depend on Express request/response objects, and only the data adapter owns filesystem access and source mapping.

#### 3.2.3 Verification

Review imports and dependency direction; unit-test services independently from Express and filesystem access.

### P-003 — Tests as a Quality Gate

#### 3.3.1 Principle

Relevant automated tests must pass before work is complete.

#### 3.3.2 Rule

Changes to routes, validation, filters, pagination, source mapping, or error handling require affected unit and integration tests. Never remove or weaken a test to hide a failure.

#### 3.3.3 Verification

After scaffold, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:integration`, `pnpm validate:data`, and `pnpm build` as applicable. These scripts must be defined in the API package; they cannot run before scaffold.

### P-004 — SOLID and Proportional Design

#### 3.4.1 Principle

Apply SOLID principles to keep catalog behavior focused and replaceable without adding ceremony.

#### 3.4.2 Rule

Keep controllers, services, repositories, adapters, and validation responsibilities cohesive. Add an abstraction only for a real boundary or testing need; do not introduce a DI framework, microservices, or a universal repository abstraction without approval.

#### 3.4.3 Verification

Review each changed module for one clear responsibility, inward dependency direction, and absence of circular dependencies or unnecessary abstractions.

### P-005 — Language Convention

#### 3.5.1 Principle

Consistent language makes code and technical collaboration clear.

#### 3.5.2 Rule

Write code, identifiers, comments, and technical documents in English. Communicate progress and explanations to the user in Spanish unless requested otherwise. API response language follows the approved API contract.

#### 3.5.3 Verification

Review changed identifiers, docs, and response messages for consistency with this convention and `API.md`.

### P-006 — No Silent Scope Expansion

#### 3.6.1 Principle

Unapproved product, dependency, or architecture changes are prohibited.

#### 3.6.2 Rule

Use Node.js, Express 5, TypeScript, pnpm, and local JSON data. Do not add a database, authentication, cloud service, user persistence, runtime BuildCores integration, ecommerce, workers, or microservices without explicit approval.

#### 3.6.3 Verification

Review manifest, lockfile, source, and documentation diffs against SPEC and REQUIREMENTS before accepting a change.

### P-007 — Security and Data Integrity by Default

#### 3.7.1 Principle

Untrusted input, source data, and internal diagnostics must be handled safely.

#### 3.7.2 Rule

Validate request parameters and mapped source records. Preserve missing specifications as missing; do not invent hardware data. Return consistent safe JSON errors without secrets, stack traces, or filesystem paths. Keep CORS restricted to approved localhost development origins. Store the downloaded OpenDB snapshot unchanged; expose only approved normalized component fields.

#### 3.7.3 Verification

Test invalid inputs, malformed source data, safe errors, CORS policy, deterministic responses, and that source files are not mutated.

### P-008 — Documentation Consistency

#### 3.8.1 Principle

Product and technical documentation must agree with delivered behavior.

#### 3.8.2 Rule

When an approved behavior, response, source-mapping, or operational decision changes, update the relevant SPEC, REQUIREMENTS, API contract, architecture, and agent guidance. Do not place unresolved product questions in the SPEC; ask the user and document only approved outcomes.

#### 3.8.3 Verification

Review links, IDs, acceptance criteria, API examples, and architecture boundaries after each documentation-affecting change.

---

## 4. Engineering Quality Gates

| Gate | Required Condition | Verification |
| --- | --- | --- |
| Specification | Every externally observable behavior has approved scope | SPEC and API contract review |
| Requirements | Changed behavior maps to FRs and testable ACs | REQUIREMENTS traceability review |
| Architecture | Layer boundaries and source-adapter ownership are preserved | Dependency/import review |
| Tests | Affected unit and integration tests pass | pnpm scripts established at scaffold |
| Security | Input, CORS, errors, and source data are handled safely | Validation, integration, and data-integrity tests |
| Documentation | API behavior and operational commands match implementation | Cross-document review |

---

## 5. Forbidden Practices

* Use npm, Yarn, Bun, or a second package manager instead of pnpm.
* Modify original OpenDB snapshot files as part of normal application logic.
* Expose OpenDB metadata, absolute paths, raw stack traces, secrets, or internal errors.
* Silently ignore unsupported query filters or invent component specifications.
* Add a database, cloud service, authentication, public deployment, or new product capability without approval.
* Broaden CORS to wildcard or non-local origins for convenience.

---

## 6. Exceptions

Only the user/product owner may approve an exception. Record its scope, rationale, affected principles, verification plan, and expiry/review date in the relevant decision document before implementation. An exception does not implicitly authorize unrelated changes.

## 7. Amendment Process

1. Propose the principle change with rationale and affected product/technical documents.
2. Obtain explicit user approval and update this constitution's version, status, and change history if maintained.
3. Propagate the approved change to SPEC, REQUIREMENTS, PLAN, ARCHITECTURE, AGENTS, API, and tests as applicable; review for conflicts.

---

## 8. Related Documentation

* [AGENTS.md](AGENTS.md)
* [SPEC.md](SPEC.md)
* [REQUIREMENTS.md](REQUIREMENTS.md)
* [ARCHITECTURE.md](ARCHITECTURE.md)
* [USERJOURNEY.md](USERJOURNEY.md)
