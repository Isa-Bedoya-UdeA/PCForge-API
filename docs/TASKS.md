# Tasks

## Document Information

| Field | Value |
| -------------------- | ------------------------------------------- |
| Project | `PCForge API` |
| Document | Tasks |
| Version | `0.1` |
| Status | In Progress |
| Last Updated | `2026-10-05` |
| Source Specification | [`SPEC.md`](SPEC.md) |
| Source Requirements | [`REQUIREMENTS.md`](REQUIREMENTS.md) |
| Source Plan | [`PLAN.md`](PLAN.md) |

---

## 1. Purpose

This file converts the approved API specification, requirements, architecture, and technical plan into executable milestones. It records already completed documentation and scaffold work separately from implementation that remains in progress. Tasks do not add product scope.

## 2. Task Planning Principles

* Tasks trace to approved documentation or an explicitly identified technical prerequisite.
* Tasks do not introduce undocumented product scope.
* Each implementation task has an objective validation path.
* Completed tasks remain checked only when repository evidence confirms completion.
* Blocked work identifies the specific decision or dependency.
* Tests are part of implementation, not an optional final phase.
* Use pnpm only. Do not run commands whose package scripts are not yet implemented.

## 3. Traceability Summary

| Task / Milestone | Requirement / Feature | Technical Reference | Validation |
| ---------------- | --------------------- | ------------------- | --------------------- |
| M0 — Docs and scaffold baseline | All current SPEC features; NFR-001, NFR-005, NFR-006 | Existing docs, `package.json`, `src/`, `data/schemas/` | Repository inventory and Markdown diagnostics |
| M1 — Contract and source mapping | FR-001 to FR-006, FR-010, FR-012; NFR-002, NFR-003 | PLAN sections 5–9, 23; API.md | Reviewed contract, fixtures, source/schema inspection |
| M2 — Snapshot loading and data validation | FR-002, FR-003, FR-012; NFR-002, NFR-005 | PLAN sections 5–7, 17 | Snapshot validation, Ajv validator, and adapter/repository unit tests |
| M3 — HTTP and catalog implementation | FR-001 to FR-011; NFR-003, NFR-004, NFR-007 | PLAN sections 4–5, 8–9, 12, 15 | Supertest integration tests and service unit tests |
| M4 — CI/CD, Documentation and Readiness | FR-007; NFR-001 to NFR-007 | PLAN sections 16, 18, 21–22 | `.github/workflows/build.yml`, clean pnpm install, CI run, API.md, SECURITY.md |

## 4. Milestones

### Milestone 0 — Documentation and Scaffold Baseline (Completed)

#### Objective — M0

Establish the API product/engineering documentation and the pnpm/TypeScript/Express repository skeleton.

#### Scope — M0

* API specification, requirements, user journey, architecture, constitution, agent instructions, and README.
* Initial source/test directories and package manifest.
* Imported source schemas and the currently available CPU snapshot.

#### Dependencies — M0

* None.

#### Exit Criteria — M0

* [x] `SPEC.md`, `REQUIREMENTS.md`, `USERJOURNEY.md`, `ARCHITECTURE.md`, `CONSTITUTION.md`, `AGENTS.md`, and `README.md` exist.
* [x] pnpm manifest/lockfile and initial Express 5/TypeScript scaffold exist.
* [x] Source module directories and unit/integration test directories exist.
* [x] OpenDB schema files are present under `data/schemas/`.
* [x] A CPU source category is present under `data/opendb/CPU/`.

#### Tasks — M0

##### M0-T01 — Establish API Product Documentation

**Traceability:** `SPEC.md`, `REQUIREMENTS.md`, `USERJOURNEY.md`

**Dependencies:** None

**Description:** Record the API scope, functional/non-functional requirements, acceptance criteria, and user flows.

**Acceptance / completion checks:**

* [x] Product documents exist and preserve the approved read-only/local-first scope.
* [x] Requirement IDs and User Flow IDs are present for API features.

---

##### M0-T02 — Establish API Architecture and Operating Rules

**Traceability:** `ARCHITECTURE.md`, `CONSTITUTION.md`, `AGENTS.md`

**Dependencies:** M0-T01

**Description:** Define the layered API boundary, data adapter, pnpm-only policy, and engineering constraints.

**Acceptance / completion checks:**

* [x] Routes, controllers, services, repositories, and JSON adapter responsibilities are documented.
* [x] No database, runtime BuildCores service, or deployment is required by the MVP.

