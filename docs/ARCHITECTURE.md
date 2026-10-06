# Architecture

## Document Information

| Field | Value |
| --- | --- |
| Project | `PCForge API` |
| Document | Architecture |
| Version | `0.1` |
| Status | `Draft` |
| Last Updated | `2026-10-01` |
| Architecture Style | `Layered modular monolith with read-only catalog services and JSON data adapters` |

## Related Documentation

* [CONSTITUTION](CONSTITUTION.md)
* [SPEC](SPEC.md)
* [REQUIREMENTS](REQUIREMENTS.md)
* [PLAN](PLAN.md)
* [NAVIGATIONMAP](NAVIGATIONMAP.md)
* [SECURITY](SECURITY.md)
* [API](API.md)

---

## 1. Purpose

This document defines the architecture of the PCForge API and the boundaries between HTTP handling, application services, data access, validation, and static catalog data.

The architecture is intentionally a small modular monolith because the service has one primary responsibility: exposing a prepared component catalog to the React Native application.

## 2. Architectural Drivers

| Driver | Source | Architectural Impact |
| --- | --- | --- |
| No database setup for students | SPEC / NFR-001, NFR-006 | JSON files are the MVP persistence source |
| Read-oriented catalog | SPEC / F-001 to F-004 | API is optimized for retrieval rather than transactional writes |
| Stable mobile contract | SPEC / FR-002 to FR-006 | Controller and response models form an explicit API boundary |
| Input validation | SPEC / NFR-003 | Query and path parameters are validated at the HTTP boundary |
| Classroom reproducibility | SPEC / NFR-002 | Version-controlled data is deterministic |
| Maintainability | SPEC / NFR-005 | Layered modules separate transport, application logic, and data access |
| Security | Backend Developer standards | CORS, validation, safe errors, headers, and rate limiting where appropriate |
| Future storage migration | Architecture evolution | Repository/data adapter boundary avoids coupling controllers to JSON files |

## 3. Architecture Overview

### 3.1 Architectural Style

**Style:** Layered modular monolith with a repository/data-adapter boundary.

The API runs as one Node.js process. HTTP controllers handle transport concerns, services implement catalog use cases, repositories expose catalog data, and JSON adapters provide the current data source.

No microservices are introduced because the project has one bounded responsibility, low classroom scale, and no operational requirement for distributed deployment.

### 3.2 High-Level Structure

```text
HTTP Request
    ↓
Routes
    ↓
Controllers
    ↓
Services
    ↓
Repositories
    ↓
JSON Data Adapter
    ↓
Version-controlled catalog data
```

Cross-cutting concerns such as validation, error handling, CORS, security headers, logging, and health checks remain at the application boundary.

### 3.3 Architectural Principles

* Keep HTTP transport separate from catalog logic.
* Keep data-source details out of controllers.
* Validate untrusted input at the HTTP boundary.
* Return stable response contracts.
* Never invent missing source data.
* Prefer deterministic local data for the classroom MVP.
* Keep the JSON adapter replaceable by a future database adapter.
* Do not introduce microservices without a concrete operational requirement.
* Do not add persistence for user builds or favorites to the backend MVP.

## 4. Architectural Patterns

| Pattern | Problem Solved | Application | Constraints |
| --- | --- | --- | --- |
| Layered architecture | Separates transport, application, and data responsibilities | Routes → controllers → services → repositories | Dependencies flow inward |
| Repository boundary | Prevents services from depending on JSON implementation | Component repository | Must expose domain-oriented operations |
| Adapter | Allows JSON to be replaced later | JSON catalog adapter | No raw filesystem access outside data layer |
| DTO / response model | Stabilizes API contract | API response schemas | Do not expose arbitrary internal structures |
| Service layer | Centralizes catalog use cases | Search, filtering, detail retrieval | Must remain framework-light |
| Middleware | Handles cross-cutting HTTP concerns | CORS, security, errors | Must not contain catalog business logic |

### 4.1 Layered Architecture

#### 4.1.1 Purpose

Provide a simple and explicit dependency direction appropriate for a small backend.

#### 4.1.2 Application

```text
routes
  ↓
controllers
  ↓
services
  ↓
repositories
  ↓
data adapters
```

#### 4.1.3 Dependency Rules

Routes may depend on controllers.

Controllers may depend on services.

Services may depend on repository interfaces or repository modules.

Repositories may depend on data adapters.

Lower layers must not depend on Express request/response objects.

### 4.2 Repository / Data Adapter

#### 4.2.1 Purpose

Allow the catalog data source to change without rewriting API controllers.

#### 4.2.2 Application

The current implementation uses a JSON repository.

A future implementation could use a database repository while preserving service behavior.

#### 4.2.3 Dependency Rules

The service layer must not read JSON files directly.

