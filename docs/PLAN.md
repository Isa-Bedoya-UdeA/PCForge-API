# PCForge API — Technical Implementation Plan

| Field | Value |
| --- | --- |
| Project | PCForge API |
| Document | Plan |
| Version | 0.1 |
| Status | Approved |
| Last Updated | 2026-10-05 |
| Specification Version | 0.1 |
| Requirements Version | 0.1 |
| Architecture Version | 0.1 |

## 1. Purpose

This plan translates the approved PCForge API product specification and requirements into an implementation sequence for the existing TypeScript/Express scaffold. It does not expand the read-only catalog scope. The current repository has package dependencies and directories, but the server bootstrap and data-validation script are empty; API.md and SECURITY.md are also empty.

## 2. Implementation Overview

Build a small Express 5 modular monolith. Load an unchanged local BuildCores OpenDB snapshot through a JSON data adapter, map only the approved component fields into application models, and serve paginated read-only catalog endpoints. Validate requests at the HTTP boundary, centralize safe errors, and verify the API locally and in GitHub Actions. No database, runtime BuildCores call, user persistence, or deployment is included.

### 2.1 Goals

* Complete the API contract and source-field mapping after inspecting the imported OpenDB records.
* Preserve the upstream `data/opendb/` folders and files byte-for-byte; keep upstream schemas unchanged in `data/schemas/`.
* Load and validate source records once during startup, then expose normalized read models.
* Provide health, categories, paginated component listing with search/filters, and component details.
* Use the approved 1-based `page`/`pageSize` contract: default size 50; allowed sizes 10, 20, 30, 40, and 50; return total record and page counts.
* Keep CORS limited to local development origins and require no database or secrets.
* Add unit, integration, data-validation, and CI checks using pnpm.

### 2.2 Non-Goals

* Database persistence, migrations, accounts, authentication, or user-generated data.
* Compatibility or power calculations in the backend.
* Runtime calls to BuildCores or automated upstream synchronization.
* Admin catalog CRUD, microservices, workers, cloud deployment, or ecommerce.
* Deciding the full normalized component field set or category filter set before examining source records.

### 2.3 Requirement Coverage

| Requirement | Technical Approach |
| --- | --- |
| FR-001 | Define canonical categories from the confirmed catalog categories and expose them through the categories route. |
| FR-002 | Read category records from the repository, normalize, filter/search, sort deterministically, then slice the requested page and return pagination metadata. |
| FR-003 | Derive and retain a stable component ID from the source JSON filename; verify the mapping against source identifiers where available. |
| FR-004 | Case-insensitive search over only approved normalized fields, after source-field inspection. |
| FR-005 | Apply only explicit category-specific filters after validating their names and value formats. |
| FR-006 | Look up a normalized record by stable ID and return the API response model. |
| FR-007 | Provide a dependency-free health route reporting operational status and approved metadata. |
| FR-008 | Reject unknown categories with the shared client-error response. |
| FR-009 | Return the shared 404 response for unknown component IDs. |
| FR-010 | Validate path/query parameters, including 1-based page and the supported page-size set. |
| FR-011 | Map expected and unexpected failures to one safe JSON error contract. |
| FR-012 | Store the manually downloaded OpenDB source tree unchanged; do not expose the source metadata envelope or filesystem paths. |
| NFR-001 | Use pnpm scripts and the local snapshot; no external service/database is needed to start. |
| NFR-002 | Load only version-controlled snapshot files, preserve source files, sort consistently, and avoid runtime mutation. |
| NFR-003 | Validate requests and mapped data before use. |
| NFR-004 | Centralize errors and keep stack traces/secrets/paths out of responses. |
| NFR-005 | Separate routes/controllers/services/repositories/data adapter so each boundary can be tested. |
| NFR-006 | Keep setup to Node.js, pnpm, and local data; no database service. |
| NFR-007 | Configure CORS only for approved localhost development origins. |

---

## 3. Existing System Context

### 3.1 Current Structure

```text
pcforge-api/
├── data/
│   ├── opendb/
│   │   └── CPU/                 # Current imported catalog category
│   └── schemas/                 # Upstream OpenDB JSON schemas
├── docs/
│   ├── AGENTS.md
│   ├── API.md                   # Empty placeholder
│   ├── ARCHITECTURE.md
│   ├── CONSTITUTION.md
│   ├── PLAN.md                  # This document
│   ├── README.md
│   ├── REQUIREMENTS.md
│   ├── SECURITY.md              # Empty placeholder
│   ├── SPEC.md
│   ├── TASKS.md                 # To be completed with this plan
│   └── USERJOURNEY.md
├── scripts/
│   └── validate-data.ts         # Empty placeholder
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── data/
│   ├── dto/
│   ├── errors/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── server.ts                # Empty placeholder
├── test/
│   ├── integration/
│   └── unit/
├── package.json
├── pnpm-lock.yaml
└── README.md
```