---

##### M0-T03 — Scaffold the API Repository

**Traceability:** NFR-001, NFR-005, NFR-006

**Dependencies:** M0-T02

**Description:** Create the Node.js/TypeScript/Express 5 pnpm package and initial module/test directories.

**Acceptance / completion checks:**

* [x] `package.json`, `pnpm-lock.yaml`, `src/`, `test/unit/`, and `test/integration/` exist.
* [x] Express 5, TypeScript, Zod, CORS, Vitest, and Supertest are present in the package manifest.

---

##### M0-T04 — Import OpenDB Schemas and Initial CPU Data

**Traceability:** FR-012, NFR-002

**Dependencies:** M0-T03

**Description:** Preserve the imported schemas and the available CPU source JSON unchanged.

**Acceptance / completion checks:**

* [x] OpenDB schemas exist under `data/schemas/`.
* [x] CPU records exist under `data/opendb/CPU/`.

---

##### M0-T05 — Establish Implementation Plan and Detailed Tasks

**Traceability:** `PLAN.md`, `TASKS.md`

**Dependencies:** M0-T01 to M0-T04

**Description:** Create authoritative technical plan and atomic task breakdown covering documentation, code, tests, and CI/CD.

**Acceptance / completion checks:**

* [x] `PLAN.md` created adhering to technical plan template and covering 25 required sections.
* [x] `TASKS.md` created adhering to task tracking template and mapping requirements to atomic steps.

---

### Milestone 1 — Contract and Source Mapping

#### Objective — M1

Resolve source-driven API details and freeze the HTTP contract before endpoint implementation depends on them.

#### Scope — M1

* Document route, query, pagination response, DTO, and error contracts.
* Inspect the imported OpenDB schemas and representative records.
* Import remaining categories needed by the approved mobile catalog.

#### Dependencies — M1

* M0 completed.

#### Exit Criteria — M1

* [x] `API.md` defines routes, parameter names, success/error envelopes, and pagination metadata.
* [x] Source-to-normalized mappings and supported filters are recorded per category.
* [x] Required OpenDB category folders are present unchanged.
* [x] Validator dependency choice (Ajv + ajv-formats) and Node version (24.x) are approved and recorded.

#### Tasks — M1

##### M1-T01 — Define the API Contract

**Traceability:** FR-001 to FR-011, NFR-003, NFR-004, NFR-007; PLAN TD-008, TD-009

**Dependencies:** M0-T01, M0-T05

**Description:** Complete `docs/API.md` with categories, component list/detail, health, query parameters, pagination metadata, response/error formats, and localhost CORS/LAN demo behavior.

**Acceptance / completion checks:**

* [x] Document `GET /api/health`, `GET /api/categories`, `GET /api/components`, and `GET /api/components/:id`.
* [x] Document 1-based `page`, `pageSize` default 50 and allowed values 10/20/30/40/50.
* [x] Specify total/totalPages representation and the response for `page > totalPages` (resolved: returns 404 Not Found as a non-existent resource).
* [x] List only supported search fields, filter names, and canonical category names.
* [x] Define standard 400, 404, and safe 500 response envelopes.
* [x] Record permitted localhost CORS origins and default port 3000 (with `0.0.0.0` binding for physical devices on same LAN; Metro bundler on 5562).

---

##### M1-T02 — Inspect and Complete the OpenDB Snapshot

**Traceability:** FR-001 to FR-006, FR-012, NFR-002

**Dependencies:** M0-T04

**Description:** Inspect representative category schemas/records and copy the remaining required `open-db/` category folders into `data/opendb/` without changing names or file contents.

**Acceptance / completion checks:**

* [x] Determine the mobile MVP category set from approved product documentation.
* [x] Record source fields needed for display, stable ID, search, filters, and client-side compatibility.
* [x] Record the category-to-schema mapping and missing/null behavior.
* [x] Compare copied files to source and confirm the upstream files are unchanged.
* [x] Do not expose the upstream metadata envelope or filesystem paths.

---

##### M1-T03 — Approve and Prepare the JSON Schema Validator

**Traceability:** FR-002, FR-012, NFR-002, NFR-005; PLAN TD-005

**Dependencies:** M1-T02

**Description:** Configure a validator capable of validating the upstream Draft-07 schemas, including declared formats. Ajv plus `ajv-formats` is approved by user.