The JSON adapter owns filesystem access and data loading.

## 5. System Architecture

### 5.1 Technology Boundaries

| Boundary | Technology | Responsibility | Ownership |
| --- | --- | --- | --- |
| HTTP server | Node.js | Runtime | Internal platform |
| Web framework | Express | HTTP routing and middleware | External library |
| Application language | TypeScript | Backend implementation | Internal |
| Validation | Schema validation library or project validator | Validate request and dataset structures | External/internal |
| Catalog repository | TypeScript module | Catalog access contract | Internal |
| Data adapter | TypeScript JSON adapter | Read unchanged OpenDB files and map required fields into normalized API models | Internal |
| Source dataset | Local BuildCores OpenDB snapshot | Original component information, copied without modification | External-origin data stored in repository |
| API documentation | OpenAPI, if enabled | API contract documentation | Internal |
| Monitoring | Console/structured logging initially | Diagnostics | Internal |

### 5.2 System Context

PCForge Mobile is the primary consumer.

The API reads a local snapshot of BuildCores OpenDB folders copied into the repository unchanged. Its data adapter maps the required source fields into normalized API records. The API does not communicate with a BuildCores-hosted service at runtime in the MVP.

### 5.3 Service Structure

The API is a single deployable service. Requests enter through Express routes, pass through validation and controllers to catalog services, then use repositories and the JSON data adapter to read and normalize the local OpenDB snapshot.

## 6. Frontend / Client Architecture

### 6.1 Responsibilities

The frontend is external to this repository.

The API must provide a stable contract that supports:

* Category browsing.
* Component listing.
* Paginated component listing using `page` and `pageSize`.
* Search.
* Filtering.
* Component detail retrieval.
* Health verification.

### 6.2 Presentation

The API has no frontend presentation layer.

HTTP response serialization is the presentation boundary of the service.

### 6.3 Domain

The backend domain is intentionally small and catalog-oriented.

Domain responsibilities include:

* Component categories.
* Normalized component representation.
* Supported search behavior.
* Supported filters.
* Stable component identity.

Compatibility and power calculations remain in the mobile MVP unless the product requirements are later changed.

### 6.4 Data / Infrastructure

Infrastructure includes:

* Express.
* OpenDB JSON snapshot loading and response mapping.
* Localhost-only development CORS.
* Security middleware.
* Logging.
* Environment configuration.

The JSON adapter is an infrastructure concern and must not leak into the controller layer.

## 7. Backend Architecture

### 7.1 Responsibilities

The backend is responsible for:

* Serving component catalog data.
* Validating requests.
* Applying supported search and filters.
* Returning component details.
* Reporting service health.
* Providing predictable error responses.
* Validating source structures and normalized records at the data boundary.
* Supporting reproducible local execution.

### 7.2 API Boundary

Primary endpoints:

```text
GET /api/health
GET /api/categories
GET /api/components
GET /api/components/:id
```

Search, filters, `page`, and `pageSize` are query parameters on the component collection endpoint unless the API contract later requires dedicated endpoints. The default page size is 50; supported sizes are 10, 20, 30, 40, and 50. Responses include total record and page counts.

The exact response schemas must be documented in `API.md`.

### 7.3 Services / Use Cases

Primary application services:

```text
components.service.ts
```

Responsibilities include:

* List categories.
* List components.
* Search components.
* Filter components.
* Retrieve a component by identifier.

The service must not receive Express `Request` or `Response` objects.

### 7.4 External Integrations

BuildCores OpenDB is a source dataset rather than a runtime API dependency in the classroom MVP.

The project team manually downloads the OpenDB folders and copies them into the repository without modifying their contents. The snapshot is fixed during the development/classroom period. The API adapter performs the mapping to normalized response models; exact category fields and filters are finalized after the snapshot is inspected.

No Firebase, database, Amazon, retailer, or payment integration exists in the MVP.

## 8. Firebase Architecture

> Remove this section if Firebase is not used.

Firebase is not used by the PCForge API MVP.

Authentication and Firestore, if implemented, belong to the mobile repository for the optional cloud workspace unless future requirements explicitly move those responsibilities to the backend.

## 9. Local Persistence

The backend uses a version-controlled snapshot of BuildCores OpenDB JSON folders as its catalog source. The original files remain unchanged; normalization occurs in the JSON data adapter at load time.

This is not treated as a transactional application database.

The data flow is:

```text
Manual download of BuildCores OpenDB folders
  ↓
Unchanged, version-controlled JSON snapshot
      ↓
JSON data adapter
  ↓
Normalized in-memory catalog models
      ↓
Repository
      ↓
Service
      ↓
API response
```

The API does not persist user-created builds or favorites.

The snapshot may be loaded at startup and held in memory for efficient classroom access. The adapter validates source structures and mapped records; malformed data must fail validation rather than silently entering application state. The downloaded source files must not be rewritten by the application.

