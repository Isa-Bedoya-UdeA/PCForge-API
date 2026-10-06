# API

## 1. Purpose

This document defines the authoritative HTTP REST API contract for `pcforge-api`. It specifies the endpoints, request schemas, response envelopes, query filters, pagination rules, and error contracts consumed by the PCForge Mobile client application. All implementations in `src/` and contract tests in `test/integration/` must conform to this specification.

## 2. API Overview

| Property | Value |
| --- | --- |
| Protocol | HTTP/1.1 over TCP |
| Data Format | JSON (`application/json`) |
| Consumers | PCForge Mobile Application (React Native / Expo), classroom developers |
| Backend | Node.js 24 + Express 5 + TypeScript (in-memory modular monolith) |
| Versioning | Path-based `/api` prefix (v1 baseline); no active multi-version matrix |

## 3. Architecture and Boundaries

```text
PCForge Mobile App (Expo / React Native)
  │ (HTTP requests over LAN / localhost)
  ▼
Express 5 Application Boundary (/api)
  ├── CORS & Security Headers Middleware
  ├── Zod Request Validation Middleware
  ├── Route Controllers (Health, Categories, Components)
  ├── Application Service Layer (Search, Filter, Pagination)
  ├── Repository Layer (ComponentRepository)
  ├── In-Memory Data Adapter (Snapshot Loader with Ajv Draft-07 validation)
  └── Centralized Error Middleware (Safe JSON Error Envelope)
```

The API acts as a read-only gateway between the mobile client and the version-controlled BuildCores OpenDB snapshot. Transport concerns, validation, and error transformations are encapsulated within Express middleware. Catalog business logic is framework-agnostic. The API never mutates data, exposes filesystem paths, or leaks raw OpenDB metadata envelopes.

## 4. Environments and Base URLs

| Environment | Base URL | Notes |
| --- | --- | --- |
| Local Development (Host PC) | `http://localhost:3000/api` | Standard local execution on workstation |
| Local Loopback (Alternative) | `http://127.0.0.1:3000/api` | Direct loopback IP |
| Mobile Expo LAN Demo | `http://<HOST_LAN_IP>:3000/api` | Accessible by physical mobile devices connected to the same WiFi subnet (Metro bundler runs separately on port 5562) |
| Staging | Not Applicable | Excluded from educational classroom scope |
| Production | Not Applicable | Local-only educational deployment model |

## 5. Authentication

**Status: None (Public API)**

The PCForge API MVP is an unauthenticated, read-only catalog service designed for educational use. No API keys, JWT tokens, cookies, or OAuth flows are required or supported.

## 6. Authorization

**Status: None**

All endpoints are publicly accessible to local clients without role-based access control (RBAC) or permission scoping.

## 7. API Conventions

### Methods / Operations

The API strictly implements idempotent, read-only HTTP methods:

* `GET` — Used exclusively for data retrieval (health check, category listing, component queries, and detail lookups).
* Mutations (`POST`, `PUT`, `PATCH`, `DELETE`) are not supported and return `405 Method Not Allowed` or `404 Not Found`.

### Naming

* **URL Paths:** Lowercase kebab-case plural resources (e.g., `/api/categories`, `/api/components`).
* **Query Parameters:** Lowercase camelCase (e.g., `page`, `pageSize`, `category`, `search`).
* **JSON Properties:** Lowercase camelCase (e.g., `id`, `name`, `manufacturer`, `specifications`, `totalPages`).
* **Error Codes:** Screaming snake-case (e.g., `VALIDATION_ERROR`, `COMPONENT_NOT_FOUND`, `PAGE_NOT_FOUND`).

### Headers

#### Request Headers

| Header | Required | Value | Description |
| --- | --- | --- | --- |
| `Accept` | No | `application/json` | Preferred client representation format |
| `Origin` | No | `http://localhost:*` | Evaluated against allowed local CORS origins |

#### Response Headers

| Header | Value | Description |
| --- | --- | --- |
| `Content-Type` | `application/json; charset=utf-8` | MIME type for all responses |
| `Access-Control-Allow-Origin` | Configured local origin | Enforces local development CORS policy |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |

### Data Formats

* **Payload Encoding:** UTF-8 encoded JSON.
* **Date / Timestamps:** ISO 8601 extended format in UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
* **Identificators:** Non-empty string identifiers derived from OpenDB source filename stems (UUID format, e.g. `ebff2be8-3870-47b5-ac0e-a09f3bece51a`).
* **Empty Collections:** Represented as empty arrays `[]`, never as `null`.
* **Missing Specifications:** Represented as `null` or omitted; never fabricated as `0`, `""`, or `false`.