**Acceptance / completion checks:**

* [x] User approves Ajv/ajv-formats (Approved: user confirmed adoption as best practice for Draft-07 schemas).
* [x] Install `ajv` and `ajv-formats` via pnpm (`pnpm add -D ajv ajv-formats`) and commit the lockfile change.
* [x] Verify the chosen validator against representative schemas and records before implementing the loader.

---

##### M1-T04 — Pin the Runtime and Package Scripts Baseline

**Traceability:** NFR-001, NFR-005, NFR-006; PLAN TD-010

**Dependencies:** M0-T03

**Description:** Confirm the classroom Node.js runtime, record it in `.node-version` and `engines`, and replace placeholder scripts with the agreed pnpm command set.

**Acceptance / completion checks:**

* [x] Runtime version is explicitly recorded (Node 24.x, matching local v24.13.1).
* [x] Add `.node-version` containing `24.13.1` (or `24`).
* [x] Define `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:integration`, and `validate:data` scripts in `package.json`.
* [x] `pnpm install --frozen-lockfile` succeeds from a clean checkout.
* [x] No npm, npx, Yarn, or Bun commands are added.

---

### Milestone 2 — Snapshot Loader and Repository (src/data, src/types, src/repositories, scripts)

#### Objective — M2

Safely load and validate the unchanged OpenDB snapshot, map source records to normalized application models using Ajv and `ajv-formats`, and expose deterministic read-only catalog operations through repository interfaces.

#### Scope — M2

* Domain and DTO types in `src/types/` and `src/constants/`.
* Data loading and Draft-07 schema validation in `src/data/loader.ts`.
* Repository boundary and in-memory implementation in `src/repositories/`.
* Offline data validation CLI script in `scripts/validate-data.ts`.
* Unit tests in `test/unit/` for loader, schema validation, and repository queries.

#### Dependencies — M2

* M1-T02 complete (categories present in `data/opendb/`).
* M1-T03 complete (Ajv and `ajv-formats` approved and installed).
* M1-T04 complete (Node 24 pinned and script baseline created).

#### Exit Criteria — M2

* [x] Startup loads all configured categories and fails fast with actionable internal diagnostics on missing/invalid files.
* [x] Source files in `data/opendb/` and `data/schemas/` remain 100% untouched and unmutated.
* [x] Normalized models expose only approved component fields; OpenDB metadata envelopes and local filesystem paths are completely omitted.
* [x] Repository returns deterministic category collections, stable ID lookups, and filtered/sorted/paginated results.
* [x] Data-validation script (`pnpm validate:data`) and unit tests in `test/unit/` pass.

#### Tasks — M2

##### M2-T01 — Define Normalized Component and Category Types

**Traceability:** FR-001, FR-002, FR-003, FR-006, FR-012; PLAN Section 6

**Dependencies:** M1-T02

**Description:** Add TypeScript types and constants for canonical categories and normalized component structures in `src/types/component.ts` and `src/constants/categories.ts`.

**Acceptance / completion checks:**

* [x] Create `src/types/component.ts` with `NormalizedComponent`, `ComponentCategory`, and specification types.
* [x] Create `src/constants/categories.ts` defining the list of canonical categories.
* [x] Stable ID is derived from the source JSON filename stem (e.g., `ebff2be8-...`).
* [x] Nullable and missing fields preserve source type distinct from zero/false.
* [x] OpenDB metadata envelopes (`metadata: { source, opendb_version, ... }`) are stripped from public models.

---

##### M2-T02 — Implement Snapshot Loader with Ajv Draft-07 Validation

**Traceability:** FR-002, FR-003, FR-012; NFR-002, NFR-003; PLAN TD-002, TD-003, TD-005

**Dependencies:** M1-T03, M2-T01

**Description:** Implement `src/data/loader.ts` to read JSON records from `data/opendb/<Category>/`, validate them against corresponding `data/schemas/<Category>.schema.json` using Ajv with `ajv-formats`, map approved fields, and build an in-memory index.

**Acceptance / completion checks:**

* [x] Implement `src/data/loader.ts` with pure filesystem reading (never mutating or writing files).
* [x] Initialize Ajv with Draft-07 support and `ajv-formats` for format validation (`date-time`, `uri`, etc.).
* [x] Build in-memory map/index keyed by category and stable ID with deterministic sort order.
* [x] Throw descriptive internal startup error if required files/schemas are missing or invalid, preventing server startup.
* [x] Create unit tests in `test/unit/loader.test.ts` verifying successful loading, missing file detection, schema violation reporting, and nullability preservation.

