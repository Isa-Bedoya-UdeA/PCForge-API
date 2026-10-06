# PCForge API — Requirements

| Field | Value |
| --- | --- |
| Project | PCForge API |
| Document | Requirements |
| Version | 0.1 |
| Status | Draft |
| Last Updated | 2026-10-01 |
| Specification Version | 0.1 |

## 1. Purpose

This document defines the testable functional and non-functional requirements for PCForge API. It operationalizes the product scope and behavior in [SPEC.md](SPEC.md), which remains the product-level source of truth. Existing FR and NFR identifiers are preserved.

## 2. Product Scope

### In Scope

- Read-only catalog API for normalized component categories and records.
- Search, supported specification filters, component details, and health checks.
- An unchanged, version-controlled local snapshot of BuildCores OpenDB, normalized at the API data boundary.
- Paginated component results with configurable page size.
- Request validation, consistent errors, CORS, and unit/API integration tests.
- Local startup with pnpm without an external database.

### Out of Scope

- External databases or ORM setup.
- Accounts, authentication, and user-specific data.
- Builds and favorites persistence.
- Pricing, retail integrations, purchases, payments, and orders.
- Admin catalog editing endpoints.
- Server-side compatibility or power calculations.
- Microservices and background workers.

---

## 3. Requirement Conventions

### Functional Requirements

Format:

`FR-001 — <Requirement Name>`

Functional requirement identifiers are retained from the SPEC. Each describes observable API behavior and has individually verifiable acceptance criteria.

### Non-Functional Requirements

Format:

`NFR-001 — <Requirement Name>`

Non-functional requirements describe measurable operational qualities or constraints.

### Priority

- Must
- Should
- Could
- Won't

All requirements in this document are in the MVP and are therefore prioritized Must.

## 4. Functional Requirements

### Feature / Epic: Component Catalog API (F-001)

#### FR-001 — Expose Categories

Description:

WHEN the client requests the supported categories, THE SYSTEM SHALL return the available canonical component categories.

Acceptance Criteria:

- AC-FR-001-01: A request to the categories endpoint returns the configured categories in a valid JSON response.
- AC-FR-001-02: Every returned category can be used with the component listing endpoint.

Priority:

Must

Traceability:

- SPEC Feature: `F-001`
- User Flow: `UF-001`

---

#### FR-002 — Expose Components

Description:

WHEN the client requests a valid category and page, THE SYSTEM SHALL return that page of normalized component records for the category.

Acceptance Criteria:

- AC-FR-002-01: A valid category request returns only records belonging to that category.
- AC-FR-002-02: A category with no records returns a successful response with an empty collection.
- AC-FR-002-03: Returned records conform to the normalized component response contract.
- AC-FR-002-04: Dataset validation detects a malformed record and prevents silent response corruption.
- AC-FR-002-05: The mobile app in its separate repository can consume a valid category response over HTTP.
- AC-FR-002-06: The default page size is 50, and the client can request page sizes of 10, 20, 30, 40, or 50.
- AC-FR-002-07: Each paginated component response includes total record count and total page count.

Priority:

Must

Traceability:

- SPEC Feature: `F-001`
- User Flow: `UF-001`

---

#### FR-003 — Return Stable Identifiers

Description:

WHEN the system returns a component, THE SYSTEM SHALL include a stable identifier usable for a subsequent detail request.

Acceptance Criteria:

- AC-FR-003-01: Every returned component includes a non-empty identifier.
- AC-FR-003-02: The identifier resolves to the same component through the detail endpoint while the dataset version is unchanged.

Priority:

Must

Traceability:

- SPEC Feature: `F-001`, `F-004`
- User Flow: `UF-001`, `UF-004`

---

#### FR-008 — Reject Invalid Category

Description:

IF the client requests an unsupported category, THEN THE SYSTEM SHALL return a consistent client error response.

Acceptance Criteria:

- AC-FR-008-01: A request for an unknown category returns a 4xx status.
- AC-FR-008-02: The response uses the standard JSON error structure and does not return component records.

Priority:

Must

Traceability:

- SPEC Feature: `F-001`
- User Flow: `UF-001`

---

#### FR-012 — Preserve Source Snapshot

Description:

WHEN the OpenDB source is added to the repository, THE SYSTEM SHALL preserve the downloaded JSON folders unchanged as the version-controlled source snapshot.

Acceptance Criteria:

- AC-FR-012-01: The downloaded OpenDB folders and files are retained unchanged in the version-controlled repository snapshot.
- AC-FR-012-02: API responses do not expose OpenDB metadata or internal filesystem paths.

Priority:

Must

Traceability:

- SPEC Feature: `F-001`
- User Flow: `UF-001`

### Feature / Epic: Component Search (F-002)

#### FR-004 — Search Components

Description:

WHEN the client supplies a supported search term, THE SYSTEM SHALL return records matching the defined searchable fields using case-insensitive matching.

Acceptance Criteria:

- AC-FR-004-01: A known term returns records matching the approved searchable fields regardless of letter case.
- AC-FR-004-02: Search can be requested across categories or scoped to a valid category.
- AC-FR-004-03: A term with no matches returns a successful empty collection.

Priority:

Must

Traceability:

- SPEC Feature: `F-002`
- User Flow: `UF-002`

### Feature / Epic: Component Filtering (F-003)

#### FR-005 — Filter Components

Description:

WHEN the client supplies valid supported filter parameters, THE SYSTEM SHALL return records satisfying all requested filters.

Acceptance Criteria:

- AC-FR-005-01: A valid filter returns only records satisfying that filter.
- AC-FR-005-02: Multiple valid filters are combined so returned records satisfy every requested filter.
- AC-FR-005-03: A filter with no matches returns a successful empty collection.

Priority:

Must

Traceability:

- SPEC Feature: `F-003`
- User Flow: `UF-003`

---

#### FR-010 — Validate Query Parameters

Description:

WHEN the client supplies query parameters, THE SYSTEM SHALL validate supported names and value formats, including pagination parameters, before applying them.

Acceptance Criteria:

- AC-FR-010-01: A malformed or unsupported query parameter returns a 400 response using the standard JSON error structure.
- AC-FR-010-02: Invalid parameters are rejected rather than silently ignored or applied with an undocumented interpretation.
- AC-FR-010-03: Page numbers start at 1 and page sizes outside 10, 20, 30, 40, or 50 are rejected.

Priority:

Must

Traceability:

- SPEC Feature: `F-003`
- User Flow: `UF-002`, `UF-003`

### Feature / Epic: Component Details (F-004)

#### FR-006 — Retrieve Component Details

Description:

WHEN the client requests an existing component identifier, THE SYSTEM SHALL return that component's normalized record.

Acceptance Criteria:

- AC-FR-006-01: A detail request using a known stable identifier returns exactly the corresponding component record.
- AC-FR-006-02: The response conforms to the normalized component response contract.

Priority:

Must

Traceability:

- SPEC Feature: `F-004`
- User Flow: `UF-004`

---

#### FR-009 — Handle Missing Component

Description:

IF the requested component identifier does not exist, THEN THE SYSTEM SHALL return a not-found response.

Acceptance Criteria:

- AC-FR-009-01: A detail request for an unknown identifier returns HTTP 404.
- AC-FR-009-02: The response uses the standard JSON error structure and does not expose internal lookup details.

Priority:

Must

Traceability:

- SPEC Feature: `F-004`
- User Flow: `UF-004`

### Feature / Epic: Health and Error Handling (F-005)

#### FR-007 — Provide Health Status

Description:

WHEN the health endpoint is requested, THE SYSTEM SHALL return a successful response when the service is operational.

Acceptance Criteria:

- AC-FR-007-01: A request to `/api/health` returns a successful HTTP status while the service is operational.
- AC-FR-007-02: The response includes service status and the basic metadata defined by the API contract.

Priority:

Must

Traceability:

- SPEC Feature: `F-005`
- User Flow: `UF-005`

---

#### FR-011 — Return Consistent Errors

Description:

WHEN an API request fails, THE SYSTEM SHALL return a consistent JSON error structure without exposing internal implementation details.

Acceptance Criteria:

- AC-FR-011-01: Representative 4xx and 5xx responses use the documented common error fields.
- AC-FR-011-02: Normal error responses omit stack traces, secrets, and internal filesystem details.

Priority:

Must

Traceability:

- SPEC Feature: `F-001` to `F-005`
- User Flow: `UF-001` to `UF-005`

## 5. Non-Functional Requirements

### NFR-001 — Reproducible Startup

Category:

Availability

Description:

THE SYSTEM SHALL start locally using the documented pnpm commands without requiring an external database.

Acceptance Criteria:

- AC-NFR-001-01: A clean local setup can start the API using the documented pnpm instructions and the version-controlled dataset.
- AC-NFR-001-02: Startup does not require a database service or database credentials.

Priority:

Must

Traceability:

- SPEC: `NFR-001`, `AC-001`

### NFR-002 — Deterministic Data

Category:

Other

Description:

THE SYSTEM SHALL serve catalog data from the unchanged, version-controlled OpenDB snapshot so classroom runs are reproducible.

Acceptance Criteria:

- AC-NFR-002-01: Repeating the same catalog request against an unchanged dataset returns the same component records and ordering, as defined by the API contract.
- AC-NFR-002-02: The API does not mutate catalog records in response to public requests.
- AC-NFR-002-03: The original OpenDB JSON files are stored under repository version control without modification.
- AC-NFR-002-04: Repeating the same request against an unchanged snapshot returns the same normalized results.

Priority:

Must

Traceability:

- SPEC: `NFR-002`, `AC-012`

### NFR-003 — Input Validation

Category:

Security

Description:

THE SYSTEM SHALL validate untrusted request input at the API boundary before applying it to catalog operations.

Acceptance Criteria:

- AC-NFR-003-01: Invalid category, identifier, and query inputs are rejected with an appropriate client error.
- AC-NFR-003-02: Invalid input does not cause an unhandled exception or return data outside the requested contract.

Priority:

Must

Traceability:

- SPEC: `NFR-003`, `FR-008`, `FR-009`, `FR-010`

### NFR-004 — Error Safety

Category:

Security

Description:

THE SYSTEM SHALL NOT expose stack traces, secrets, or internal filesystem details in normal API error responses.

Acceptance Criteria:

- AC-NFR-004-01: Tests for representative unexpected errors confirm that responses contain only the standard safe error structure.
- AC-NFR-004-02: Internal diagnostic details are not included in client-facing error messages.

Priority:

Must

Traceability:

- SPEC: `NFR-004`, `FR-011`

### NFR-005 — Testability

Category:

Maintainability

Description:

THE SYSTEM SHALL expose route and service boundaries that can be tested independently.

Acceptance Criteria:

- AC-NFR-005-01: Automated tests can exercise catalog/service behavior without starting an external database.
- AC-NFR-005-02: API integration tests can exercise routes and HTTP responses independently of unit tests.

Priority:

Must

Traceability:

- SPEC: `NFR-005`, `AC-017`

### NFR-006 — Classroom Simplicity

Category:

Compatibility

Description:

THE SYSTEM SHALL require no PostgreSQL, MongoDB, pgAdmin, Prisma, or other database infrastructure for the MVP.

Acceptance Criteria:

- AC-NFR-006-01: Setup and startup instructions do not include a mandatory database installation, service, or migration step.
- AC-NFR-006-02: Two classmates can follow the documented startup procedure without configuring external data infrastructure.

Priority:

Must

Traceability:

- SPEC: `NFR-006`, `AC-013`, `AC-015`

### NFR-007 — Mobile Development CORS

Category:

Compatibility

Description:

THE SYSTEM SHALL configure cross-origin access for localhost origins used in local development.

Acceptance Criteria:

- AC-NFR-007-01: A cross-origin request from an approved localhost origin receives the CORS headers required by the API contract.
- AC-NFR-007-02: A preflight request from an approved localhost origin receives a successful response with the configured CORS policy.
- AC-NFR-007-03: Origins outside the approved local-development policy are not enabled.

Priority:

Must

Traceability:

- SPEC: Section 2.1 CORS scope, `AC-014`

## 6. Requirement Priority Matrix

| ID | Requirement | Type | Priority | Release |
| --- | --- | --- | --- | --- |
| FR-001 | Expose Categories | Functional | Must | MVP |
| FR-002 | Expose Paginated Components | Functional | Must | MVP |
| FR-003 | Return Stable Identifiers | Functional | Must | MVP |
| FR-004 | Search Components | Functional | Must | MVP |
| FR-005 | Filter Components | Functional | Must | MVP |
| FR-006 | Retrieve Component Details | Functional | Must | MVP |
| FR-007 | Provide Health Status | Functional | Must | MVP |
| FR-008 | Reject Invalid Category | Functional | Must | MVP |
| FR-009 | Handle Missing Component | Functional | Must | MVP |
| FR-010 | Validate Query and Pagination Parameters | Functional | Must | MVP |
| FR-011 | Return Consistent Errors | Functional | Must | MVP |
| FR-012 | Preserve Source Snapshot | Functional | Must | MVP |
| NFR-001 | Reproducible Startup | Non-Functional | Must | MVP |
| NFR-002 | Deterministic OpenDB Snapshot | Non-Functional | Must | MVP |
| NFR-003 | Input Validation | Non-Functional | Must | MVP |
| NFR-004 | Error Safety | Non-Functional | Must | MVP |
| NFR-005 | Testability | Non-Functional | Must | MVP |
| NFR-006 | Classroom Simplicity | Non-Functional | Must | MVP |
| NFR-007 | Localhost Development CORS | Non-Functional | Must | MVP |

