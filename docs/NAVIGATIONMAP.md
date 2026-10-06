# Navigation Map

## Document Information

| Field | Value |
| --- | --- |
| Project | `PCForge API` |
| Document | Navigation Map (API Resource & Request Routing Map) |
| Version | `0.1` |
| Status | `Approved` |
| Last Updated | `2026-10-05` |
| Platform | `Headless REST API (Node.js / Express 5)` |

## Related Documentation

* [SPEC](SPEC.md)
* [REQUIREMENTS](REQUIREMENTS.md)
* [USERJOURNEY](USERJOURNEY.md)
* [ARCHITECTURE](ARCHITECTURE.md)
* [API](API.md)
* [SECURITY](SECURITY.md)

---

## 1. Purpose

This document governs the HTTP resource routing hierarchy, request traversal sequences, and fallback routing for `pcforge-api`.

As a headless backend REST service, the API does not render visual screens, UI views, or client-side navigation transitions. Visual UI navigation, screen stacks, tabs, and drawer navigation belong exclusively to the `PCForge Mobile` client application.

This document defines the **server-side resource navigation graph**, specifying how client requests enter, traverse, and resolve resources across the API endpoint tree.

## 2. Navigation Principles

* **Stateless Traversal:** Each HTTP request is self-contained. The server does not maintain session state or navigation history between client requests.
* **Deterministic Resource Resolution:** Every valid URI path maps predictably to an explicit route controller or emits a standard 404 response.
* **Predictable Hierarchy:** Routes follow a standard REST resource tree under the `/api` root boundary (`/health`, `/categories`, `/components`, `/components/:id`).
* **Fail-Safe Fallback Routing:** Any unmatched route, unsupported HTTP method, or missing resource resolves to centralized error handlers emitting uniform safe JSON envelopes.
* **Clean Separation of Concerns:** Routing middleware handles URI matching and parameter extraction; controllers and services handle business logic.

## 3. Navigation Structure

```text id="w2n8fd"
Express Application Boundary (/api)
├── Health Check
│   └── GET /api/health
├── Catalog Hierarchy
│   ├── Categories
│   │   └── GET /api/categories
│   └── Components
│       ├── GET /api/components (Paginated collection query)
│       └── GET /api/components/:id (Direct resource detail)
└── Fallback Routing
    ├── Unmatched Route (404 ROUTE_NOT_FOUND)
    ├── Unmatched Component (404 COMPONENT_NOT_FOUND)
    ├── Page Out of Range (404 PAGE_NOT_FOUND)
    └── Centralized Error Boundary (500 INTERNAL_SERVER_ERROR)
```

## 4. Navigation Actors and Boundaries

| Actor / State | Accessible Destinations | Restricted Destinations |
| --- | --- | --- |
| Public / Unauthenticated Client (Mobile App) | `/api/health`, `/api/categories`, `/api/components`, `/api/components/:id` | None (all catalog endpoints are public) |
| Local Workstation Browser | `/api/health`, `/api/categories`, `/api/components`, `/api/components/:id` | Restricted to allowed localhost CORS origins |
| Mutating Methods (`POST`, `PUT`, `DELETE`, `PATCH`) | None | All paths (rejected with `404` or `405`) |
| Administrative Endpoints | None | Excluded from MVP scope |

## 5. Root Routes

| Route | Destination | Auth Required | Purpose |
| --- | --- | --- | --- |
| `/api/health` | Health Controller | No | Verify service availability and operational metadata |
| `/api/categories` | Categories Controller | No | Retrieve canonical hardware category list |
| `/api/components` | Components List Controller | No | Paginated, filtered, and searchable component catalog |
| `/api/components/:id` | Component Detail Controller | No | Retrieve normalized specifications for one component |

## 6. Main Destinations

### `/api/health` (Health Check)

**Route:** `GET /api/health`

**Purpose:**

Provides instant verification that the Node.js / Express process is active, initialized, and capable of handling incoming traffic.

**Entry Points:**

* Direct HTTP request on application bootstrap from PCForge Mobile.
* Developer diagnostic checks via browser or `curl`.

**Exit / Next Destinations:**

* Client proceeds to `/api/categories` or `/api/components` upon receiving status `200 OK`.
* Client halts or displays offline retry view on connection failure.

**Required State:**

Express server running and in-memory repository initialized.

---

### `/api/categories` (Category Directory)

**Route:** `GET /api/categories`

**Purpose:**

Returns the canonical list of hardware categories (e.g. `CPU`, `Motherboard`, `GPU`, `RAM`) used to populate category navigation screens in the mobile client.

**Entry Points:**

* Mobile app home / catalog entry screen.

**Exit / Next Destinations:**

* `/api/components?category=<CategoryName>` when user selects a category to browse.

**Required State:**

Dataset loader successfully validated and indexed canonical categories.

---

### `/api/components` (Component Catalog Collection)

**Route:** `GET /api/components`

**Purpose:**

Serves paginated, filtered, and searchable component collections. Supports query parameters `category`, `search`, `page`, `pageSize`, and category-specific specification filters.

**Entry Points:**