There is no `.github/workflows/` directory yet. No test files, API routes, server bootstrap, or validation implementation exist. The package has Express 5, CORS, Zod, TypeScript, tsx, ESLint, Vitest, and Supertest installed; its only current script is a placeholder `test` command that exits with an error.

The available shell inventory showed `data/opendb/CPU/` only, while `data/schemas/` contains the upstream category schemas. Import the remaining approved OpenDB category folders before finalizing the catalog model or category filters.

### 3.2 Existing Components to Reuse

* `package.json` and `pnpm-lock.yaml`: existing Node/TypeScript/Express 5 scaffold and dependencies.
* `src/` module directories: approved routes/controllers/services/repositories/data-adapter boundaries.
* `src/types/`, `src/dto/`, `src/errors/`, `src/middleware/`, and `src/config/`: intended homes for API models and cross-cutting behavior.
* `data/schemas/`: unchanged upstream JSON Schemas.
* `data/opendb/CPU/`: imported CPU source snapshot; preserve as-is.
* `test/unit/`, `test/integration/`, and `scripts/validate-data.ts`: existing empty locations to implement.

### 3.3 Components to Modify

* `package.json`: replace the placeholder test script and add verified development, build, lint, typecheck, test, integration-test, and data-validation scripts.
* `src/server.ts`: bootstrap Express, load/validate catalog once, mount routes/middleware, and listen only when invoked as the server entry point.
* Existing `src/` modules as their catalog responsibilities are implemented.
* `docs/API.md` and `docs/SECURITY.md`: fill the currently empty contract/security documents.
* `docs/ARCHITECTURE.md`, `docs/README.md`, and `docs/AGENTS.md` when the final implementation changes their documented details.

### 3.4 New Components

* `.github/workflows/build.yml`: CI on pushes and pull requests.
* `src/app.ts` (or the approved Express application module) to construct the app separately from the listener for Supertest integration.
* Category, component, and health routes/controllers.
* Component query/response DTOs, repository contract, JSON adapter, and component service.
* Shared application error types, not-found handling, query validation, CORS/security middleware, and dataset loader.
* Unit and integration tests plus project-owned JSON Schema validation in `scripts/validate-data.ts`.

---

## 4. Module and Package Structure