## 7. Constraints

### C-001 — Required API Stack

The API uses Node.js, TypeScript, and Express as specified for the classroom project.

### C-002 — Package Manager

pnpm is the required package manager so the setup procedure is reproducible for classmates.

### C-003 — Static Catalog Storage

BuildCores OpenDB source folders are copied unchanged into the repository as JSON files; the API data adapter normalizes required fields when loading them. No external database is required to start the API.

### C-004 — Classroom Startup

At least two classmates must be able to start the API with minimal setup and documented commands.

### C-005 — Bounded API Responsibility

The API exposes only data and operations required by the separate mobile application; compatibility and power calculations remain client-side for the MVP.

### C-006 — Classroom Scope

The API must remain straightforward to run and must not become a second teaching topic during the React Native presentation.

### C-007 — Localhost Development CORS and LAN Demo Access

CORS is limited to localhost origins for local development. Express runs on default port `3000` listening on LAN interfaces (`0.0.0.0`) so physical mobile devices on the same local network can access the student's API during demos. Metro bundler runs separately on port `5562`. No deployed API or public origin is planned.

## 8. Business Rules

### BR-001 — Read-Only Catalog

Public API operations do not create, update, or delete component catalog records.

### BR-002 — Stable Component Identifiers

Component identifiers remain stable within a dataset version and can be used for detail lookups.

### BR-003 — Canonical Categories

Category values use the canonical names defined by the API contract.

### BR-004 — Search Behavior

Search is case-insensitive and is limited to approved normalized fields.

### BR-005 — Explicit Filters

Filters are explicitly supported by the API contract; unsupported filters are rejected, not silently interpreted.

### BR-006 — Preserve Missing Specifications

Missing component specifications remain distinguishable from zero or false values; the API does not invent missing hardware values.

### BR-007 — Normalize and Trace Source Data

The original BuildCores OpenDB JSON files are kept unchanged in the repository. The API maps only component fields needed for filtering, display, and mobile compatibility analysis into its response; OpenDB metadata is not exposed, and raw filesystem paths are never returned.

### BR-008 — No User Workspace Persistence

The API does not persist user-created builds or favorites in the MVP.

## 9. Edge Cases

| ID | Scenario | Expected Behavior | Related Requirement |
| --- | --- | --- | --- |
| EC-001 | A category dataset exists but is empty | Return a successful empty collection | FR-002 |
| EC-002 | A required category dataset file is missing | Fail startup validation or return the documented controlled server error | FR-002, NFR-001 |
| EC-003 | A JSON record violates the normalized schema | Identify the invalid record and prevent silent corruption | FR-002, FR-012 |
| EC-004 | The client requests an unknown category | Return a consistent 4xx JSON error | FR-008, FR-011 |
| EC-005 | The client requests an unknown component ID | Return a standard 404 JSON error | FR-009, FR-011 |
| EC-006 | A filter is unsupported or malformed | Return a validation error instead of ignoring it | FR-005, FR-010 |
| EC-007 | A query returns a large result set | Return the requested page with total and totalPages metadata; use page size 50 when omitted | FR-002, FR-010 |
| EC-008 | The API process is unavailable | The client receives a connection failure and can retry after service recovery | FR-007 |
| EC-009 | An unexpected server error occurs | Return a generic safe 500 response; retain diagnostic detail outside the response | FR-011, NFR-004 |
| EC-010 | The client requests a page number greater than `totalPages` | Return a standard 404 JSON error | FR-010, FR-011 |

## 10. Out of Scope

