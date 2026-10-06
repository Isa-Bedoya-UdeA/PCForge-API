# AGENTS.md

## 1. Project Context

### Purpose

This repository contains `pcforge-api`, a read-oriented REST API for the PCForge Mobile component catalog. All implementations follow approved specifications, verified scripts, and tests.

### Source of Truth Hierarchy

1. `CONSTITUTION.md` — non-negotiable engineering principles.
2. `SPEC.md` — product behavior and scope.
3. `REQUIREMENTS.md` — testable requirements and acceptance criteria.
4. `PLAN.md` — approved implementation strategy.
5. `ARCHITECTURE.md` — architectural structure and decisions.
6. `AGENTS.md` — operational instructions for agents.

The user's explicitly approved stack is also a binding constraint: Node.js, Express 5, TypeScript, JSON catalog data, and pnpm. If any project document conflicts with it, stop and report the conflict; do not silently choose a replacement. If a required document is absent, mark the decision unresolved rather than inventing it.

---

## 2. Required Documentation Before Coding

Before modifying code, read the following repository-root documents when present:

- [x] `CONSTITUTION.md`
- [x] `SPEC.md`
- [x] `REQUIREMENTS.md`
- [x] `PLAN.md`
- [x] `ARCHITECTURE.md`
- [x] `USERJOURNEY.md`
- [x] `API.md`
- [x] `SECURITY.md`
- [ ] `DEPLOY.md` (Not Applicable; no deployment in scope)
- [x] `README.md` and any existing `AGENTS.md`

`DATABASE.md`, `FIRESTORE.md`, `NAVIGATIONMAP.md`, and `DESIGNSYSTEM.md` are not API implementation prerequisites for the JSON-only MVP. Read them only if an approved change makes them relevant. No external database, Firebase, user persistence, or runtime BuildCores integration is part of the current API scope.

If `PLAN.md`, `CONSTITUTION.md`, or another required document has not been created yet, do not fabricate its decisions. Keep work within the approved SPEC and ARCHITECTURE and surface unresolved decisions before implementation depends on them.

---

## 3. Development Environment

| Item | Value |
| --- | --- |
| Runtime | Latest stable Node.js at scaffold time; record the exact version in project configuration |
| Package Manager | pnpm only |
| Language | TypeScript |
| Framework | Express 5 |
| IDE | VS Code |
| Build System | Project scripts and TypeScript configuration; not defined until scaffold |

The API is an independent repository named `pcforge-api`, not a workspace package in a mobile/API monorepo. Use the latest stable Node.js and Express 5 releases available when scaffolding and record their exact versions in project configuration. Do not add npm, Yarn, Bun, or another package manager.

---

## 4. Canonical Commands

Use pnpm for every package operation and never translate commands to npm.

### Install

```text
pnpm install
```

### Development

```text
pnpm dev
```

### Build

```text
pnpm build
```

### Tests

```text
pnpm test
```

### Lint

```text
pnpm lint
```

### Format

```text
pnpm format
```

### Type Check / Static Analysis

```text
pnpm typecheck
```

### Other Required Checks

```text
pnpm test:integration
pnpm validate:data
```

These verified scripts are defined in `package.json` and executed via pnpm.

---

## 5. Coding Style

### Language

- Code, identifiers, comments, and technical documentation: English.
- API error messages: follow the contract in `API.md`; keep the response structure stable and safe.
- User-facing progress and explanations: Spanish unless the user requests another language.
- Do not add comments that merely narrate code; explain only non-obvious decisions where needed.

### Naming

- Variables and functions: `camelCase`.
- Classes, types, and interfaces: `PascalCase`.
- Files: follow the established layer-and-purpose names, such as `components.controller.ts`, `components.service.ts`, and `component-response.dto.ts`.
- Routes and tests: follow existing project conventions once the scaffold defines them; do not invent a test runner or filename convention.

### Quotes

- Follow the formatter and lint configuration established by the scaffold.
- If no quote rule exists, preserve the surrounding file's style; do not reformat unrelated code.

### Imports

- Follow the configured TypeScript module resolution and import ordering.
- Preserve the architecture's inward dependency direction: routes → controllers → services → repositories → data adapters.
- Do not import private internals across layers or create circular dependencies.
- Do not add path aliases unless the project configuration and architecture approve them.

### Error Handling

- Validate untrusted route, query, and dataset input at the appropriate boundary.
- Keep controllers responsible for HTTP translation and services independent of Express request/response objects.
- Use the shared application error model and centralized error middleware defined by the API contract.
- Return safe JSON errors; never expose stack traces, secrets, absolute paths, or raw dependency errors.
- Do not treat missing hardware specifications as zero or invent values.

### Logging

- Follow the approved logging setup; the architecture permits console or structured logging initially.
- Log diagnostic context internally without secrets or unnecessary component/user data.
- Never return internal logs or stack traces to clients.

---

## 6. Architecture and Implementation Rules

- Keep the service a layered modular monolith: routes, controllers, services, repositories, and JSON data adapters.
- Only the JSON adapter/data layer may read catalog files from the filesystem. Services must not load JSON directly; controllers must not access files.
- Keep downloaded BuildCores OpenDB folders unchanged as a version-controlled local snapshot. Normalize selected fields through the JSON adapter; do not add a runtime dependency on a BuildCores-hosted service.
- The API is read-only for catalog data. Do not add user accounts, builds/favorites persistence, database access, Firebase, or admin CRUD.
- Use Express 5 and TypeScript. Do not substitute frameworks or add microservices.
- Validate and normalize prepared dataset records before serving them. Preserve source identifiers/metadata as required without exposing raw paths.
- Keep category names, stable IDs, query behavior, response schemas, and safe error structures consistent with `API.md` and the SPEC.
- Apply only documented search fields and supported category-specific filters; reject unsupported filters rather than silently ignoring them.
- Configure CORS for localhost development origins only. Do not add wildcard access or non-local origins; no deployment is planned.
- Compatibility and power calculations belong to the mobile client in the MVP.
- Agents must follow the approved architecture and must not introduce architectural patterns without approval.