### Status Codes

| Code | Meaning | Usage |
| ---: | --- | --- |
| 200 | OK | Successful query or resource retrieval |
| 400 | Bad Request | Request validation failed (invalid query parameter, malformed filter, unsupported page size) |
| 404 | Not Found | Resource not found (unknown component ID, unknown route, or `page > totalPages`) |
| 500 | Internal Server Error | Unhandled server exception (sanitized safe JSON response; diagnostic logs kept server-side) |

---

## 8. Endpoints / Operations

### API-001 — Health Check

| Property | Value |
| --- | --- |
| Method / Operation | `GET` |
| Path | `/api/health` |
| Purpose | Provide operational status and service metadata to verify API availability |
| Authentication | None |
| Authorization | None |

#### Parameters

None.

#### Request

```text
GET /api/health HTTP/1.1
Host: localhost:3000
Accept: application/json
```

#### Validation

No body or query parameters permitted.

#### Success Response

**Status: 200 OK**

```json
{
  "status": "ok",
  "timestamp": "2026-10-05T20:00:00.000Z",
  "service": "pcforge-api",
  "version": "1.0.0"
}
```

#### Error Responses

| Status | Error | Meaning |
| ---: | --- | --- |
| 500 | `INTERNAL_SERVER_ERROR` | Server encountered an unhandled startup or runtime failure |

#### Side Effects

None.

#### Idempotency

Idempotent (`GET`).

#### Related Requirements

* `FR-007`, `NFR-001`
* User Flow `UF-005`

---

### API-002 — List Component Categories

| Property | Value |
| --- | --- |
| Method / Operation | `GET` |
| Path | `/api/categories` |
| Purpose | Retrieve the canonical list of hardware component categories supported by the catalog |
| Authentication | None |
| Authorization | None |

#### Parameters

None.

#### Request

```text
GET /api/categories HTTP/1.1
Host: localhost:3000
Accept: application/json
```

#### Validation

No query or body parameters permitted.

#### Success Response

**Status: 200 OK**

```json
{
  "data": [
    "CPU",
    "CPUCooler",
    "Motherboard",
    "RAM",
    "Storage",
    "GPU",
    "PCCase",
    "PSU",
    "CaseFan"
  ],
  "total": 9
}
```

#### Error Responses

| Status | Error | Meaning |
| ---: | --- | --- |
| 500 | `INTERNAL_SERVER_ERROR` | Dataset repository failed to initialize canonical categories |

#### Side Effects

None.

#### Idempotency

Idempotent (`GET`).

#### Related Requirements

* `FR-001`, `FR-008`
* User Flow `UF-001`

---

### API-003 — List and Filter Components (Paginated)

| Property | Value |
| --- | --- |
| Method / Operation | `GET` |
| Path | `/api/components` |
| Purpose | Query component records with optional category filtering, text search, specification filters, and pagination |
| Authentication | None |
| Authorization | None |

#### Parameters

| Name | Location | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `category` | Query | `string` | No | Canonical category name (e.g. `CPU`). Must match an approved category. |
| `search` | Query | `string` | No | Case-insensitive text search matching against component `name` or `manufacturer`. |
| `page` | Query | `integer` | No | 1-based page index. Must be an integer `>= 1`. Default: `1`. |
| `pageSize` | Query | `integer` | No | Number of records per page. Allowed values: `10`, `20`, `30`, `40`, `50`. Default: `50`. |
| `manufacturer` | Query | `string` | No | Exact case-insensitive manufacturer filter (e.g. `AMD`, `Intel`, `NVIDIA`). |

#### Request

```text
GET /api/components?category=CPU&search=Ryzen&page=1&pageSize=10 HTTP/1.1
Host: localhost:3000
Accept: application/json
```

#### Validation

* `page`: Parsed as integer. Must satisfy `page >= 1`. Non-integer or values `< 1` produce `400 Bad Request`.
* `pageSize`: Parsed as integer. Must be strictly one of `[10, 20, 30, 40, 50]`. Other values produce `400 Bad Request`.
* `category`: If provided, must match one of the canonical categories in `/api/categories`. Unknown categories produce `400 Bad Request` (`INVALID_CATEGORY`).
* Unknown query parameters: Unsupported filter keys are rejected with `400 Bad Request` (`UNSUPPORTED_PARAMETER`) to prevent silent misinterpretation.

#### Success Response

**Status: 200 OK** (When `page <= totalPages` or `total == 0`)