---

##### M2-T03 — Implement Component Repository Boundary

**Traceability:** FR-001, FR-002, FR-004, FR-005, FR-006; NFR-005; PLAN Section 5

**Dependencies:** M2-T02

**Description:** Implement repository interfaces and in-memory data access in `src/repositories/component.repository.ts` and `src/repositories/json-component.repository.ts`.

**Acceptance / completion checks:**

* [x] Define `ComponentRepository` interface in `src/repositories/component.repository.ts` free of Express types.
* [x] Implement `JsonComponentRepository` in `src/repositories/json-component.repository.ts` querying the in-memory loader data.
* [x] Implement `getCategories()` returning canonical categories.
* [x] Implement `findById(id: string)` returning component or null.
* [x] Implement `findMany(query)` applying case-insensitive search, category filtering, explicit specification filters, and deterministic sorting (by category, then ID).
* [x] Return matched total count alongside query results for pagination slicing.
* [x] Create unit tests in `test/unit/repository.test.ts` verifying filtering, search, sorting, and detail lookups.

---

##### M2-T04 — Implement Snapshot Validation Script

**Traceability:** FR-012; NFR-002, NFR-005; PLAN TD-005

**Dependencies:** M1-T04, M2-T02

**Description:** Implement `scripts/validate-data.ts` to validate all records in `data/opendb/` against `data/schemas/` as an offline check callable via `pnpm validate:data`.

**Acceptance / completion checks:**

* [x] Implement `scripts/validate-data.ts` using the shared Ajv validator and loader logic.
* [x] Traverses each category folder in `data/opendb/` and validates every `.json` file against its matching `.schema.json`.
* [x] Output reports passed/failed counts, identifying failing filenames and schema paths without mutating files.
* [x] Exits with code `0` on 100% validity, code `1` on any validation failure.
* [x] Wire script into `package.json` under `"validate:data": "tsx scripts/validate-data.ts"`.

---

### Milestone 3 — HTTP API, Middleware, and Controllers (src/app, src/controllers, src/routes, src/middleware)

#### Objective — M3

Build the Express 5 HTTP layer, request validation, centralized error handling, and catalog endpoints, verifying them with Supertest integration tests.

#### Scope — M3

* Server entry point and Express factory in `src/app.ts` and `src/server.ts`.
* Config and environment handling in `src/config/env.ts`.
* DTOs and Zod validation in `src/dto/` and `src/middleware/validation.ts`.
* Error handling and safe responses in `src/errors/` and `src/middleware/error-handler.ts`.
* Controllers and services in `src/controllers/` and `src/services/`.
* Routes in `src/routes/`.
* Integration tests in `test/integration/`.

#### Dependencies — M3

* M1-T01, M1-T04, M2-T01, M2-T02, M2-T03.

#### Exit Criteria — M3

* [x] Endpoints `GET /api/health`, `GET /api/categories`, `GET /api/components`, and `GET /api/components/:id` fully implemented according to `PLAN.md` and `API.md`.
* [x] Request query parameters validated with Zod; invalid parameters return 400.
* [x] `page > totalPages` returns standard 404 Not Found error (TD-008).
* [x] Unknown component ID returns 404 Not Found; unknown category returns 400 Client Error.
* [x] Express server binds to `0.0.0.0:3000` by default allowing physical device LAN demo access (TD-009).
* [x] Comprehensive Supertest integration tests pass in `test/integration/`.

#### Tasks — M3

##### M3-T01 — Implement Config, Errors, Middleware, and App Bootstrap

**Traceability:** FR-007, FR-008, FR-009, FR-010, FR-011; NFR-003, NFR-004, NFR-007; PLAN TD-001, TD-008, TD-009

**Dependencies:** M1-T04, M2-T03

**Description:** Build `src/config/env.ts`, `src/errors/app-error.ts`, `src/errors/error-codes.ts`, `src/middleware/validation.ts`, `src/middleware/error-handler.ts`, `src/middleware/not-found.ts`, `src/app.ts`, and `src/server.ts`.

**Acceptance / completion checks:**