```text
pcforge-api/
├── .github/
│   └── workflows/
│       └── build.yml
├── data/
│   ├── opendb/                  # Original OpenDB category folders/files; never rewrite
│   └── schemas/                 # Original matching schemas; never rewrite
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── CONSTITUTION.md
│   ├── PLAN.md
│   ├── REQUIREMENTS.md
│   ├── SECURITY.md
│   ├── SPEC.md
│   ├── TASKS.md
│   └── USERJOURNEY.md
├── scripts/
│   └── validate-data.ts
├── src/
│   ├── config/env.ts
│   ├── constants/{categories,routes}.ts
│   ├── controllers/{categories,components,health}.controller.ts
│   ├── data/loader.ts
│   ├── dto/{component-query,component-response}.dto.ts
│   ├── errors/{app-error,error-codes}.ts
│   ├── middleware/{error-handler,not-found,validation}.ts
│   ├── repositories/{component.repository,json-component.repository}.ts
│   ├── routes/{categories,components,health}.routes.ts
│   ├── services/components.service.ts
│   ├── types/component.ts
│   ├── app.ts
│   └── server.ts
├── test/
│   ├── fixtures/
│   ├── integration/
│   └── unit/
├── .env.example
├── .node-version                # Add when the classroom Node version is pinned
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

The exact `data/opendb/` category subfolders must match the downloaded upstream `open-db/` folder layout; do not rename source category folders or JSON files.

### Module Responsibilities

| Module | Responsibility | Dependencies |
| --- | --- | --- |
| `src/routes/` | Declare REST paths and middleware order | Controllers, validation middleware |
| `src/controllers/` | Translate HTTP input/output and invoke use cases | Services, DTOs, error types |
| `src/services/` | Implement category/list/search/filter/detail use cases | Repository contract, domain types |
| `src/repositories/` | Expose catalog-oriented data operations | Data adapter |
| `src/data/` | Read source files, validate, map records, and load in-memory models | Filesystem, source-schema validator, domain types |
| `src/dto/` | Define validated query and normalized response contracts | Domain types, Zod |
| `src/middleware/` | Validate request boundary, CORS, safe errors, and 404s | Express, Zod, error types |
| `scripts/validate-data.ts` | Validate imported OpenDB JSON against matching source schemas | Node filesystem, selected JSON Schema validator |
| `test/unit/` | Test services, pagination, mapping, and validation with fixtures | Vitest |
| `test/integration/` | Test HTTP contract and middleware using the Express app | Supertest, Vitest |

---

## 5. Component Design

### Express Application and Server

#### Server Responsibility

Build an Express application independently from the network listener so integration tests can instantiate it without binding a port. The server entry point loads and validates the snapshot, creates dependencies, starts listening, and reports startup failure clearly.

#### Server Inputs

Environment configuration, validated catalog repository, and incoming HTTP requests.

#### Server Outputs

An Express application and a local HTTP listener exposing the approved `/api` routes.

#### Server Dependencies

Express 5, configuration, middleware, route factories, component service/repository.

#### Server Related Requirements

* FR-007, FR-011
* NFR-001, NFR-004, NFR-005, NFR-006

### OpenDB Data Loader and JSON Adapter

#### Loader Responsibility

Read the original category folders and product JSON files without writing to them; validate source records against matching schemas; map only the fields needed by the approved component response; and produce a deterministic in-memory catalog.

#### Loader Inputs

Source category folder, JSON file whose filename stem is the product ID, matching OpenDB schema, and a category-to-schema mapping.

#### Loader Outputs

Validated source records and normalized component models. The public response must not expose the BuildCores metadata envelope or filesystem paths.

#### Loader Dependencies

Node filesystem/path APIs, `data/opendb/`, `data/schemas/`, domain types, and an approved JSON Schema validation library.

#### Loader Related Requirements

* FR-002, FR-003, FR-012
* NFR-002, NFR-003, NFR-005

### Component Repository

#### Repository Responsibility

Provide read-only category, list, ID lookup, and deterministic filtered/search result operations over the normalized in-memory catalog.

#### Repository Inputs

Category, normalized search/filter criteria, stable component ID, and pagination request.

#### Repository Outputs

Records and aggregate count information before pagination; no Express types.

#### Repository Dependencies

Normalized component types and the JSON data adapter.

#### Repository Related Requirements

* FR-001 to FR-006, FR-012

### Component Service

#### Service Responsibility

Coordinate category validation, search and filter composition, deterministic ordering, page slicing, detail lookup, and not-found behavior.

#### Service Inputs

Validated application query/ID objects and a repository boundary.

#### Service Outputs

Normalized categories, page records plus pagination counts, component details, or application errors.

#### Service Dependencies

Component repository and framework-independent types.

#### Service Related Requirements

* FR-001 to FR-006, FR-008 to FR-010

### Request and Error Middleware

#### Middleware Responsibility

Validate route/query input at the HTTP boundary, enforce local CORS policy, map known errors into the shared JSON error structure, and hide internal exception details.

#### Middleware Inputs

Express request, validated origin configuration, application errors, and unexpected exceptions.

#### Middleware Outputs

Validated request state or a safe JSON error response.

#### Middleware Dependencies

Express 5, Zod request schemas, CORS package, shared error types.

#### Middleware Related Requirements

* FR-008 to FR-011
* NFR-003, NFR-004, NFR-007

---

## 6. Data Model

### Entity: Normalized Component

The exact normalized field set is blocked until the imported OpenDB records for all MVP categories are inspected. The model must contain a stable component ID, canonical category, the catalog fields needed for display/search/filtering, and component specifications needed by mobile compatibility rules. Map only approved values; do not copy the source `metadata` envelope or invent missing values.

| Field | Type | Required | Constraints | Description |
| --- | --- | --- | --- | --- |
| `id` | string | Yes | Non-empty; derived from source JSON filename stem | Stable public identifier used by detail lookup |
| `category` | string | Yes | Canonical API category | Identifies the component category |
| `name` | string | Yes | Mapped from the approved source field | User-visible product name |
| `manufacturer` | string or null | No | Preserve missing as null/absent per API contract | Manufacturer for display/filtering |
| `specifications` | object | Yes | Explicitly mapped fields only; values retain source type/nullability | Display/filter fields and compatibility inputs |

### Relationships

* Category → Component: one category contains zero or more components.
* Component → Source file: one source JSON file maps to one component ID based on the filename stem.
* Category → Schema: each category maps to its matching OpenDB JSON Schema.

This is an in-memory catalog model, not a database schema. See `data/schemas/` for the unchanged upstream source schemas.

---

## 7. Algorithms and Business Logic

### Algorithm: Load and Normalize Snapshot

#### 7.1.1 Purpose

Create a validated, deterministic in-memory catalog from the unchanged local OpenDB snapshot.

#### 7.1.2 Inputs

Category folders under `data/opendb/`, matching schemas under `data/schemas/`, and an approved field/category mapping.

#### 7.1.3 Steps

1. Enumerate only configured category directories and JSON product files; derive the candidate ID from each filename stem.
2. Parse each JSON file without modifying it and validate it against the schema assigned to that category.
3. Map the approved source fields to the normalized component model; preserve unknown/missing values and source nullability.
4. Verify required IDs/categories and detect duplicate IDs or schema mismatches.
5. Sort deterministically by canonical category and stable ID, then expose the loaded catalog through the repository.
6. Fail startup with actionable internal diagnostics if required data/schema files or invalid required records prevent safe service operation; never silently serve corrupted data.

#### 7.1.4 Complexity

Startup validation and mapping are linear in the total input size: $O(N)$ records plus schema validation cost. In-memory list queries scan category records unless a measured need justifies an index.

#### 7.1.5 Edge Cases

* Empty category directory: expose the category with an empty collection if configured.
* Missing required category or schema: fail startup with a clear internal diagnostic.
* Invalid JSON/schema: fail startup before opening the HTTP listener.
* Duplicate source filename IDs across categories: reject or resolve only after an explicit global-ID policy is approved.
* Missing optional component fields: keep missing/null distinct; never substitute zero or false.

### Algorithm: Search, Filter, and Paginate

#### 7.2.1 Purpose

Return stable, bounded component results for catalog requests.

#### 7.2.2 Inputs

Canonical category (when supplied), validated text query, explicitly supported filters, `page` (1-based), and `pageSize`.

#### 7.2.3 Steps

1. Validate category, query, filter names/values, `page >= 1`, and `pageSize ∈ {10, 20, 30, 40, 50}`; default `pageSize` to 50.
2. Select the requested category or the documented cross-category collection.
3. Apply case-insensitive search to approved fields and apply all requested supported filters (AND semantics unless a future API contract explicitly states otherwise).
4. Sort results by canonical category then stable ID to ensure deterministic page boundaries.
5. Compute total matches and `totalPages = ceil(total / pageSize)`; slice the requested page.
6. Return page data and total/page count metadata using the response schema in `API.md`.

#### 7.2.4 Complexity

Without indexes, filtering/search is $O(N)$ and deterministic sorting is $O(M \log M)$ for $M$ matched results; page slicing is $O(pageSize)$ output.

#### 7.2.5 Edge Cases

* Invalid category/filter/pagination: return 400 using the standard error contract.
* No matches: return 200 with an empty page and zero total matches.
* `page` beyond `totalPages`: return 404 Not Found as a non-existent resource per approved API decision.

---

## 8. Technical Decisions

### TD-001 — Express 5 Layered Modular Monolith

#### 8.1.1 Context

The API is a small, read-only catalog service with an approved Node.js/TypeScript/Express 5 stack.

#### 8.1.2 Options Considered

1. Express 5 modular monolith.
2. A larger framework or microservices.

#### 8.1.3 Decision

Use Express 5 with routes/controllers/services/repositories/data adapter.

#### 8.1.4 Rationale

Matches the existing scaffold and keeps classroom setup and dependency flow simple.

#### 8.1.5 Consequences

* Layers can be tested independently.
* The app remains a single service and requires careful contracts rather than distributed service infrastructure.

### TD-002 — Preserve the OpenDB Snapshot; Normalize at the Adapter

#### 8.2.1 Context

The user will copy OpenDB folders manually and wants original source files unchanged.

#### 8.2.2 Options Considered

1. Rewrite source files into a PCForge schema.
2. Keep source folders/files unchanged and map them when loading.

#### 8.2.3 Decision

Keep `data/opendb/` and `data/schemas/` unchanged; normalize only in the API adapter.

#### 8.2.4 Rationale

Preserves source fidelity while exposing only fields the mobile app needs.

#### 8.2.5 Consequences

* Source files remain auditable and can be replaced as a snapshot.
* The category/field mapping and schema-to-category registry must be tested and documented.

### TD-003 — Startup Snapshot Load and Fail-Fast Validation

#### 8.3.1 Context

Classroom runs must be deterministic and not discover corrupt source records only on user requests.

#### 8.3.2 Options Considered

1. Load/validate all configured data before listening.
2. Lazy-load each category on demand.

#### 8.3.3 Decision

Load and validate configured data at startup; do not open the listener if required snapshot validation fails.

#### 8.3.4 Rationale

Makes missing schemas/files and malformed records visible during startup and gives stable in-memory read behavior.

#### 8.3.5 Consequences

* Startup work grows with the snapshot size.
* Snapshot size is assumed suitable for memory; re-evaluate only if measured data volume changes materially.

### TD-004 — Validate Request Contracts with Existing Zod

#### 8.4.1 Context

Zod is already installed, and requirements call for strict validation at the HTTP boundary.

#### 8.4.2 Options Considered

1. Use existing Zod for query/path inputs and normalized DTO validation.
2. Add another request-validation framework.

#### 8.4.3 Decision

Use Zod for request query/path schemas and normalized response/model checks where appropriate.

#### 8.4.4 Rationale

Avoids duplicate validation libraries for project-owned TypeScript contracts.

#### 8.4.5 Consequences

* The mapping layer owns conversion from OpenDB's nullable/source-specific shapes.
* Upstream JSON Schema validation is a separate decision (TD-005).

### TD-005 — Validate Upstream JSON Schema with Ajv and ajv-formats

#### 8.5.1 Context

OpenDB supplies Draft-07 JSON Schema files, while the scaffold package has Zod for API boundaries but no JSON Schema validator. Zod does not natively parse Draft-07 schemas without custom mapping and maintenance overhead.

#### 8.5.2 Options Considered

1. Use Ajv plus `ajv-formats` to directly validate source records against upstream Draft-07 schemas.
2. Convert and manually maintain equivalent project-owned Zod/JSON schemas, accepting drift and maintenance overhead.

#### 8.5.3 Decision

Approved by user: use Ajv and `ajv-formats` for validating upstream OpenDB snapshot data against the schemas in `data/schemas/`.

#### 8.5.4 Rationale

Ajv is the industry-standard, high-performance Draft-07 JSON Schema validator. With `ajv-formats`, it validates string formats such as `date-time` natively without translating or mutating upstream schema definitions.

#### 8.5.5 Consequences

* Ajv and `ajv-formats` will be added to the project via pnpm when implementing the data validation layer.
* Upstream schemas remain 100% authentic and unmutated.
* Validations will run at service startup and via `pnpm validate:data`.

### TD-006 — pnpm-Only Independent Repository

#### 8.6.1 Context

The API and Mobile apps are separate repositories and pnpm is required.

#### 8.6.2 Options Considered

1. Independent pnpm repository.
2. Shared npm/yarn workspace or monorepo.

#### 8.6.3 Decision

Keep `pcforge-api` independently installable and use pnpm only.

#### 8.6.4 Rationale

Matches classroom/repository boundaries and avoids coupling the two projects.

#### 8.6.5 Consequences

* API and Mobile have separate manifests and lockfiles.
* Do not create a root workspace.

### TD-007 — CI Validation Without Deployment

#### 8.7.1 Context

The API is local-only for the class; CI should prevent broken changes without deploying the service.

#### 8.7.2 Options Considered

1. GitHub Actions quality/build workflow only.
2. CI plus deployment pipeline.

#### 8.7.3 Decision

Create `.github/workflows/build.yml` for pushes and pull requests; do not add deployment jobs.

#### 8.7.4 Rationale

The user explicitly does not plan to deploy the API or app.

#### 8.7.5 Consequences

* Workflow runs install, lint, typecheck, data validation, tests, and build after their scripts exist.
* No deployment credentials or secrets are required.

### TD-008 — HTTP 404 Response for Page Beyond Total Pages

#### 8.8.1 Context

When a client queries `GET /api/components` with `page > totalPages`, the system must return a predictable and standards-compliant response.

#### 8.8.2 Options Considered

1. Return 200 OK with an empty `data: []` array and pagination totals.
2. Return 400 Bad Request.
3. Return 404 Not Found, treating the non-existent page as an unresolvable resource.

#### 8.8.3 Decision

Return 404 Not Found with the standard safe JSON error response when `page > totalPages`.

#### 8.8.4 Rationale

User approved treating out-of-range pages as non-existent resources. This provides clean REST semantics and allows client infinite scroll / pagination algorithms to recognize termination deterministically.

#### 8.8.5 Consequences

* Service and route middleware will check if `page > totalPages` (when `total > 0`) and emit a 404 error.
* PCForge Mobile must handle 404 when navigating beyond available pages.

### TD-009 — Network Binding and Port Strategy for Classroom & Demo

#### 8.9.1 Context

During academic presentations and development, each student runs the API locally on their own computer, and the PCForge React Native mobile app executes on their physical Android/iOS phone over the local WiFi network (LAN). Metro bundler runs on port 5562 (`127.0.0.1:5562`).

#### 8.9.2 Options Considered

1. Bind Express strictly to `127.0.0.1:3000`.
2. Bind Express to `0.0.0.0:3000` (LAN-accessible), while Metro runs on `5562`.

#### 8.9.3 Decision

Use default port `3000` for Express, binding to `0.0.0.0` (all network interfaces), allowing LAN devices on the same subnet to access the API via the host PC's LAN IP address (`http://<PC_LAN_IP>:3000/api`). Metro bundler uses its standard port 5562. CORS is configured for localhost origins.