```json
{
  "data": [
    {
      "id": "ebff2be8-3870-47b5-ac0e-a09f3bece51a",
      "category": "CPU",
      "name": "AMD Ryzen 7 7800X3D",
      "manufacturer": "AMD",
      "specifications": {
        "series": "Ryzen 7",
        "microarchitecture": "Zen 4",
        "coreCount": 8,
        "threadCount": 16,
        "baseClockGhz": 4.2,
        "boostClockGhz": 5.0,
        "tdpWatts": 120,
        "socket": "AM5",
        "integratedGraphics": "Radeon Graphics",
        "includesCooler": false,
        "l3CacheMb": 96
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

*Note on Empty Results (`total === 0`):*  
When no components match the filter criteria, the API returns status `200 OK`:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 0,
    "totalPages": 0
  }
}
```

#### Error Responses

| Status | Error | Meaning |
| ---: | --- | --- |
| 400 | `VALIDATION_ERROR` | Invalid parameter format, negative page, non-whitelisted pageSize, or unsupported filter |
| 400 | `INVALID_CATEGORY` | Provided `category` is not a recognized canonical category |
| 404 | `PAGE_NOT_FOUND` | Requested `page > totalPages` (when `total > 0`). Non-existent page requested |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected error occurred while querying repository |

#### Side Effects

None.

#### Idempotency

Idempotent (`GET`).

#### Related Requirements

* `FR-002`, `FR-004`, `FR-005`, `FR-008`, `FR-010`, `FR-011`
* User Flows `UF-001`, `UF-002`, `UF-003`

---

### API-004 — Get Component Details by ID

| Property | Value |
| --- | --- |
| Method / Operation | `GET` |
| Path | `/api/components/:id` |
| Purpose | Retrieve complete normalized data for an individual component identified by its stable ID |
| Authentication | None |
| Authorization | None |

#### Parameters

| Name | Location | Type | Required | Description |
| --- | --- | --- | --- | --- |
| `id` | Path | `string` | Yes | Stable identifier stem derived from the source JSON filename (e.g. `ebff2be8-3870-47b5-ac0e-a09f3bece51a`) |

#### Request

```text
GET /api/components/ebff2be8-3870-47b5-ac0e-a09f3bece51a HTTP/1.1
Host: localhost:3000
Accept: application/json
```

#### Validation

