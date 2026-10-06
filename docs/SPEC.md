# PCForge API — Product Specification

| Field        | Value         |
| ------------ | ------------- |
| Project      | PCForge API   |
| Document     | Specification |
| Version      | 0.1           |
| Status       | Draft         |
| Last Updated | 2026-10-01    |
| Owner        | PCForge Team  |

## 1. Overview

### 1.1 Product Summary

PCForge API is the backend service consumed by the PCForge React Native application. It exposes a read-oriented REST API for PC component catalog data from a local snapshot of BuildCores OpenDB and provides normalized responses suitable for search, filtering, pagination, component details, and build composition. The API does not call a BuildCores-hosted service at runtime.

The API intentionally avoids database infrastructure for the classroom MVP. Component data is stored in version-controlled JSON files and loaded by the service.

### 1.2 Problem Statement

The mobile application requires a stable, simple, and reproducible source of component data without requiring students to install or configure a database server during the React Native class.

The backend solves this by placing a controlled API boundary between the mobile application and the source dataset.

### 1.3 Target Users

| User               | Description                                          | Primary Goal                          |
| ------------------ | ---------------------------------------------------- | ------------------------------------- |
| PCForge Mobile App | Primary API consumer                                 | Retrieve component catalog data       |
| Student / Learner  | Runs the API locally during class                    | Start the API with minimal setup      |
| PCForge Developer  | Maintains normalized component data and API behavior | Keep the API predictable and testable |

### 1.4 Product Vision

Provide a small, deterministic, easy-to-run REST API that makes the component catalog available to PCForge Mobile without introducing infrastructure unrelated to the React Native lesson.

## 2. Product Scope

### 2.1 In Scope

* Node.js API.
* TypeScript.
* Express.
* JSON-based component data.
* Normalized component model.
* Component categories.
* Component listing.
* Paginated component results.
* Component search.
* Component filtering.
* Component detail lookup.
* Local API access by the mobile app over the same private LAN.
* CORS configuration for local browser-based development clients.
* Request validation.
* Consistent API error responses.
* Health endpoint.
* Unit and API integration tests.
* Reproducible local startup with pnpm.
* Static version-controlled catalog data.

### 2.2 Out of Scope

* PostgreSQL.
* MongoDB.
* Prisma.
* User accounts.
* Password authentication.
* OAuth.
* Firebase.
* Firestore.
* Build persistence.
* Favorites persistence.
* Payments.
* Ecommerce.
* Prices.
* Amazon integration.
* Product purchasing.
* Administrative catalog editing endpoints.
* Server-side compatibility calculations for the MVP.
* Server-side power calculations for the MVP.
* Microservices.
* Background workers.

### 2.3 Constraints

* Node.js and TypeScript are required.
* Express is the HTTP framework.
* pnpm is the package manager.
* The API uses port `3000` by default for local development.
* A physical mobile device and the computer hosting its API must be on the same local network; no public deployment is planned.
* The mobile app uses the API host computer's LAN address, not the phone's `localhost`/`127.0.0.1`.
* Component data must be stored in JSON files in the repository.
* No external database may be required to start the API.
* The API must be runnable by at least two classmates with minimal setup.
* The API must expose only the data and operations required by the mobile application.
* The backend repository is separate from the mobile repository.
* The API must not become a second teaching topic during the React Native presentation.

### 2.4 Assumptions

* BuildCores OpenDB folders are downloaded manually and copied into the repository as an unchanged, version-controlled snapshot.
* The API normalizes the fields required by clients while reading the local snapshot.
* The snapshot is small enough to be loaded into memory for the classroom MVP.
* The snapshot is fixed for the development and classroom period; updates are not planned during that period.
* Component records have stable internal identifiers.
* The mobile application performs compatibility and power analysis locally.
* The API is used primarily as a read-only catalog service.
* Each student who tests on a physical device runs their own API instance on a computer reachable over the same local network.
* CORS applies to browser-based clients; native React Native networking still requires a reachable API host and port.

## 3. Functional Overview

The API provides component catalog access through a small REST boundary. It loads static JSON data, normalizes it into the application schema, and exposes query capabilities required by PCForge Mobile.

### 3.1 Functional Area — Catalog Access

The API provides category and component endpoints for retrieving catalog data.

### 3.2 Functional Area — Search and Filtering

The API accepts supported query parameters to reduce component results according to text and normalized specifications. Component collection requests use 1-based `page` and `pageSize` parameters; page size defaults to 50 and accepts 10, 20, 30, 40, or 50. Paginated responses include total record count and total page count.

