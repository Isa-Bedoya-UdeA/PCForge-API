# Security Policy

| Field | Value |
| --- | --- |
| Project | PCForge API |
| Document | Security Policy |
| Version | 0.1 |
| Status | Approved |
| Last Updated | 2026-10-05 |
| Specification Version | 0.1 |
| Architecture Version | 0.1 |

## 1. Purpose

This document establishes the security baseline, threat model, operational guardrails, and vulnerability disclosure procedures for `pcforge-api`. It enforces Principle P-007 (*Security and Data Integrity by Default*) of `CONSTITUTION.md` and fulfills requirements `NFR-004` (Information Disclosure Prevention) and `NFR-007` (Strict Origin Validation).

Although `pcforge-api` is an educational, read-only catalog service designed for local mobile development, security controls are applied rigorously to prevent unauthorized network access, data tampering, parameter abuse, and runtime information disclosure.

---

## 2. Threat Model and Security Posture

### 2.1 System Context and Trust Boundaries

The service operates as a local catalog backend consumed primarily by the PCForge Mobile React Native application running on mobile devices or local emulators.

```text
[ Physical Mobile Device / Expo Go / Simulator ]
                      │
                      │ HTTP (LAN or Localhost)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Trust Boundary: Express HTTP Transport                      │
│ - Origin Validation (CORS middleware)                      │
│ - Strict Query Parameter Whitelisting (Zod)                │
│ - Path Parameter Sanitization (Zod)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │ Validated Request
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Application Boundary: Service & Repository                  │
│ - Deterministic Catalog Read Operations                    │
│ - Safe Error Mapping & Formatting                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Data Boundary: JSON Adapter & Schema Validation             │
│ - Immutable Local OpenDB Snapshot (data/opendb/)           │
│ - Draft-07 Schema Validation (Ajv + ajv-formats)           │
│ - Public Model Normalization (Strip upstream metadata)     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Asset Classification

| Asset | Sensitivity | Classification | Security Objective |
| --- | --- | --- | --- |
| OpenDB Snapshot (`data/opendb/`) | Public / Open Source | Low | Integrity & Immutability; prevent runtime modification or corruption |
| Component DTOs | Public Catalog | Low | Accuracy; deterministic responses; prevent unauthorized schema distortion |
| Environment Variables (`.env`) | Internal Config | Medium | Confidentiality; prevent exposure via responses or version control |
| Internal Diagnostics & Stack Traces | Operational State | High | Confidentiality; strictly concealed from HTTP clients |
| Host Machine Filesystem | Operating System | Critical | Integrity & Confidentiality; prevent path traversal or unauthorized file read |

### 2.3 Threat Vectors and Mitigations

| Threat ID | Threat Vector | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| TV-001 | Unauthorized Cross-Origin Web Requests (CSRF/CORS) | Medium | Strict localhost origin whitelist; rejection of wildcard `*` or public origins |
| TV-002 | Query Parameter Pollution / Injection | Low-Medium | Strict Zod validation; rejection of unsupported query parameters (`UNSUPPORTED_PARAMETER`) |
| TV-003 | Path Traversal via `:id` parameter | High | Path parameter validation rejecting directory navigation sequences (`../`, `/`, `\`) |
| TV-004 | Upstream Data Corruption / Malformed JSON | High | Ajv + `ajv-formats` validation against Draft-07 schemas at startup; fail-fast boot |
| TV-005 | Information Disclosure via Error Stacks | Medium | Centralized Express error handler returning standardized error envelopes without stack traces |
| TV-006 | Network Exposure on Untrusted WiFi | Medium | Documented binding guidelines; development-only scope; isolation from sensitive networks |
| TV-007 | Denial of Service (DoS) via Large Payloads | Low-Medium | Read-only endpoints with no request body parsing; bounded pagination (`pageSize` max 50) |

---

## 3. Network and Transport Security

### 3.1 Host Binding and LAN Demonstration

* **Default Binding:** The Express server binds to `0.0.0.0` on port `3000` (configurable via `HOST` and `PORT` environment variables).
* **Classroom Rationale:** Binding to `0.0.0.0` enables physical mobile devices running PCForge Mobile (Expo Go) on the same local Wi-Fi subnet to access the catalog via the workstation's local private IP address (`http://<PC_LAN_IP>:3000/api`) during classroom presentations and lab testing.
* **Metro Bundler Coexistence:** The Metro bundler runs on port `5562` (or default `8081`), ensuring no port collision with the API service on port `3000`.