#### 8.9.4 Rationale

Physical devices cannot access `127.0.0.1` of the host computer. Binding to `0.0.0.0:3000` enables the student's phone on the same LAN WiFi to reach the backend API while isolating the demonstration from external internet exposure.

#### 8.9.5 Consequences

* Express server bootstrap must bind to host `0.0.0.0` and port `3000` (configurable via `PORT` environment variable).
* Mobile app configures `API_BASE_URL` with the student's PC LAN IP during live demos.
* No public internet deployment or port forwarding is required.

### TD-010 — Pinned Node.js Runtime for Reproducibility

#### 8.10.1 Context

Local execution and GitHub Actions CI must execute on an identical, stable Node.js runtime to prevent drift.

#### 8.10.2 Options Considered

1. Pin Node.js 20 LTS.
2. Pin latest stable Node.js at scaffold time: Node.js 24.x (matching local environment Node v24.13.1).

#### 8.10.3 Decision

Pin Node.js to version `24.x` (specifically recording `>=24.13.0` in `.node-version` and `engines`).

#### 8.10.4 Rationale

Approved by user ("Latest stable at scaffold - Comprobar la versión estable más reciente al cerrar el scaffold y fijarla entonces"). Matches the active developer environment (Node v24.13.1) and current modern Express 5 / Vitest capabilities.