---

## 7. Dependency Rules

### Allowed

- The approved runtime stack: Node.js, Express 5, and TypeScript.
- Small validation, test, security, and logging packages only when supported by the approved plan and scaffold.
- pnpm as the sole package manager.

### Prohibited

- npm, Yarn, Bun, or a second package manager/workspace tool.
- PostgreSQL, MongoDB, Prisma, or any mandatory external database for the MVP.
- Firebase, Firestore, authentication, ecommerce, payment, or retailer integrations in this API.
- Runtime BuildCores/OpenDB clients, microservices, workers, or caching dependencies without an approved requirement.

### Adding Dependencies

Before adding a dependency:

1. Check whether Node.js, TypeScript, Express, or an existing project package already provides the capability.
2. Confirm that it preserves the layered architecture and Express 5 compatibility.
3. Review maintenance, license, security, and classroom setup impact.
4. Obtain user approval before adding dependencies or expanding the approved stack.
5. Install and update the lockfile only with pnpm; never edit `pnpm-lock.yaml` manually.

---

## 8. File and Directory Boundaries

These paths describe the eventual API repository root after the user moves this document and scaffolds the project.

### May Modify Freely

- `src/**` for a requested behavior within the approved architecture.
- `test/**` or the test directory established by the scaffold.
- Relevant repository documentation when the change requires it.

### Modify With Caution

- `data/**`: preserve downloaded OpenDB source files unchanged. The adapter maps source fields; never invent hardware specifications or modify the snapshot during normal implementation work.
- `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, and test/lint/format configuration.
- API DTOs, route contracts, category constants, CORS policy, and error middleware because they affect clients or cross-cutting behavior.
- `.env.example` and runtime configuration; keep examples non-secret.

### Do Not Modify Without Explicit Approval

- Repository scaffolding, project generators, or the currently empty `code/api` placeholder.
- The approved stack, API contract, data schema, canonical category names, or source data preparation policy.
- CORS origin scope, security controls, or environment/secret handling.
- Any external database, authentication, cloud service, or user-data persistence boundary.

### Generated Files

- Do not hand-edit build output such as `dist/**`, coverage output, or generated declarations.
- Do not hand-edit the pnpm lockfile; update it only through pnpm when an approved manifest change requires it.
- Preserve generated files that are already in the worktree unless the task explicitly concerns them.

### Secrets

- Never commit `.env`, credentials, private keys, tokens, or production data.
- Keep `.env.example` limited to names and safe placeholders.
- Do not print secrets in logs, test output, errors, or documentation.

---

## 9. Communication Rules

- Communicate with the user in Spanish unless asked otherwise.
- Write source identifiers, comments, and technical documents in English, consistent with project docs.
- Report progress before substantial edits and state when project commands are unavailable because the scaffold is pending.
- Ask when a request would resolve an open product/API decision or expand the approved stack; do not ask about routine implementation details already settled by the docs.

---

## 10. Scope Rules

Agents must not:

- create the project, run a scaffold generator, install packages, or populate the empty `code/api` directory unless explicitly asked
- add unrequested features or change approved requirements silently
- replace Express 5, TypeScript, JSON, or pnpm without approval
- introduce a database, authentication, cloud persistence, microservices, or runtime BuildCores integration
- change the public API contract, categories, or source schema without updating the appropriate docs and obtaining approval when behavior changes
- modify unrelated files without justification
- weaken validation, CORS, safe-error handling, or secret controls to make implementation easier
- remove tests to make a test suite pass or claim a check passed when no command exists

---

## 11. Verification and Definition of Done

Before considering an implementation task complete:

- [ ] Formatting passes using the configured project tool, when present.
- [ ] Lint passes using the configured project script, when present.
- [ ] Type checking/static analysis passes using the configured project script, when present.
- [ ] Relevant unit and API integration tests pass.
- [ ] Build passes when a build script is defined.
- [ ] Dataset validation passes when catalog data or its loader changes.
- [ ] CORS, validation, safe errors, and API contract behavior are verified for affected routes.
- [ ] Changed behavior matches `SPEC.md`, `REQUIREMENTS.md`, and `API.md`.
- [ ] No unrelated changes or secrets were introduced.
- [ ] Documentation and acceptance criteria were updated when behavior changed.

### Required Verification Command

```text
pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration && pnpm validate:data && pnpm build
```

### If Verification Fails

Do not declare the task complete. Report:

1. The exact command executed.
2. The failure and affected area.
3. Whether the failure appears related to the change.
4. Any checks that could not run because the project is not scaffolded.
5. The next required action.

---

## 12. Agent Workflow

1. Read the required documentation and identify unresolved product/API decisions.
2. Inspect the relevant implementation and existing tests; do not assume the architecture sketch has already been scaffolded.
3. Map the change to requirement IDs and acceptance criteria.
4. Implement the smallest compliant change within the approved layers.
5. Run the verified pnpm checks relevant to the change; never substitute npm or invent missing scripts.
6. Review the diff for contract changes, source-data integrity, secrets, and unrelated edits.
7. Update documentation when requirements, contract, or operational behavior changes.
8. Report the result, commands run, and any unavailable verification.