### 3.2 Network Risk Warning and Operational Rules

> [!WARNING]
> Binding to `0.0.0.0` exposes the HTTP server to all devices on the current network interface. When operating on untrusted, public, or university campus networks:
>
> 1. Use the local development loopback (`HOST=127.0.0.1`) when physical mobile LAN testing is not actively required.
> 2. Ensure workstation host firewalls (Windows Defender Firewall / macOS PF / Linux iptables) restrict incoming traffic on port `3000` to trusted local subnets.
> 3. Never expose `pcforge-api` to the public internet without an authenticating reverse proxy and TLS termination.

### 3.3 Transport Layer (TLS/HTTPS)

* **Local Environment:** HTTP/1.1 over cleartext is accepted strictly within local loopback (`127.0.0.1`) and private LAN development subnets.
* **Production Boundary:** If deployed to cloud environments in future iterations, cleartext HTTP must be redirected to HTTPS (TLS 1.3), with modern cipher suites and HSTS enabled.

---

## 4. Cross-Origin Resource Sharing (CORS) Policy

### 4.1 Permitted Origins

CORS middleware enforces strict origin inspection:

| Origin Pattern | Purpose | Action |
| --- | --- | --- |
| `http://localhost:*` | Local web browsers and tooling | Allowed |
| `http://127.0.0.1:*` | Local IP loopback tooling | Allowed |
| Wildcard `*` | Any external origin | **Denied** (Never permitted) |
| Public Web Origins (`https://example.com`) | External web clients | **Denied** |

### 4.2 Native Mobile Client Interaction

* **Native Apps:** Native mobile applications (React Native / iOS / Android) do not execute inside a web browser sandbox and do not transmit browser `Origin` headers for standard HTTP requests.
* **Behavior:** Requests omitting the `Origin` header (such as native mobile HTTP clients and server-to-server curl requests) are permitted to reach public read-only endpoints.
* **Preflight Requests:** HTTP `OPTIONS` preflight requests from unauthorized browser origins receive `403 Forbidden` without CORS approval headers.

---

## 5. Input Validation and Request Sanitization

### 5.1 Defense-in-Depth Pipeline

All incoming HTTP requests pass through declarative Zod validation schemas before reaching application services.

```text
HTTP Request
     │
     ▼
[ Express Router ]
     │
     ▼
[ Zod Validation Middleware ]
     ├─ Query Parameter Schema (Strict Whitelist)
     └─ Path Parameter Schema (ID Format Validation)
     │
     ├── Invalid ──► 400 Bad Request (VALIDATION_ERROR / UNSUPPORTED_PARAMETER)
     │
     ▼ Valid
[ Controller & Service Execution ]
```

### 5.2 Strict Parameter Whitelisting

To eliminate query parameter confusion and unexpected behavior, the query parser rejects any query parameters not explicitly defined in the API contract:

```typescript
const allowedQueryParams = new Set(['category', 'q', 'page', 'pageSize']);
```

If an unapproved query parameter is supplied (e.g., `?sort=price` or `?filter=admin`), the request is immediately rejected with:

* **HTTP Status:** `400 Bad Request`
* **Error Code:** `UNSUPPORTED_PARAMETER`
* **Message:** Explains which parameter is unsupported.

### 5.3 Query Parameter Constraints