* [x] `src/config/env.ts` parses `PORT` (default `3000`), `HOST` (default `0.0.0.0`), and allowed CORS origins using Zod.
* [x] `src/errors/app-error.ts` defines structured `AppError` with HTTP status code and standardized error code.
* [x] `src/middleware/error-handler.ts` catches all errors and emits safe JSON responses (`{ error: { code, message, details? } }`), never leaking stack traces, filesystem paths, or secrets.
* [x] `src/middleware/not-found.ts` handles unmatched routes with a 404 JSON error.
* [x] `src/app.ts` exports an Express application factory separate from network listener for testing.
* [x] `src/server.ts` bootstraps dataset loader, starts listener on configured `HOST:PORT`, and gracefully reports startup failures.
* [x] Add unit tests in `test/unit/error-handler.test.ts` and `test/unit/validation.test.ts`.

---

##### M3-T02 — Implement Health and Categories Endpoints

**Traceability:** FR-001, FR-007, FR-008; PLAN Section 9

**Dependencies:** M3-T01, M2-T03

**Description:** Implement `src/controllers/health.controller.ts`, `src/controllers/categories.controller.ts`, `src/routes/health.routes.ts`, and `src/routes/categories.routes.ts`.

**Acceptance / completion checks:**

* [x] `GET /api/health` returns status `ok`, timestamp, and service metadata without exposing internal details.
* [x] `GET /api/categories` returns the list of canonical categories.
* [x] Mount routes under `/api` in `src/routes/index.ts`.
* [x] Add integration tests in `test/integration/health.test.ts` and `test/integration/categories.test.ts`.

---

##### M3-T03 — Implement Components Query, Filter, and Pagination Endpoints

**Traceability:** FR-002, FR-004, FR-005, FR-010; PLAN Section 7, TD-008

**Dependencies:** M3-T01, M2-T03

**Description:** Implement `src/dto/component-query.dto.ts`, `src/dto/component-response.dto.ts`, `src/services/components.service.ts`, `src/controllers/components.controller.ts`, and `src/routes/components.routes.ts` for paginated component queries.

**Acceptance / completion checks:**

* [x] `src/dto/component-query.dto.ts` validates `page` (positive integer, default 1), `pageSize` (allowed values: 10, 20, 30, 40, 50; default 50), `category`, `search`, and supported filters using Zod.
* [x] `src/services/components.service.ts` calculates `totalPages = Math.ceil(total / pageSize)`.
* [x] If `total > 0` and `page > totalPages`, return 404 Not Found (`PAGE_NOT_FOUND` error) per TD-008.
* [x] If `total === 0`, return 200 OK with `data: []`, `page: 1`, `pageSize`, `total: 0`, `totalPages: 0`.
* [x] Return paginated envelope: `{ data: [...], pagination: { page, pageSize, total, totalPages } }`.
* [x] Invalid parameters or unsupported filter keys return 400 Bad Request with field-level details.
* [x] Add integration tests in `test/integration/components.test.ts` covering normal pagination, default page size, 404 on `page > totalPages`, filtering, search, and invalid parameter rejection.

---

##### M3-T04 — Implement Component Detail Endpoint

**Traceability:** FR-003, FR-006, FR-009; PLAN Section 9

**Dependencies:** M3-T01, M2-T03

**Description:** Implement `GET /api/components/:id` in `src/controllers/components.controller.ts` and `src/services/components.service.ts`.

**Acceptance / completion checks:**

* [x] Look up component by stable identifier stem.
* [x] If found, return normalized component DTO with status 200.
* [x] If not found, return 404 Not Found with safe JSON error.
* [x] Validate `:id` path parameter format (reject empty or invalid identifiers with 400).
* [x] Add integration tests in `test/integration/components.test.ts` verifying valid detail lookup and 404 for unknown ID.

---

##### M3-T05 — Verify Application Startup and Security Boundaries

**Traceability:** FR-011, NFR-001, NFR-004, NFR-007; PLAN TD-003, TD-009

**Dependencies:** M3-T01 to M3-T04

**Description:** Test CORS preflight, localhost origin policy, and fail-fast startup behavior when datasets are missing or invalid.

**Acceptance / completion checks:**

* [x] Add integration tests in `test/integration/cors.test.ts` confirming allowed localhost origins receive CORS headers and foreign origins are blocked.
* [x] Add integration tests in `test/integration/errors.test.ts` confirming unexpected exceptions return generic 500 without leaking stack traces or file paths.
* [x] Verify server bootstrap logs startup failure and terminates cleanly if required snapshot folders are missing.

---