* `id`: Must be a non-empty string. Path traversal sequences (`..`, `/`, `\`) or empty values are rejected.

#### Success Response

**Status: 200 OK**

```json
{
  "data": {
    "id": "ebff2be8-3870-47b5-ac0e-a09f3bece51a",
    "category": "CPU",
    "name": "AMD Ryzen 7 7800X3D",
    "manufacturer": "AMD",
    "specifications": {
      "series": "Ryzen 7",
      "microarchitecture": "Zen 4",
      "coreCount": 8,
      "threadCount": 16,
      "baseClockGhz": 4.2,
      "boostClockGhz": 5.0,
      "tdpWatts": 120,
      "socket": "AM5",
      "integratedGraphics": "Radeon Graphics",
      "includesCooler": false,
      "l3CacheMb": 96
    }
  }
}
```

#### Error Responses

| Status | Error | Meaning |
| ---: | --- | --- |
| 400 | `VALIDATION_ERROR` | Component ID format is invalid |
| 404 | `COMPONENT_NOT_FOUND` | No component exists matching the requested `id` |
| 500 | `INTERNAL_SERVER_ERROR` | Internal server failure during component lookup |

#### Side Effects

None.

#### Idempotency

Idempotent (`GET`).

#### Related Requirements

* `FR-003`, `FR-006`, `FR-009`, `FR-011`
* User Flow `UF-004`

---

## 9. Data Schemas

### Schema — Normalized Component (`NormalizedComponent`)

| Field | Type | Required | Nullable | Description |
| --- | --- | ---: | ---: | --- |
| `id` | `string` | Yes | No | Stable identifier derived from the source JSON filename stem (e.g. UUID) |
| `category` | `string` | Yes | No | Canonical category identifier (e.g. `CPU`, `Motherboard`) |
| `name` | `string` | Yes | No | Full display name of the component |
| `manufacturer` | `string` | No | Yes | Brand/manufacturer name, or `null` if omitted in source |
| `specifications` | `object` | Yes | No | Dictionary of category-specific technical specifications |

### Schema — Pagination Metadata (`PaginationMetadata`)

| Field | Type | Required | Nullable | Description |
| --- | --- | ---: | ---: | --- |
| `page` | `integer` | Yes | No | Current 1-based page number |
| `pageSize` | `integer` | Yes | No | Number of records requested per page (10, 20, 30, 40, or 50) |
| `total` | `integer` | Yes | No | Total number of component records matching the query |
| `totalPages` | `integer` | Yes | No | Total number of pages available (`ceil(total / pageSize)`, or `0` if empty) |

### Schema — Paginated Component List Response (`ComponentListResponse`)

| Field | Type | Required | Nullable | Description |
| --- | --- | ---: | ---: | --- |
| `data` | `NormalizedComponent[]` | Yes | No | Array of normalized component objects on the current page |
| `pagination` | `PaginationMetadata` | Yes | No | Pagination control metadata |

### Schema — Component Detail Response (`ComponentDetailResponse`)

| Field | Type | Required | Nullable | Description |
| --- | --- | ---: | ---: | --- |
| `data` | `NormalizedComponent` | Yes | No | Normalized component details |

### Schema — Categories Response (`CategoriesResponse`)

| Field | Type | Required | Nullable | Description |
| --- | --- | ---: | ---: | --- |
| `data` | `string[]` | Yes | No | List of canonical category strings |
| `total` | `integer` | Yes | No | Total count of supported categories |

### Schema — Health Response (`HealthResponse`)

| Field | Type | Required | Nullable | Description |
| --- | --- | ---: | ---: | --- |
| `status` | `string` | Yes | No | Service status (always `"ok"` when operational) |
| `timestamp` | `string` | Yes | No | Current server timestamp in ISO 8601 UTC format |
| `service` | `string` | Yes | No | Application identifier (`"pcforge-api"`) |
| `version` | `string` | Yes | No | API version (`"1.0.0"`) |

---

## 10. Validation

1. **Boundary Validation:**  
   All HTTP path parameters and query strings are parsed and strictly validated at the HTTP boundary using Zod schemas before being passed to controllers or services.
2. **Strict Parameter Handling:**  
   Unexpected or unsupported query parameters on `/api/components` trigger validation errors (`UNSUPPORTED_PARAMETER`) rather than being silently ignored.
3. **Pagination Constraints:**  
   `page` must be an integer `>= 1`. `pageSize` must be an integer strictly belonging to `{10, 20, 30, 40, 50}`. Default values (`page=1`, `pageSize=50`) apply automatically when omitted.
4. **Source Data Validation:**  
   Local OpenDB JSON records are validated against their upstream Draft-07 schemas using **Ajv** and `ajv-formats` during startup. Any invalid record halts server startup with an internal diagnostic, preventing invalid data from ever reaching the client.

---

## 11. Error Handling

### Error Format

All error responses strictly follow a uniform, safe JSON envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters provided",
    "details": [
      {
        "field": "pageSize",
        "message": "Expected one of [10, 20, 30, 40, 50], received 15"
      }
    ]
  }
}
```

* `error.code`: A stable, programmatic uppercase string identifying the error category.
* `error.message`: A clear, user-facing description in English explaining the error.
* `error.details`: Optional array of specific field-level validation errors (present for `VALIDATION_ERROR`).

### Error Categories

| Code | HTTP Status | Description | User Recovery |
| --- | :---: | --- | --- |
| `VALIDATION_ERROR` | 400 | Query or path parameters violate schema constraints | Correct invalid parameters per documentation |
| `INVALID_CATEGORY` | 400 | Requested category does not match canonical categories | Choose from `/api/categories` |
| `UNSUPPORTED_PARAMETER` | 400 | Unrecognized query parameter sent | Remove unsupported parameter |
| `COMPONENT_NOT_FOUND` | 404 | Component with the given ID does not exist | Verify component ID |
| `PAGE_NOT_FOUND` | 404 | Requested `page > totalPages` (when `total > 0`) | Navigate to a page within `[1, totalPages]` |
| `ROUTE_NOT_FOUND` | 404 | Endpoint path does not exist on the server | Verify route URL |
| `INTERNAL_SERVER_ERROR` | 500 | Unhandled exception or data access failure | Retry request; inspect server console logs |

**Security Guarantee:** Error responses never leak stack traces, database strings, local filesystem paths, or internal schema envelopes.

---

## 12. Pagination, Filtering, and Sorting

### Pagination

* **Model:** 1-based offset/slice pagination.
* **Default Values:** `page = 1`, `pageSize = 50`.
* **Allowed Page Sizes:** Strictly limited to `10`, `20`, `30`, `40`, `50` to maintain bounded in-memory slices.
* **Metadata Output:** Every list response includes `page`, `pageSize`, `total`, and `totalPages`.
* **Out of Bounds Policy:**  
  * If `total === 0`: Returns `200 OK` with `data: []`, `page: 1`, `totalPages: 0`.  
  * If `total > 0` and `page > totalPages`: Returns `404 Not Found` with error code `PAGE_NOT_FOUND`.

### Filtering

* Filters are applied *before* pagination slicing.
* **Category Filtering (`category`):** Restricts results strictly to the designated hardware category.
* **Search (`search`):** Performs case-insensitive substring matching against approved text fields (`name` and `manufacturer`).
* **Composition:** Multiple filter parameters compose using logical `AND` semantics.

### Sorting

* Catalog results are ordered **deterministically** across requests.
* **Default Sort Key:** Ordered by `category` ascending, then by stable `id` ascending.
* Deterministic ordering guarantees stable pagination boundaries across multiple requests without duplicate or missing items.

---

## 13. Idempotency and Retries

* All API endpoints are read-only (`GET`) and strictly idempotent: repeated requests with the same parameters yield identical representations (assuming an unchanged static dataset).
* Mobile clients may safely retry failed requests using exponential backoff if a connection timeout occurs.

---

## 14. Rate Limiting

| Scope | Limit | Response | Notes |
| --- | --- | --- | --- |
| Global / IP | None (MVP) | `429 Too Many Requests` (future) | Omitted for local development and classroom presentation; in-memory responses operate with sub-millisecond latency |

---

## 15. Versioning and Compatibility

* **Current Version:** v1 baseline mapped under `/api/*`.
* **Breaking Changes:** No breaking changes will be introduced during the semester MVP.
* **Forward Compatibility:** Additional optional fields in `specifications` will be non-breaking for clients ignoring unknown keys.

---

## 16. External Integrations

| Provider | Purpose | Authentication | Data | Failure Behavior | Documentation |
| --- | --- | --- | --- | --- | --- |
| BuildCores OpenDB | Static offline dataset source | None (files stored locally in repository) | JSON files in `data/opendb/` and schemas in `data/schemas/` | Server fails to boot if required files are corrupted | Local files only; no runtime network integration |

There are **no runtime external network dependencies**. The service is 100% self-contained and offline-ready.

---

## 17. Security

* **CORS Policy:** Restricted to approved local origins (`http://localhost:*`, `http://127.0.0.1:*`). Wildcard `*` origins are rejected.
* **Network Binding:** Express binds to `0.0.0.0` on port `3000` by default. This permits mobile devices on the same local area network (LAN) to access the API via the host computer's private IP (`http://<LAN_IP>:3000/api`) during live demonstrations.
* **Input Sanitization:** String inputs are validated through Zod; path traversal characters in ID lookups are blocked.
* **No Secret Exposure:** No `.env` secrets, credentials, or internal file paths are transmitted in responses or headers.

---

## 18. Testing and Contract Verification

| Test | Purpose | Required |
| --- | --- | :---: |
| Unit | Verify loader, repository, Zod query schemas, and Ajv Draft-07 schema validation | Yes |
| Integration | Verify Express HTTP routes, Supertest response status codes, and JSON envelopes | Yes |
| Contract | Ensure `ComponentListResponse` and `ComponentDetailResponse` match mobile types | Yes |
| Authentication | Not Applicable (public API) | No |
| Authorization | Not Applicable (public API) | No |
| Validation | Verify 400 rejection for malformed query parameters, invalid page sizes, and unknown categories | Yes |
| Error handling | Verify safe 404 for missing IDs, 404 for `page > totalPages`, and generic 500 for runtime exceptions | Yes |

---

## 19. Changelog / Evolution

| Version | Date | Change |
| --- | --- | --- |
| `1.0.0` | `2026-10-05` | Author authoritative REST API contract specification based on approved SPEC, REQUIREMENTS, and PLAN. Defines `/api/health`, `/api/categories`, `/api/components`, and `/api/components/:id`. Formalizes 404 on `page > totalPages`, Ajv Draft-07 validation, port 3000 LAN demo access, and safe JSON error envelope. |

---

## 20. Related Documentation

* [`REQUIREMENTS.md`](REQUIREMENTS.md) — Authoritative functional and non-functional requirements
* [`ARCHITECTURE.md`](ARCHITECTURE.md) — Architecture patterns, layers, and component boundaries
* [`PLAN.md`](PLAN.md) — Technical implementation plan and architectural decisions
* [`TASKS.md`](TASKS.md) — Traceable milestone tasks and completion checklists
* [`CONSTITUTION.md`](CONSTITUTION.md) — Engineering principles and quality gates
* [`SECURITY.md`](SECURITY.md) — Local security boundary and CORS posture