* Mobile category view.
* Mobile search screen.
* Mobile build picker component selection.

**Exit / Next Destinations:**

* Next/previous page request (`/api/components?page=N+1`).
* Direct component detail request (`/api/components/:id`).

**Required State:**
Valid query parameters (`page >= 1`, `pageSize ∈ {10, 20, 30, 40, 50}`).

---

### `/api/components/:id` (Component Details)

**Route:** `GET /api/components/:id`

**Purpose:**
Returns full technical specifications and metadata for a single component identified by its stable identifier.

**Entry Points:**

* Mobile component card click / detail navigation.
* Direct deep-link navigation within the mobile app.

**Exit / Next Destinations:**

* Return to collection (`/api/components`).
* Mobile local build assignment (client-side state).

**Required State:**
Valid, non-empty `:id` path parameter.

---

## 7. Route Definitions

### 7.1 Authentication Routes

| Route | Destination | Parameters | Auth | Authorization |
| --- | --- | --- | --- | --- |
| *None* | *Not Applicable* | N/A | None | Public read-only catalog MVP |

### 7.2 Main Routes

| Route | Destination | Parameters | Auth | Authorization |
| --- | --- | --- | --- | --- |
| `GET /api/health` | Health Status | None | No | Public |
| `GET /api/categories` | Categories List | None | No | Public |
| `GET /api/components` | Component Catalog | Query: `category`, `search`, `page`, `pageSize`, `manufacturer` | No | Public |

### 7.3 Detail Routes

| Route | Resource | Parameters | Missing Resource Behavior |
| --- | --- | --- | --- |
| `GET /api/components/:id` | Normalized Component | Path: `id` (string) | Returns `404 Not Found` with `COMPONENT_NOT_FOUND` error envelope |

### 7.4 Creation / Edit Routes

| Route | Action | Parameters | Unsaved Changes |
| --- | --- | --- | --- |
| *None* | *Not Applicable* | N/A | Excluded from scope; backend is strictly read-only |

### 7.5 Modal / Temporary Destinations

| Destination | Trigger | Dismissal | Back Behavior |
| --- | --- | --- | --- |
| *None* | *Not Applicable* | N/A | UI modals are owned by the React Native client |

---

## 8. Navigation Flows

### 8.1 API Availability and Startup Flow

```text id="q9k2hm"
Client Launch
    ↓
GET /api/health
    ├── Status 200 OK → Service Ready → Request Catalog
    └── Network Failure / 500 → Service Unavailable → Show Connection Retry Screen
```

#### Availability Verification Steps

1. Client launches and performs initial health verification at `/api/health`.
2. Server validates in-memory state and returns `{ status: "ok" }`.
3. Client proceeds to query categories or components.

#### Edge Cases

* Host PC server not running: Client receives connection refused (`ECONNREFUSED`).
* Physical phone and PC on different WiFi networks: Client encounters network timeout (`ETIMEDOUT`).

---

### 8.2 Catalog Traversal and Inspection Flow

```text id="3r8vqa"
Catalog Entry
    ↓
GET /api/categories
    ↓
Select Category → GET /api/components?category=<Cat>&page=1&pageSize=50
    ├── Results Found (200 OK) → Display List
    │       ↓
    │   Select Component Card → GET /api/components/:id
    │       ├── Component Found (200 OK) → Display Detail Specs
    │       └── Component Missing (404) → Show "Component Not Found"
    ├── Empty Category (200 OK, total=0) → Display Empty State
    └── Page Out of Range (404 PAGE_NOT_FOUND) → Halt Pagination
```

#### Catalog Traversal Steps

1. Client fetches category list from `/api/categories`.
2. Client queries the first page of components for selected category (`/api/components?category=CPU&page=1`).
3. User scrolls, prompting next page query (`/api/components?category=CPU&page=2`).
4. User selects a component, triggering detail request by stable ID (`/api/components/:id`).
5. Server resolves the record from in-memory cache and returns full specifications.

---

## 9. Feature Flows

| Feature | Entry | Main Steps | Exit |
| --- | --- | --- | --- |
| Catalog Exploration | `/api/categories` | 1. Fetch categories; 2. Query category components; 3. Paginate results | `/api/components/:id` |
| Text Search | `/api/components` | 1. Send query parameter `?search=Ryzen`; 2. Filter across name/manufacturer | Display matching records or empty list |
| Component Inspection | `/api/components/:id` | 1. Send GET request with stable UUID stem; 2. Retrieve normalized specifications | Render detail screen or 404 error |
| Service Verification | `/api/health` | 1. Ping health route; 2. Inspect status and timestamp | Ready state |

---

## 10. Back Navigation

In this stateless REST service, backward navigation is governed by HTTP client history and client-side routers:

| Current Destination | Back Action | Condition |
| --- | --- | --- |
| `GET /api/components/:id` | Re-request `/api/components` or read client cache | User exits component detail view |
| `GET /api/components?page=2` | Request `/api/components?page=1` or read client cache | User navigates to previous page |
| Missing Resource (`404`) | Return to previous valid catalog list | User dismisses not-found error state |

---

## 11. Deep Links