### Milestone 4 — CI/CD, Documentation, and Classroom Readiness (.github/workflows, scripts, docs)

#### Objective — M4

Automate quality verification with GitHub Actions CI, complete authoritative contract documentation, and ensure clean classroom setup for physical device testing.

#### Scope — M4

* GitHub Actions workflow in `.github/workflows/build.yml`.
* Package scripts in `package.json`.
* Complete contract and security documentation in `docs/API.md` and `docs/SECURITY.md`.
* Classroom startup verification with local LAN testing.

#### Dependencies — M4

* M1-T04, M2-T04, M3-T01 to M3-T05.

#### Exit Criteria — M4

* [x] `.github/workflows/build.yml` runs on pushes and pull requests without requiring secrets, databases, or deploy infrastructure.
* [x] All quality checks (`pnpm lint`, `pnpm typecheck`, `pnpm validate:data`, `pnpm test`, `pnpm test:integration`, `pnpm build`) pass.
* [x] `docs/API.md` and `docs/SECURITY.md` are completely written and match implemented behavior.
* [x] Clean checkout installs and starts with pnpm without external database setup.

#### Tasks — M4

##### M4-T01 — Define Verified Package Scripts in package.json

**Traceability:** NFR-001, NFR-005, NFR-006; PLAN Section 16

**Dependencies:** M1-T04, M2-T04, M3-T01 to M3-T05

**Description:** Replace placeholder test script in `package.json` with the complete set of verified npm scripts for dev, build, lint, typecheck, test, and validation.

**Acceptance / completion checks:**

* [x] Define `"dev": "tsx watch src/server.ts"`.
* [x] Define `"build": "tsc"`.
* [x] Define `"start": "node dist/server.js"`.
* [x] Define `"lint": "eslint src/ test/ scripts/"`.
* [x] Define `"typecheck": "tsc --noEmit"`.
* [x] Define `"test": "vitest run test/unit"`.
* [x] Define `"test:integration": "vitest run test/integration"`.
* [x] Define `"validate:data": "tsx scripts/validate-data.ts"`.
* [x] Verify `pnpm install --frozen-lockfile` succeeds.
* [x] Verify all scripts execute cleanly from the terminal.

---

##### M4-T02 — Implement GitHub Actions CI/CD Workflow (.github/workflows/build.yml)

**Traceability:** NFR-001, NFR-002, NFR-003, NFR-004, NFR-005; PLAN TD-007, TD-010

**Dependencies:** M4-T01

**Description:** Create `.github/workflows/build.yml` to run the automated CI quality pipeline on every push and pull request. No deployment jobs are included.

**Workflow Specification:**

```yaml
name: Build and Test

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  verify:
    name: Lint, Typecheck, Test, and Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.2.2

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint source code
        run: pnpm lint

      - name: Typecheck TypeScript
        run: pnpm typecheck

      - name: Validate OpenDB snapshot schemas
        run: pnpm validate:data

      - name: Run unit tests
        run: pnpm test

      - name: Run integration tests
        run: pnpm test:integration

      - name: Build project
        run: pnpm build
```

**Acceptance / completion checks:**

* [x] `.github/workflows/build.yml` is created and committed to the repository.
* [x] Uses Node.js 24 and pnpm 11 with frozen lockfile caching.
* [x] Pipeline runs all gates: lint, typecheck, validate:data, test, test:integration, and build.
* [x] Zero external dependencies, database containers, or secret credentials required.
* [x] Fails immediately if any unit test, integration test, or schema validation check fails.

---

##### M4-T03 — Author Comprehensive API and Security Documentation

**Traceability:** FR-001 to FR-011; NFR-003, NFR-004, NFR-007; PLAN Section 22

**Dependencies:** M1-T01, M3-T01 to M3-T04

**Description:** Populate currently empty placeholder files `docs/API.md` and `docs/SECURITY.md` with complete contract specifications and security posture.

**Acceptance / completion checks:**

* [x] `docs/API.md` documents all routes (`/api/health`, `/api/categories`, `/api/components`, `/api/components/:id`), query parameter constraints, response schemas, pagination metadata, and error codes.
* [x] `docs/API.md` explicitly documents `404 Not Found` for `page > totalPages`.
* [x] `docs/SECURITY.md` documents localhost CORS policy, `0.0.0.0:3000` LAN demo configuration, request sanitization, safe error handling (no leaked paths/stack traces), and credential policy.
* [x] Update `README.md` and `docs/AGENTS.md` with final script commands.