* **`category`:** Must match canonical category casing exactly: `CPU`, `CPU_COOLER`, `MOTHERBOARD`, `MEMORY`, `INTERNAL_HARD_DRIVE`, `VIDEO_CARD`, `CASE`, `POWER_SUPPLY`. Invalid values yield `INVALID_CATEGORY`.
* **`q`:** Trimmed string, maximum 100 characters, stripped of control characters.
* **`page`:** Coerced positive integer (`>= 1`). Floats, strings, or negative values are rejected.
* **`pageSize`:** Coerced integer constrained to allowed set `{10, 20, 30, 40, 50}`. Default is `50`. Values outside this set yield `400 Bad Request`.

### 5.4 Path Parameter Sanitization (`:id`)

To prevent directory traversal and injection attacks on resource lookups:

* The `:id` parameter must consist strictly of alphanumeric characters, hyphens, and underscores (valid UUID stem or component identifier).
* Sequences such as `..`, `/`, `\`, `%2e%2e`, and null bytes (`%00`) are rejected at the routing boundary with `400 Bad Request` (`VALIDATION_ERROR`).
* Detail lookups use in-memory indexed maps rather than dynamic disk paths, completely isolating the file system from request parameters.

---

## 6. Data Integrity and Upstream Snapshot Security

### 6.1 Immutability of OpenDB Snapshot

* **Static Data:** The OpenDB snapshot files in `data/opendb/` and schemas in `data/schemas/` are committed to source control as read-only assets.
* **Filesystem Immutability:** The API runtime never performs file write, append, update, or delete operations on catalog files. Normal application logic only reads from this directory during startup.
* **Testing Isolation:** Automated tests operate against in-memory doubles or read-only snapshot copies, ensuring the disk snapshot is never modified.

### 6.2 Schema Verification with Ajv

* Upstream BuildCores schemas follow JSON Schema Draft-07.
* At server startup, `src/data/loader.ts` compiles the schemas using Ajv with `ajv-formats`.
* Every loaded record is validated against its respective category schema before entering the in-memory cache.
* If any record violates its schema or if required category files are missing, the server fails fast with a clear initialization error and refuses to start.

### 6.3 Public Model Normalization and Information Hiding

* Upstream BuildCores OpenDB files contain internal metadata envelopes:
  * `metadata.author`
  * `metadata.version`
  * Local filesystem paths or raw source filenames
* The repository adapter maps only the approved public catalog fields (`id`, `category`, `name`, `manufacturer`, `specifications`).
* Upstream metadata envelopes and local host filesystem paths are completely omitted from public API responses.

---

## 7. Error Handling and Information Disclosure Prevention

### 7.1 Centralized Safe Error Middleware

All unhandled exceptions, validation errors, and operational errors flow through the centralized Express error middleware (`src/middleware/error.middleware.ts`).

### 7.2 Standardized Safe Error Envelope

Every error response adheres strictly to the envelope:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description.",
    "details": []
  }
}
```

### 7.3 Information Disclosure Safeguards

* **No Stack Traces:** Stack traces (`err.stack`) are never serialized to the client, even in development mode.
* **No File Paths:** Operating system paths (e.g., `C:\...` or `/var/...`) are scrubbed from error messages.
* **No Internal Library Errors:** Low-level Node.js, Express, or Ajv internal error objects are caught and mapped to high-level application error codes.
* **Internal Server Errors:** Unexpected exceptions return a generic `500 Internal Server Error` with code `INTERNAL_SERVER_ERROR` and a safe message. Diagnostics are written exclusively to server-side stdout/stderr.

### 7.4 Safe Out-of-Bounds Behavior

* Requesting a page beyond total pages (`page > totalPages`) returns `404 Not Found` with `PAGE_NOT_FOUND`.
* Requesting an unknown component ID returns `404 Not Found` with `COMPONENT_NOT_FOUND`.
* Neither response leaks internal catalog boundaries or database statistics.

---

## 8. Secrets, Credentials, and Configuration Management

### 8.1 Zero Credentials Posture

* `pcforge-api` requires **zero secrets**, API keys, database credentials, or external cloud tokens for operation.
* The API is entirely self-contained using version-controlled static JSON data.

### 8.2 Environment Configuration Guidelines