| ID | Excluded Item | Reason | Potential Future Release |
| --- | --- | --- | --- |
| OOS-001 | PostgreSQL, MongoDB, Prisma, or other database infrastructure | Static version-controlled JSON is sufficient for the classroom MVP | Unknown |
| OOS-002 | User accounts, password authentication, and OAuth | The API is a public read-only catalog service for the MVP | Unknown |
| OOS-003 | Firebase and Firestore | No user workspace or cloud persistence is required | Unknown |
| OOS-004 | Build and favorite persistence | These are mobile-local concerns and not API responsibilities | Unknown |
| OOS-005 | Prices, retailers, Amazon integration, purchases, payments, and orders | The product is not an ecommerce service | Won't |
| OOS-006 | Administrative catalog editing endpoints | Catalog data is prepared and version-controlled outside the API | Unknown |
| OOS-007 | Server-side compatibility and power calculations | Mobile performs these analyses locally in the MVP | Unknown |
| OOS-008 | Microservices and background workers | They add infrastructure unrelated to the classroom MVP | Unknown |

## 11. Traceability Matrix

| SPEC Feature | User Flow | Requirement | Acceptance Criteria | Task |
| --- | --- | --- | --- | --- |
| F-001 Component Catalog API | UF-001 | FR-001, FR-002, FR-003, FR-008, FR-012 | AC-FR-001-01, AC-FR-002-01, AC-FR-003-01, AC-FR-008-01, AC-FR-012-01 | M1-T02, M2-T01 to M2-T03, M3-T02 to M3-T03 |
| F-002 Component Search | UF-002 | FR-004 | AC-FR-004-01 | M2-T03, M3-T03 |
| F-003 Component Filtering | UF-003 | FR-005, FR-010 | AC-FR-005-01, AC-FR-010-01 | M1-T01 to M1-T02, M3-T03 |
| F-004 Component Details | UF-004 | FR-006, FR-009 | AC-FR-006-01, AC-FR-009-01 | M2-T03, M3-T04 |
| F-005 Health Check | UF-005 | FR-007 | AC-FR-007-01 | M3-T01 to M3-T02 |
| Cross-cutting API behavior | UF-001 to UF-005 | FR-011, NFR-003, NFR-004, NFR-005 | AC-FR-011-01, AC-NFR-003-01, AC-NFR-004-01, AC-NFR-005-01 | M3-T01, M3-T05 |
| Classroom reproducibility | Journey 01 | NFR-001, NFR-002, NFR-006 | AC-NFR-001-01, AC-NFR-002-01, AC-NFR-006-01 | M2-T02, M4-T01, M4-T02, M4-T04 |
| Mobile API connectivity | UF-001 | NFR-007 | AC-NFR-007-01, AC-NFR-007-02 | M3-T01, M3-T05 |

## 12. Requirement Dependencies

| Requirement | Depends On | Reason |
| --- | --- | --- |
| FR-002 | FR-001, FR-012 | Category requests require canonical categories and the local OpenDB snapshot normalized by the data adapter. |
| FR-003 | FR-002 | Stable identifiers are included with returned component records. |
| FR-004 | FR-002 | Search operates over catalog records. |
| FR-005 | FR-002, FR-010 | Filtering requires catalog records and validated supported parameters. |
| FR-006 | FR-003 | Detail lookup uses the stable component identifier. |
| FR-008 | FR-001 | The API must know the supported categories to reject unknown categories. |
| FR-009 | FR-003 | A missing detail lookup is determined against the stable identifier space. |
| FR-011 | NFR-004 | Consistent errors must also meet error-safety constraints. |
| NFR-001 | C-002, C-003 | Reproducible startup depends on documented pnpm setup and repository data. |

## 13. Open Questions

- [NEEDS CLARIFICATION: After the OpenDB snapshot is added, which source fields support each normalized component response and category filter?]
- [RESOLVED: A request for `page > totalPages` returns a standard 404 Not Found error (treated as a non-existent resource).]

## 14. Verification Strategy

Verify functional requirements with service unit tests and API integration tests, including valid catalog requests, pagination, search and filter combinations, detail lookup, health status, invalid inputs, and consistent error responses. Verify that the unchanged OpenDB snapshot is normalized correctly by the adapter and remains deterministic. Verify startup, reproducibility, localhost CORS, and database-free operation by following the documented pnpm setup in a clean environment. Use classroom verification to confirm that at least two classmates can start and consume the API. The AC identifiers above define the concrete checks for each requirement.

## 15. Related Documentation

- [SPEC.md](SPEC.md)
- [USERJOURNEY.md](USERJOURNEY.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [SPEC.md](SPEC.md)