---

##### M4-T04 — Verify Clean Classroom Startup and Mobile Connectivity

**Traceability:** NFR-001, NFR-006, AC-001, AC-013, AC-015; PLAN TD-009

**Dependencies:** M4-T01 to M4-T03

**Description:** Perform verification from a clean workspace to confirm that students can run the API locally and connect their physical mobile devices over local LAN during demonstrations.

**Acceptance / completion checks:**

* [x] Clone into clean directory and verify `pnpm install` and `pnpm dev` succeed without database requirements.
* [x] Confirm server listens on `0.0.0.0:3000` and `GET http://<PC_LAN_IP>:3000/api/health` responds successfully over the LAN network.
* [x] Document LAN configuration steps for students in `README.md` (how to obtain PC LAN IP and set mobile `API_URL`).
* [x] Confirm Metro bundler on port 5562 and Express API on port 3000 operate without port collisions.

---

## 5. Cross-Cutting Tasks

### Testing

* [x] Implement unit tests in `test/unit/` covering loader, Ajv schema validator, repository filtering, deterministic sorting, pagination, and error classes.
* [x] Implement integration tests in `test/integration/` with Supertest covering health, categories, component pagination, 404 on `page > totalPages`, component detail, 404 on missing ID, and safe 500 error responses.
* [x] Implement snapshot validation script `scripts/validate-data.ts` to validate all OpenDB files against schemas.

### Security

* [x] Enforce localhost CORS and safe errors (no stack traces, absolute paths, or secrets leaked).
* [x] Ensure public DTOs omit OpenDB internal metadata envelopes and file system paths.
* [x] Verify server binds to port 3000 with configurable host/port via environment variables.

### Accessibility

* Not applicable to this API repository; owned by PCForge Mobile app.

### Performance

* [x] Establish memory and query latency baseline with in-memory indexes over the OpenDB snapshot.
* [x] Ensure paginated queries slice bounded records (maximum 50 items per page).

### Documentation

* [x] Maintain foundational engineering documents (`CONSTITUTION.md`, `SPEC.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`, `USERJOURNEY.md`, `AGENTS.md`, `PLAN.md`, `TASKS.md`).
* [x] Populate `docs/API.md` and `docs/SECURITY.md`.
* [x] Update `README.md` with operational commands and LAN setup instructions.

### Deployment

* Not in scope. No deployment workflow, cloud host, or production container is planned.

## 6. Blocked / Pending Clarification

* [x] [COMPLETED DATA IMPORT] All 8 required OpenDB category folders imported and verified into `data/opendb/`.

*(All previous technical decisions have been resolved and approved: Ajv + ajv-formats approved for Draft-07 schema validation, `page > totalPages` returns 404 Not Found, Node.js 24.x pinned as runtime, Express default port 3000 on 0.0.0.0 for LAN demo access with Metro on 5562).*

## 7. Out of Scope

Explicitly excluded work:

* External database, ORM, migrations, accounts, authentication, builds/favorites persistence, compatibility/power business logic, admin CRUD, upstream sync automation, deployment, ecommerce, microservices, and background workers.

## 8. Final Verification

* [x] All MVP functional and non-functional requirements map to tasks.
* [x] Completed documentation and scaffold work remains checked in Milestone 0.
* [x] Schema-validation decision (Ajv) and runtime pin (Node 24) are resolved before adapter completion.
* [x] Endpoint contract decisions (404 on page > totalPages, port 3000 LAN access) are resolved before integration tests are finalized.
* [x] Unit, integration, data validation, lint, typecheck, and build gates are represented.
* [x] CI uses the same quality gates and performs no deployment.
* [x] No task introduces undocumented product scope.
* [x] Documentation links are valid.
* [x] Work items can be transferred into GitHub Milestones and Issues without redefining scope.

## 9. Change Log

| Version | Date | Change | Reason |
| ------- | -------------- | ---------- | ---------- |
| `0.1` | `2026-10-01` | Initial API implementation breakdown | Convert approved API docs and current scaffold into staged work |
| `0.2` | `2026-10-05` | Incorporate user-approved decisions and detail src, test, and CI/CD tasks | Unblock Ajv validator, pin Node 24 runtime, specify 404 for page > totalPages, configure port 3000 LAN access, detail `.github/workflows/build.yml` and src/test tasks |