* `.env.example` provides safe, non-sensitive default placeholders:

  ```env
  PORT=3000
  HOST=0.0.0.0
  NODE_ENV=development
  ```

* `.env` is explicitly ignored in `.gitignore`.
* No sensitive tokens, private keys, or passwords may be stored in environment variables, configuration files, or committed source code.

---

## 9. Dependency Security and Supply Chain

### 9.1 Package Manager Integrity

* **pnpm Only:** Package management is restricted strictly to `pnpm` (version 11.x). Use of `npm`, `yarn`, or `bun` is prohibited by `CONSTITUTION.md`.
* **Frozen Lockfile:** All CI workflows and production setups use `pnpm install --frozen-lockfile` to prevent unexpected dependency drift or malicious package substitution.

### 9.2 Pinned Runtime

* The runtime is pinned to Node.js `24.x` (matching local development v24.13.1) in `.node-version` and `package.json` `engines`.
* GitHub Actions CI explicitly runs on Node.js `24`.

### 9.3 Dependency Auditing

* Vulnerability scanning is performed using `pnpm audit`.
* Dependencies with critical or high known CVE vulnerabilities must be updated or replaced before merging pull requests.

### 9.4 Safe Execution Constraints

* Zero dynamic code execution: `eval()`, `new Function()`, and `vm` execution are strictly forbidden.
* Deserialization of incoming requests uses standard JSON parsers with strict size limits (default Express JSON limits apply, even though MVP endpoints do not accept request bodies).

---

## 10. Vulnerability Reporting and Disclosure Policy

### 10.1 Reporting a Vulnerability

If you discover a security vulnerability in `pcforge-api`, please report it privately rather than opening a public issue on GitHub.

1. Email the project maintainers with details of the vulnerability.
2. Include:
   * Description of the vulnerability.
   * Steps to reproduce or proof-of-concept request.
   * Potential impact.
   * Recommended remediation (if known).

### 10.2 Response Timeline

| Milestone | Target SLA |
| --- | --- |
| Initial Acknowledgement | Within 48 hours |
| Vulnerability Assessment & Confirmation | Within 5 business days |
| Remediation Patch & Verification | Within 14 business days |
| Public Disclosure / Release | Coordinated with reporter upon fix deployment |

---

## 11. Security Verification Matrix

| Verification Check | Target | Automated Test / Gate |
| --- | --- | --- |
| Localhost CORS enforcement | Only `localhost` and `127.0.0.1` receive CORS headers | Integration test: `test/integration/cors.test.ts` |
| Foreign CORS rejection | External web origins denied | Integration test: `test/integration/cors.test.ts` |
| Query parameter injection | Unsupported parameters rejected with 400 | Integration test: `test/integration/validation.test.ts` |
| Path traversal protection | Navigation sequences in `:id` rejected with 400 | Integration test: `test/integration/components.test.ts` |
| Safe error handling | No stack traces or file paths leaked on 500 | Integration test: `test/integration/errors.test.ts` |
| Schema integrity at startup | Corrupted dataset triggers fail-fast error | Unit/Integration test: `test/unit/loader.test.ts` |
| Dataset immutability | OpenDB files unchanged after test suite | CI script / Git dirty tree check |
| Supply chain audit | No known high/critical CVEs | `pnpm audit` gate |

---

## 12. Related Documentation

* [CONSTITUTION.md](CONSTITUTION.md) — Engineering principles (specifically P-007).
* [SPEC.md](SPEC.md) — Product specification and non-functional requirements (`NFR-004`, `NFR-007`).
* [REQUIREMENTS.md](REQUIREMENTS.md) — Requirements traceability and acceptance criteria (`AC-010`, `AC-013`, `AC-014`).
* [PLAN.md](PLAN.md) — Technical implementation plan and technical decisions (`TD-003`, `TD-005`, `TD-009`, `TD-010`).
* [ARCHITECTURE.md](ARCHITECTURE.md) — System boundaries and module design.
* [API.md](API.md) — Authoritative REST API specification.
* [TASKS.md](TASKS.md) — Implementation milestones and verification checklist.