## 10. Package and Component Architecture

### 10.1 Project Structure

```text
pcforge-api/
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── constants/
│   │   ├── categories.ts
│   │   └── routes.ts
│   ├── controllers/
│   │   ├── categories.controller.ts
│   │   ├── components.controller.ts
│   │   └── health.controller.ts
│   ├── dto/
│   │   ├── component-query.dto.ts
│   │   └── component-response.dto.ts
│   ├── errors/
│   │   ├── app-error.ts
│   │   └── error-codes.ts
│   ├── middleware/
│   │   ├── error-handler.ts
│   │   ├── not-found.ts
│   │   └── validation.ts
│   ├── repositories/
│   │   ├── component.repository.ts
│   │   └── json-component.repository.ts
│   ├── routes/
│   │   ├── categories.routes.ts
│   │   ├── components.routes.ts
│   │   └── health.routes.ts
│   ├── services/
│   │   └── components.service.ts
│   ├── types/
│   │   └── component.ts
│   ├── data/
│   │   └── loader.ts
│   └── server.ts
├── data/
│   ├── opendb/              # Contents of upstream open-db/, unchanged
│   └── schemas/             # Matching upstream JSON Schemas, unchanged
├── scripts/
│   └── validate-data.ts     # Project-owned snapshot validation utility
├── test/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### 10.2 Component Responsibilities

| Component | Responsibility | Depends On | Must Not Depend On |
| --- | --- | --- | --- |
| Route | Declare HTTP endpoints and middleware | Controller | JSON files |
| Controller | Translate HTTP requests to service calls | Service, DTOs | Filesystem |
| Service | Implement catalog use cases | Repository | Express response objects |
| Repository | Provide catalog access | Data adapter | Express |
| JSON adapter | Read unchanged OpenDB JSON and map/validate normalized records | Filesystem, schemas | HTTP |
| DTO | Define request/response contracts | Types | Express internals where avoidable |
| Middleware | Cross-cutting request processing | Express | Catalog logic |
| Error handler | Convert exceptions to safe responses | App errors | Raw stack traces in production responses |
| Data loader | Load and validate prepared data | JSON files, schemas | Controllers |

## 11. Data Flow

### 11.1 Primary Flow

```text
HTTP Request
  → Route
  → Controller
  → Components Service
  → Component Repository
  → OpenDB JSON Data Adapter (read and normalize)
  → Normalized Component
  → Service
  → Controller
  → JSON Response
```

For search and filtering, the service applies supported query criteria to the repository data or delegates supported filtering to the repository boundary.

### 11.2 Error Flow

```text
Invalid Request
    ↓
Validation Middleware
    ↓
400 Response
```

For application errors:

```text
Controller / Service
    ↓
App Error
    ↓
Error Middleware
    ↓
Safe JSON Error
```

Unexpected errors must be logged internally and returned as generic server errors.

### 11.3 Synchronization Flow

No runtime synchronization exists in the MVP.

BuildCores data synchronization is a development/data-preparation process:

```text
Manual one-time download of BuildCores OpenDB folders
  ↓
Copy folders unchanged into the version-controlled repository snapshot
  ↓
Adapter/schema validation and mapping tests
  ↓