### 3.3 Functional Area — Component Details

The API exposes an individual component by stable identifier.

### 3.4 Functional Area — Service Health

The API exposes a health endpoint so the mobile application and developers can determine whether the service is running.

## 4. Core Features

### F-001 — Component Catalog API

#### 4.1.1 Purpose

Provide the mobile application with component data through a stable HTTP contract.

#### 4.1.2 Description

The API loads normalized JSON component records and exposes them through REST endpoints.

#### 4.1.3 Primary Users

* PCForge Mobile App

#### 4.1.4 Expected Outcome

The mobile application can retrieve supported component categories and components without directly accessing backend files.

#### 4.1.5 Related User Flows

* UF-001 — Retrieve component catalog

#### 4.1.6 Related Requirements

* [REQUIREMENTS.md](REQUIREMENTS.md): FR-001, FR-002, FR-003

### F-002 — Component Search

#### 4.2.1 Purpose

Allow the mobile application to request components matching a search term.

#### 4.2.2 Description

The API supports a normalized text search over approved component fields.

#### 4.2.3 Primary Users

* PCForge Mobile App

#### 4.2.4 Expected Outcome

The API returns only components matching the search behavior.

#### 4.2.5 Related User Flows

* UF-002 — Search components

#### 4.2.6 Related Requirements

* [REQUIREMENTS.md](REQUIREMENTS.md): FR-004

### F-003 — Component Filtering

#### 4.3.1 Purpose

Allow the mobile application to request subsets of components using supported specification filters.

#### 4.3.2 Description

The API supports category-specific query parameters defined by the API contract.

#### 4.3.3 Primary Users

* PCForge Mobile App

#### 4.3.4 Expected Outcome

The API returns components satisfying all supported filters.

#### 4.3.5 Related User Flows

* UF-003 — Filter components

#### 4.3.6 Related Requirements

* [REQUIREMENTS.md](REQUIREMENTS.md): FR-005

### F-004 — Component Details

#### 4.4.1 Purpose

Provide complete normalized information for one component.

#### 4.4.2 Description

The API returns a component record by stable identifier.

#### 4.4.3 Primary Users

* PCForge Mobile App

#### 4.4.4 Expected Outcome

The mobile application can render a complete component detail view.

#### 4.4.5 Related User Flows

* UF-004 — Retrieve component details

#### 4.4.6 Related Requirements

* [REQUIREMENTS.md](REQUIREMENTS.md): FR-006

### F-005 — Health Check

#### 4.5.1 Purpose

Provide a deterministic way to verify that the service is available.

#### 4.5.2 Description

The API exposes a health endpoint that returns service status and basic metadata.

#### 4.5.3 Primary Users

* PCForge Mobile App
* Student / Learner
* PCForge Developer

#### 4.5.4 Expected Outcome

A client can determine whether the API process is running.

#### 4.5.5 Related User Flows

* UF-005 — Verify API availability

#### 4.5.6 Related Requirements

* [REQUIREMENTS.md](REQUIREMENTS.md): FR-007

## 5. User Flows

The user journeys and detailed flows for PCForge API are maintained in [USERJOURNEY.md](USERJOURNEY.md). The document preserves UF-001 through UF-005 and their alternative and error paths.

## 6. Product Requirements

The authoritative functional and non-functional requirements, acceptance criteria, priorities, constraints, and detailed traceability are maintained in [REQUIREMENTS.md](REQUIREMENTS.md). Existing FR and NFR identifiers are preserved.

## 7. Feature Prioritization

### MVP

* Express API.
* TypeScript.
* JSON component catalog.
* Categories endpoint.
* Component listing.
* Search.
* Filtering.
* Component details.
* Health endpoint.
* Validation.
* Consistent errors.
* CORS.
* Unit tests.
* API integration tests.
* pnpm-based setup.

### Important

* Improved category-specific filters.
* Response metadata.
* Dataset validation at startup.
* API documentation.
* Structured logging.

### Stretch

* OpenAPI/Swagger documentation.
* ETag or conditional requests.
* In-memory caching if profiling justifies it.
* Cloud deployment.
* Future database adapter.

### Out of Scope

* Authentication.
* User data.
* Builds persistence.
* Favorites persistence.
* Firebase.
* Firestore.
* Ecommerce.
* Payments.
* Prices.
* Orders.
* Admin CRUD.
* Server-side compatibility engine.