#### 8.10.5 Consequences

* `.node-version` will contain `24.13.1` (or `24`).
* `.github/workflows/build.yml` specifies `node-version: 24`.
* `package.json` specifies `"engines": { "node": ">=24.0.0" }`.

---

## 9. API / Interface Contracts

### Catalog API

#### 9.1.1 Purpose

Expose the read-only catalog used by PCForge Mobile.

#### 9.1.2 Input

```text
GET /api/health
GET /api/categories
GET /api/components?category=<canonical-category>&page=1&pageSize=50&<approved-search-and-filter-parameters>
GET /api/components/:id
```

`page` is 1-based. `pageSize` defaults to 50 and accepts 10, 20, 30, 40, or 50. Category/filter/query names and exact component fields must be finalized in `API.md` after inspecting the remaining OpenDB snapshot.

#### 9.1.3 Output

```text
Categories: canonical category collection
Component list: requested page of normalized records plus total record count and total page count
Component detail: one normalized record for a stable ID
Health: operational status and approved service metadata
```

The exact JSON envelope and pagination metadata names are to be specified in `API.md` before route tests are finalized.

#### 9.1.4 Errors

| Error | Condition | Response |
| --- | --- | --- |
| Validation | Unknown category, unsupported/malformed filter, invalid page or pageSize | 400 with standard safe JSON error |
| Not found | Unknown component ID | 404 with standard safe JSON error |
| Page out of range | Requested `page > totalPages` (when `total > 0`) | 404 with standard safe JSON error |
| Dataset/startup failure | Required snapshot/schema missing or invalid | Fail startup with internal diagnostic; never expose paths/details to clients |
| Unexpected | Unhandled server exception | Generic 500 with standard safe JSON error; log details internally |