API release
```

## 12. State Management

### 12.1 State Model

The API is stateless with respect to users.

Runtime state is limited to:

* Loaded catalog data.
* Environment configuration.
* Application metadata.

### 12.2 Reactive State

No reactive frontend state exists in the backend.

### 12.3 Loading / Success / Error States

HTTP responses communicate:

* Success.
* Client validation error.
* Not found.
* Server error.

Dataset loading and validation occur during startup or controlled lazy initialization according to the final implementation.

### 12.4 Asynchronous Execution

Node.js asynchronous I/O is used for startup data loading and HTTP handling.

No queues, workers, scheduled jobs, or background processing are required for the MVP.

## 13. Additional Patterns and Rules

### 13.1 Dependency Injection

A DI framework is not required.

Repository modules may be passed into services through constructors or factory functions if that improves testability.

### 13.2 Mapping

The original BuildCores OpenDB files remain unchanged. The adapter maps only the component fields needed by the approved API response and filters into normalized public models. OpenDB metadata and internal file paths are not exposed.

The API response model should not expose internal file structure or source-specific implementation artifacts unless explicitly required.

### 13.3 Error Handling

Use a consistent application error model with:

```text
code
message
details (optional and safe)
```

Do not expose stack traces, absolute paths, secrets, or internal dependency errors through API responses.

### 13.4 Concurrency

The MVP is read-only and stateless, so distributed concurrency control is unnecessary.

If catalog hot reload or runtime data mutation is introduced later, the architecture must define synchronization and consistency behavior before implementation.

## 14. Testing Architecture

| Test Level | Scope | Main Purpose |
| --- | --- | --- |
| Unit | Services, filters, repositories, validators | Validate isolated backend behavior |
| Integration | Express routes and services | Validate HTTP contracts and dependency wiring |
| UI | Not applicable | Owned by mobile repository |
| E2E | API + mobile consumer where useful | Validate the complete client/server flow |

### 14.1 Test Boundaries

Unit tests should cover:

* Search behavior.
* Filter behavior.
* Category validation.
* Component lookup.
* Dataset validation.
* Error mapping.

Integration tests should cover:

* Health endpoint.
* Categories endpoint.
* Component listing.
* Search.
* Filters.
* Detail lookup.
* 404 behavior.
* Validation errors.

### 14.2 Test Doubles

Use in-memory repository data or test fixtures for service tests.

Integration tests may use the real JSON dataset because it is version-controlled and deterministic, provided tests do not mutate it.

No external database test container is required.

## 15. SOLID Principles

| Principle | Application in This Project |
| --- | --- |
| Single Responsibility | Controllers handle HTTP translation, services handle catalog use cases, repositories handle data access |
| Open/Closed | New data adapters or filter strategies can be added without rewriting controllers |
| Liskov Substitution | Repository implementations can replace the JSON repository when they satisfy the same contract |
| Interface Segregation | Catalog operations should remain focused rather than creating a universal backend interface |
| Dependency Inversion | Services depend on repository boundaries rather than direct filesystem access |

## 16. Architecture Constraints

* Node.js and TypeScript are required.
* Express is the HTTP framework.
* pnpm is the package manager.
* An unchanged local JSON snapshot is the MVP catalog source; the adapter normalizes it for API responses.
* No mandatory external database.
* Controllers must not access JSON files directly.
* Services must not depend on Express request/response objects.
* The API must validate untrusted input.
* The API must not expose internal exceptions or secrets.
* No authentication is required for the catalog MVP.
* No user build or favorite persistence is required.
* No microservices.
* No runtime network dependency on a BuildCores-hosted service.
* No direct dependency from the mobile application on backend filesystem structure.

## 17. Architecture Evolution

### Current Architecture

```text
Express
  ↓
Controllers
  ↓
Services
  ↓
Repository
  ↓
JSON Adapter
  ↓
Version-controlled data
```

### Expected Evolution

If the project grows beyond the classroom catalog, the repository boundary can support:

```text
Services
   ↓
Repository
   ↓
PostgreSQL / MongoDB / other persistent store
```

Authentication and user workspace persistence may also be introduced if the product later moves cloud persistence into the backend.

### Migration Rules

* Preserve the public API contract during storage migration.
* Replace the repository/data adapter rather than rewriting controllers.
* Introduce migrations only when a real database is adopted.
* Introduce transactions only for state-changing operations that require them.
* Do not introduce a database merely to increase architectural complexity.
* Do not move compatibility logic to the backend unless centralized validation becomes a product requirement.

## 18. Architectural Decisions

| ID | Decision | Reason | Alternatives Considered |
| --- | --- | --- | --- |
| ADR-001 | Use Node.js + TypeScript | Matches the project's JavaScript/TypeScript ecosystem and is easy to run in class | Python, Java |
| ADR-002 | Use Express | Minimal HTTP framework with low classroom overhead | NestJS, Fastify |
| ADR-003 | Use a modular monolith | One bounded catalog responsibility does not justify distributed services | Microservices |
| ADR-004 | Use JSON for MVP data | Removes database installation and configuration from classmates | PostgreSQL, MongoDB |
| ADR-005 | Keep backend read-oriented | Mobile owns local builds/favorites in MVP | Full CRUD backend |
| ADR-006 | Separate repository boundary | Allows future storage migration | Direct JSON access from services |
| ADR-007 | Keep compatibility calculations in mobile | Keeps the class focused on React Native | Server-side compatibility engine |
| ADR-008 | Keep BuildCores as a prepared source | Prevents runtime dependence on an external source during class | Live external source integration |
| ADR-009 | Use pnpm | Consistent package management across project repositories | npm, yarn |

## 19. Architecture Verification Checklist

* [x] Architecture matches approved requirements.
* [x] Dependency direction is explicit.
* [x] No forbidden dependency exists in the current package manifest.
* [x] Major patterns are documented and justified.
* [x] Testing boundaries are defined.
* [x] SOLID principles are addressed.
* [x] Specialized documents remain consistent.
* [x] No unresolved architectural contradiction remains.

## 20. Change Log

| Version | Date | Change | Reason |
| --- | --- | --- | --- |
| `0.1` | `2026-10-01` | Initial backend architecture | Establish classroom-oriented API boundaries and data strategy |