## 8. Product Rules

* Component records are read-only through the public API.
* Component identifiers must be stable within a dataset version.
* Categories must use the canonical category names defined by the API contract.
* Search must be case-insensitive.
* Search must not expose arbitrary filesystem paths or data sources.
* Filters must be explicitly supported by the API contract.
* Unsupported filters must not be silently interpreted.
* Missing component specifications must remain distinguishable from zero or false values.
* The API must not invent missing hardware specifications.
* BuildCores-derived data must be normalized before being exposed.
* The API must not expose raw internal dataset paths.
* The API must not require a database to run the classroom MVP.
* The mobile application must be able to determine API availability through the health endpoint.
* The API does not persist user-created builds or favorites in the MVP.

## 9. Edge Cases

### Empty Dataset

#### 9.1.1 Condition

A category JSON file exists but contains no component records.

#### 9.1.2 Expected Behavior

The API returns an empty collection with a successful response.

### Missing Dataset File

#### 9.2.1 Condition

A required category data file is missing.

#### 9.2.2 Expected Behavior

The service fails startup validation or returns a controlled server error according to the documented dataset-loading strategy.

### Invalid Component Record

#### 9.3.1 Condition

A JSON record does not satisfy the normalized component schema.

#### 9.3.2 Expected Behavior

The dataset validation process identifies the invalid record and prevents silent corruption of API responses.

### Unknown Category

#### 9.4.1 Condition

The client requests a category not defined by the API.

#### 9.4.2 Expected Behavior

The API returns a consistent 4xx response identifying the unsupported category.

### Unknown Component

#### 9.5.1 Condition

The client requests an identifier that does not exist.

#### 9.5.2 Expected Behavior

The API returns a 404 response with the standard error structure.

### Invalid Filter

#### 9.6.1 Condition

The client sends an unsupported filter or malformed filter value.

#### 9.6.2 Expected Behavior

The API returns a validation error instead of silently ignoring the invalid filter.

### Large Query Result

#### 9.7.1 Condition

A request returns a large number of records.

#### 9.7.2 Expected Behavior

The API returns the requested page with pagination metadata, using the default page size when omitted.

### Page Beyond Available Results

#### 9.8.1 Condition

The client requests a page number greater than the result's `totalPages`.

#### 9.8.2 Expected Behavior

The API returns a standard 404 JSON error.

## 10. Error and Failure Behavior

| Scenario                        | Expected User-Visible Behavior                                      | Recovery                                                                          |
| ------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| API process unavailable         | Mobile app displays connection error                                | Start or restart API                                                              |
| Unknown category                | API returns validation error                                        | Request supported category                                                        |
| Unknown component               | API returns 404                                                     | Return to catalog                                                                 |
| Invalid query parameter         | API returns 400                                                     | Correct request                                                                   |
| Dataset unavailable             | API returns controlled server error or fails startup validation     | Restore dataset and restart                                                       |
| Dataset record invalid          | API rejects or isolates invalid data according to validation policy | Correct source data                                                               |
| Unexpected server error         | API returns generic 500 response                                    | Inspect server logs                                                               |
| CORS rejection                  | Browser client cannot access endpoint                               | Correct local browser origin configuration                                        |
| API host unreachable from phone | Mobile app cannot reach the API computer over the network           | Put the phone and API computer on the same LAN and use the computer's LAN address |

## 11. Product Metrics / Success Criteria

| Metric                  | Target                                                             | Measurement                |
| ----------------------- | ------------------------------------------------------------------ | -------------------------- |
| Startup reproducibility | Two or more classmates can start the API without database setup    | Classroom test             |
| API availability        | Health endpoint responds successfully after startup                | Automated/integration test |
| Catalog coverage        | All MVP component categories are represented                       | Dataset validation         |
| Contract stability      | Mobile app can retrieve all required MVP data                      | Integration test           |
| Error consistency       | Representative invalid requests return documented error structures | API test suite             |
| Dataset validity        | All records pass normalized schema validation                      | Dataset validation test    |

## 12. Related Documentation

* [CONSTITUTION.md](CONSTITUTION.md)
* [AGENTS.md](AGENTS.md)
* [REQUIREMENTS.md](REQUIREMENTS.md)
* `PLAN.md`
* [ARCHITECTURE.md](ARCHITECTURE.md)
* `SECURITY.md`
* `API.md`
* [USERJOURNEY.md](USERJOURNEY.md)