Every REST endpoint supports direct URI access (REST addressability):

| Deep Link | Destination | Required State | Invalid Link Behavior |
| --- | --- | --- | --- |
| `/api/health` | Service Health | None | `500` if server uninitialized |
| `/api/categories` | Category Directory | None | Empty list if no categories loaded |
| `/api/components?category=:cat` | Category List | `:cat` must be canonical | `400 INVALID_CATEGORY` if category unknown |
| `/api/components/:id` | Specific Component | `:id` must exist | `404 COMPONENT_NOT_FOUND` |

---

## 12. State and Edge Cases

### Loading

* **Server Behavior:** Fast in-memory resolution (< 5ms response time).
* **Client Expectation:** Display non-blocking skeleton or spinner during HTTP transit.

### Empty

* **Condition:** Filter returns zero matching components.
* **Server Response:** Status `200 OK` with `{ "data": [], "pagination": { "page": 1, "pageSize": 50, "total": 0, "totalPages": 0 } }`.

### Error

* **Condition:** Internal exception during request handling.
* **Server Response:** Status `500 Internal Server Error` with generic `{ "error": { "code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred" } }`.

### Unauthorized

* **Status:** Not Applicable (public read-only catalog).

### Unauthenticated

* **Status:** Not Applicable (public read-only catalog).

### Missing Resource

* **Unknown Component ID:** `404 Not Found` with code `COMPONENT_NOT_FOUND`.
* **Page Out of Bounds (`page > totalPages`):** `404 Not Found` with code `PAGE_NOT_FOUND`.
* **Non-existent Path:** `404 Not Found` with code `ROUTE_NOT_FOUND`.

### Offline

* **Condition:** Mobile phone cannot reach host machine LAN IP.
* **Client Handling:** Client displays connection error view; server receives no request.

### Unsaved Changes

* **Status:** Not Applicable (read-only service).

### Interrupted Flow

* **Condition:** Client drops connection mid-flight.
* **Server Behavior:** Request terminates gracefully without data mutation or side effects.

---

## 13. Navigation Responsibilities

| Responsibility | Owner |
| --- | --- |
| Route resolution & URL parsing | Express Router (`src/routes/`) |
| Request validation & schema check | Zod Validation Middleware (`src/middleware/validation.ts`) |
| Resource filtering and slicing | Components Service (`src/services/components.service.ts`) |
| Data access and ID lookup | Component Repository (`src/repositories/`) |
| Centralized error routing & fallback | Error Middleware (`src/middleware/error-handler.ts`, `not-found.ts`) |
| Screen transitions & mobile navigation | PCForge Mobile App (`client/` via Expo Router) |

---

## 14. Navigation State

The backend API is completely **stateless**:

* No server-side session cookies, navigation stacks, or persistent request contexts exist.
* The client application maintains its own screen navigation stack and pagination position using React state / Expo Router.

---

## 15. Accessibility and UX Considerations

* **Deterministic URL Structure:** URLs are intuitive, lowercase, and follow clean REST standards.
* **Safe Programmatic Error Codes:** Error payloads provide structured machine-readable error codes (`code`) alongside clear human-readable explanations (`message`), allowing the mobile app to translate errors for screen readers.
* **Sub-Millisecond Response Times:** In-memory dataset indexing ensures immediate responses, preventing UI lag or frozen navigation transitions in the mobile app.

---

## 16. Verification Checklist

* [x] Every primary user journey has a corresponding navigation flow (`UF-001` to `UF-005`).
* [x] Root routes are defined (`/api/health`, `/api/categories`, `/api/components`).
* [x] Main destinations are defined (`Health`, `Categories`, `Components List`, `Component Detail`).
* [x] Detail routes are defined with missing resource behavior (`404 COMPONENT_NOT_FOUND`).
* [x] Authentication boundaries are explicit (None / Public API).
* [x] Authorization boundaries are explicit (None / Public API).
* [x] Back behavior is defined for non-trivial flows (Stateless / Client-managed).
* [x] Deep links have fallback behavior where applicable (`404` on unknown paths or missing resources).
* [x] Loading, empty, error, and missing-resource states are covered.
* [x] Navigation does not own business logic (routed to service/repository layers).
* [x] Route definitions match the implementation architecture (`src/routes/` and `API.md`).

---

## 17. Related Documentation

* [`SPEC.md`](SPEC.md) — Product specification and features
* [`REQUIREMENTS.md`](REQUIREMENTS.md) — Testable functional and non-functional requirements
* [`USERJOURNEY.md`](USERJOURNEY.md) — User flows and interaction paths
* [`ARCHITECTURE.md`](ARCHITECTURE.md) — System boundaries and module design
* [`API.md`](API.md) — Authoritative HTTP REST contract
* [`SECURITY.md`](SECURITY.md) — Security boundaries and CORS configuration

---

## 18. Change Log

| Version | Date | Change | Reason |
| --- | --- | --- | --- |
| `0.1` | `2026-10-05` | Author authoritative Navigation Map for the API resource routing tree | Establish server-side routing hierarchy, endpoint traversal flows, and clear boundary with mobile UI navigation |