---

## 10. CLI Contract

### Status

Not Applicable. This repository exposes an HTTP API and has no product CLI. pnpm scripts are developer tooling, documented in AGENTS and package.json.

---

## 11. State Management

### State Model

The API is stateless with respect to users. Runtime state consists of validated normalized catalog records, environment configuration, and service metadata.

### State Transitions

```text
Process start → load source snapshot → validate/map → ready to serve
                                └── invalid/missing required data → startup failure
```

### Persistence

The unchanged OpenDB JSON snapshot and its upstream schemas are version-controlled source artifacts. The adapter may load normalized records into memory. The API does not persist builds, favorites, or user state and uses no external database.

---

## 12. Error Handling

| Error | Source | Handling | User Impact | Logging |
| --- | --- | --- | --- | --- |
| Invalid path/query | Request boundary | Zod validation; standard 400 JSON | Client corrects input | No sensitive values |
| Unknown category | Catalog service | Standard 4xx JSON | Client selects supported category | Safe category identifier only |
| Unknown component | Catalog service | Standard 404 JSON | Client shows not-found | Safe ID only |
| Invalid/missing snapshot data | Loader/adapter | Fail startup before listening | Developer fixes local snapshot | Internal file/record diagnostic; never return to API caller |
| Unexpected error | Any layer | Central error handler, generic 500 JSON | Client sees safe generic failure | Internal stack/diagnostics, no secrets |

---

## 13. Concurrency and Asynchronous Work

Node.js asynchronous filesystem loading occurs during startup. Requests are read-only and share the validated in-memory catalog. No queues, workers, background jobs, mutation synchronization, or distributed locking are required. Do not add hot reload in the MVP.

---

## 14. Caching

No separate cache is planned. The validated snapshot is loaded once into memory for the service lifetime. Any future reload/invalidation behavior requires a documented consistency policy and evidence that it is needed.

---

## 15. Security Implementation

* Accept only approved localhost CORS origins for local development; no wildcard/non-local origins.
* Bind to `0.0.0.0` on default port `3000` to allow local LAN network connections from the student's physical phone running the Expo mobile client during classroom demonstrations. Metro bundler remains isolated on port `5562`.
* Validate untrusted query and path input before catalog operations with strict Zod schemas.
* Use centralized safe JSON errors; never expose filesystem paths, stack traces, secrets, or upstream metadata envelopes.
* Keep `.env` out of version control and commit only safe examples; no secrets are required for the MVP.
* Do not add authentication, database access, or user-specific persistence.

See `SECURITY.md` for the authoritative security model when it is completed.

---

## 16. Testing Strategy

### Unit Tests

* Category lookup and category rejection.
* Source file ID mapping and normalization, including null/missing fields.
* Deterministic sorting, search, and supported filter composition.
* Pagination defaults, supported sizes, page boundaries, totals, empty results, and 404 when `page > totalPages`.
* Ajv Draft-07 JSON Schema validation and mapping failures for source OpenDB data.
* Standard error conversion.

### Integration Tests

* Health, categories, list, search/filter/pagination, detail, invalid query, 404 (unknown ID and `page > totalPages`), CORS, and safe 500 responses through the Express app with Supertest.
* Use fixtures for narrow tests; add one representative real-snapshot test once all required categories are present.

### UI / End-to-End Tests

Not Applicable to the API repository. Full API/mobile E2E coverage is owned by the Mobile project or a later explicitly approved cross-repository test.

### Edge Cases

* Empty categories and empty search/filter pages.
* Page greater than total pages: returns 404 Not Found as non-existent resource.
* Missing category/schema, malformed JSON, schema-invalid record, duplicate IDs, and missing optional fields.
* Unsupported CORS origin and preflight handling.

### Requirement Coverage

| Requirement | Test Type | Test Location |
| --- | --- | --- |
| FR-001 to FR-003 | Unit, integration | `test/unit/`, `test/integration/` |
| FR-004 to FR-005 | Unit, integration | `test/unit/`, `test/integration/` |
| FR-006 to FR-009 | Unit, integration | `test/unit/`, `test/integration/` |
| FR-010 to FR-011 | Unit, integration | `test/unit/`, `test/integration/` |
| FR-012, NFR-002 | Data-validation tests | `test/unit/`, `scripts/validate-data.ts` |
| NFR-001, NFR-006 | CI/manual clean setup | `.github/workflows/build.yml`, documented pnpm setup |
| NFR-003, NFR-004, NFR-007 | Integration/security tests | `test/integration/` |

### Quality Gate

```bash
pnpm lint
pnpm typecheck
pnpm validate:data
pnpm test
pnpm test:integration
pnpm build
```

Define these package scripts before relying on them in local or CI verification.

---

## 17. Migration / Data Changes

Not Applicable: there is no database. The OpenDB snapshot is a manually copied, fixed input. Replace the snapshot only as an explicit data update: copy upstream files unchanged, validate them, review diffs, and update the field mapping/tests if the source schemas changed. Do not automate upstream synchronization in the MVP.

---

## 18. Implementation Sequence

### Phase 0 — Completed Documentation and Scaffold

* [x] Create SPEC, REQUIREMENTS, ARCHITECTURE, USERJOURNEY, CONSTITUTION, AGENTS, and README documents.
* [x] Create the pnpm/TypeScript/Express 5 package scaffold and source/test directory layout.
* [x] Import all currently available OpenDB schema files unchanged.
* [x] Import the currently available CPU OpenDB snapshot unchanged.

### Phase 1 — Resolve Contracts and Complete Snapshot

* [x] Inspect imported schemas and CPU records; record mappings and nullability.
* [x] Copy remaining required OpenDB category folders/files unchanged into `data/opendb/`.
* [x] Confirm supported categories, normalized response fields, search fields, and category filters.
* [x] Decide page-beyond-total behavior (resolved: 404 Not Found) and record response envelope in `API.md`.
* [x] Decide JSON Schema validator dependency (resolved: Ajv and `ajv-formats` approved by user).
* [x] Pin Node.js runtime version (resolved: Node 24.x) and confirm network port/demo strategy (port 3000, LAN binding `0.0.0.0`, Metro on 5562).

### Phase 2 — Data Boundary and Validation

* [x] Define normalized component/category types and source-field mappings.
* [x] Implement loader for unchanged OpenDB directories and matching schemas.
* [x] Implement snapshot/schema validation and deterministic in-memory repository initialization.
* [x] Add unit tests for mapping, nullability, malformed records, missing data, and stable IDs.

### Phase 3 — API Application and Catalog Endpoints

* [x] Implement Express application factory, startup loader, and local server entry point.
* [x] Implement shared errors, request validation, safe error middleware, and localhost-only CORS.
* [x] Implement health and categories endpoints.
* [x] Implement component listing with search, explicit filters, deterministic sorting, and pagination.
* [x] Implement stable-ID detail lookup and 404 behavior.
* [x] Add Supertest integration coverage for all endpoints and error/CORS cases.

### Phase 4 — Tooling, CI, and Documentation

* [x] Replace placeholder package scripts for dev, build, lint, typecheck, unit/integration tests, and data validation.
* [x] Add `.github/workflows/build.yml` for pull requests and pushes.
* [x] Make CI install from the pnpm lockfile, then run lint, typecheck, data validation, tests, and build.
* [x] Complete `API.md` and `SECURITY.md`; align README and architecture with implemented contracts.
* [x] Verify a clean local setup and the classroom startup path; keep deployment out of scope.

### Dependencies

```text
Phase 0 (complete) → Phase 1 → Phase 2 → Phase 3 → Phase 4
```

Phase 2 is blocked on source-field/category mapping and JSON Schema validation dependency approval. Endpoint contract tests are blocked on the `API.md` response envelope and page-boundary decision.

---

## 19. Risks and Mitigations

| Risk | Impact | Probability | Mitigation |
| --- | --- | --- | --- |
| Source fields differ by category or contain sparse/null data | Incorrect UI or compatibility inputs | High | Inspect schemas and representative records; map explicitly; preserve missing values; test fixtures per category |
| Only CPU data is currently imported | Other catalog categories cannot be served | High | Import the required OpenDB folders before implementing final category mapping |
| Upstream schemas use features unsupported by the chosen validator | Invalid/partial snapshot validation | Medium | Test schemas against a small fixture set and the complete snapshot before adopting the validator |
| Node version is not pinned | CI/local runtime drift | Medium | Select the classroom runtime and add `.node-version`/`engines`; have CI read it |
| API response details remain undefined | Mobile integration churn | Medium | Complete `API.md` and tests before endpoint implementation is considered stable |
| CI references scripts that do not exist | Every workflow run fails | High | Add scripts and validate locally before enabling the build workflow |

---

## 20. Performance Considerations

The dataset is expected to fit in memory. Load once at startup, use category indexes/maps for ID lookup, filter only the requested category where possible, apply search/filter criteria before pagination, sort deterministically, and return no more than 50 records per page. Add caching or more complex indexing only after profiling the real snapshot.

---

## 21. Observability

Log startup success, source category/file counts, schema validation failures, request-level errors, and unexpected server errors. Never log credentials, raw source metadata unnecessarily, or expose absolute paths through responses. A health endpoint reports service status and approved basic metadata; external monitoring is not planned.

---

## 22. Documentation Changes

| Document | Change Required | Reason |
| --- | --- | --- |
| `docs/API.md` | Define exact routes, query names, DTO fields, page response envelope, error shape, and page-boundary behavior | Current file is empty and Mobile depends on this contract |
| `docs/SECURITY.md` | Document localhost CORS, validation, safe errors, and secret policy | Current file is empty; implementation needs a security reference |
| `docs/ARCHITECTURE.md` | Update structure/decisions if source mapping or validator differs from this plan | Keep architecture and implementation synchronized |
| `docs/REQUIREMENTS.md` | Replace task placeholders with task IDs; resolve data-dependent questions after snapshot inspection | Maintain traceability |
| `README.md` | Update exact commands once package scripts exist | Current scaffold has only a placeholder test script |
| `docs/AGENTS.md` | Update canonical commands and runtime pin after scripts/version are established | Operational instructions must match actual package config |

---

## 23. Open Technical Decisions

* [RESOLVED: Approve Ajv plus `ajv-formats` for validating upstream JSON Schemas] — **Resolution:** Approved by user. Ajv and `ajv-formats` will be used for Draft-07 validation (TD-005).
* [RESOLVED: What should the API return when `page` is greater than `totalPages`?] — **Resolution:** Return 404 Not Found as a non-existent resource (TD-008).
* [RESOLVED: Which Node.js version should be pinned for local development and GitHub Actions?] — **Resolution:** Pin latest stable at scaffold time, Node.js 24.x (v24.13.1 matching environment) (TD-010).
* [RESOLVED: Which localhost origins/ports and network binding must be configured?] — **Resolution:** Express default port 3000, listening on `0.0.0.0` so physical phones on the same LAN WiFi can access the API during presentations; Metro bundler on port 5562; CORS configured for localhost origins (TD-009).
* [RESOLVED: What are the exact normalized response fields and category filters supported by the imported OpenDB snapshot?] — **Resolution:** All 8 canonical categories (26,240 records) imported, schemas mapped with Ajv Draft-07, and public fields normalized into NormalizedComponent.

---

## 24. Definition of Done

* [x] Every MVP FR/NFR has an implemented path and linked tests.
* [x] Snapshot folders and upstream schemas remain unchanged; adapter mapping is tested.
* [x] API routes, pagination contract, validation, CORS, and safe errors match `API.md`.
* [x] Unit, integration, data-validation, lint, typecheck, and build scripts pass locally.
* [x] `.github/workflows/build.yml` runs the same quality gates on pull requests and pushes.
* [x] No database, deployment, authentication, or other unapproved scope is introduced.
* [x] README, API, security, architecture, requirements, and agent documentation match the implementation.

---

## 25. Related Documentation

* [CONSTITUTION.md](CONSTITUTION.md)
* [AGENTS.md](AGENTS.md)
* [SPEC.md](SPEC.md)
* [REQUIREMENTS.md](REQUIREMENTS.md)
* [ARCHITECTURE.md](ARCHITECTURE.md)
* [API.md](API.md)
* [SECURITY.md](SECURITY.md)
* [USERJOURNEY.md](USERJOURNEY.md)
* [TASKS.md](TASKS.md)
