# PCForge API

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-%236DA55F.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220)

> A local, read-only REST API for the PCForge PC component catalog.

## Project Information

| Field | Value |
| --- | --- |
| Status | In Development |
| Platform | Node.js local service |
| Language | TypeScript |
| UI | REST / JSON |
| Repository | [GitHub](https://github.com/Isa-Bedoya-UdeA/PCForge-API) |

## Overview

PCForge API serves the PCForge Mobile app with normalized component data from a local snapshot of BuildCores OpenDB. The downloaded OpenDB folders remain unchanged in the repository; the API maps the fields needed by the client when loading the data. It has no runtime dependency on a BuildCores-hosted service or external database and is intended for local development and classroom use.

## Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Language | TypeScript | Typed API and catalog services |
| Runtime | Node.js | Local server runtime |
| Backend | Express 5 | REST routes and middleware |
| Data source | BuildCores OpenDB snapshot in JSON | Version-controlled component catalog |
| Database | None | No external database is required |
| Authentication | None | Public read-only catalog API |
| Build / Tooling | pnpm, TypeScript | Dependency management, scripts, and compilation |
| Testing | Unit and API integration tests | Verify catalog behavior and HTTP contracts |
| Deployment | Local only | No deployment is planned |

## Features

### Component Catalog

* List supported categories and components.
* Retrieve component details by ID.
* Serve paginated results using `page` and `pageSize`.

### Catalog Queries

* Search and filter using supported component fields.
* Validate query parameters and return consistent errors.
* Check service availability through the health endpoint.

## Architecture

The API is a layered modular monolith: Express routes and controllers call catalog services, which use repositories and a JSON data adapter. The adapter reads the unchanged OpenDB snapshot and maps records into normalized API models.

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the complete architecture documentation.

## Project Structure

```text
pcforge-api/
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── dto/
│   ├── errors/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── data/
│   └── server.ts
├── data/
│   ├── opendb/                 # Contents of upstream open-db/, unchanged
│   └── schemas/                # Matching OpenDB JSON Schemas, unchanged
├── scripts/
│   └── validate-data.ts        # Project-owned snapshot validation utility
├── test/
│   ├── unit/
│   └── integration/
├── docs/
│   └── screenshots/
├── .env.example
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### Important Directories

| Directory | Purpose |
| --- | --- |
| `src/routes/`, `src/controllers/` | Declare endpoints and translate HTTP requests |
| `src/services/`, `src/repositories/` | Implement catalog use cases and isolate data access |
| `src/data/` | Load, validate, and map source records |
| `data/opendb/` | Store the contents of upstream `open-db/`, preserving category folders and product JSON files unchanged |
| `data/schemas/` | Store matching upstream schemas such as `CPU.schema.json`, unchanged |
| `scripts/` | Project-owned utility to validate snapshot JSON against schemas |
| `test/` | Unit and HTTP integration tests |
| `docs/screenshots/` | Project screenshots |

## Getting Started

### Prerequisites

* Latest stable Node.js release.
* pnpm.
* Contents of BuildCores OpenDB's `open-db/` folder copied unchanged into `data/opendb/`.
* Matching JSON schemas copied unchanged into `data/schemas/`.

### Clone the Repository

```bash
git clone https://github.com/Isa-Bedoya-UdeA/PCForge-API
cd pcforge-api
```

### Open the Project

```bash
code .
```

### Configure Services

* [API](./docs/API.md)
* [Security](./docs/SECURITY.md)

The local MVP does not require a database, credentials, or a deployed service. The API accepts local development requests only.

### Configure Environment Variables

```text
# No database URL, BuildCores API key, or authentication secret is required.
# Keep any local-only configuration in .env; commit names and safe examples only.
```

### Run the Application

```bash
pnpm install
```

The current scaffold does not yet define a development script, and `src/server.ts` is empty. Add the API bootstrap and a `dev` package script before attempting to start the service.

### Run Tests

The package currently contains only a placeholder `test` script; unit, integration, and snapshot-validation commands are not implemented yet.

## Documentation

| Document | Description |
| --- | --- |
| [AGENTS.md](./docs/AGENTS.md) | Project development rules and agent instructions. |
| [CONSTITUTION.md](./docs/CONSTITUTION.md) | Non-negotiable engineering principles. |
| [SPEC.md](./docs/SPEC.md) | Product and feature specification. |
| [REQUIREMENTS.md](./docs/REQUIREMENTS.md) | Functional and non-functional requirements. |
| [PLAN.md](./docs/PLAN.md) | Technical implementation plan. |
| [TASKS.md](./docs/TASKS.md) | Structured implementation tasks. |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture and technical structure. |
| [NAVIGATIONMAP.md](./docs/NAVIGATIONMAP.md) | Navigation structure and route flows. |
| [USERJOURNEY.md](./docs/USERJOURNEY.md) | Users, journeys, and UX flows. |
| [SECURITY.md](./docs/SECURITY.md) | Security architecture and controls. |
| [API.md](./docs/API.md) | API contracts and service communication. |
| [LICENSE](LICENSE) | Project license. |

## Development

Use pnpm for all package operations. Keep HTTP handling, catalog services, repository access, and source-file mapping in their respective layers. Preserve OpenDB files and matching schemas unchanged. The upstream validation shell scripts assume Bash and globally installed tools, so do not copy them as-is to this Windows project. Use the schemas from `data/schemas/` to build a project-owned validator at `scripts/validate-data.ts` with dependencies installed through pnpm. The upstream sync-contract scripts are not needed for a manually copied, fixed snapshot.

See [AGENTS.md](./docs/AGENTS.md) for detailed development rules.

## Testing

Planned checks include unit tests for services, filters, repositories, and validators; integration tests for Express routes and HTTP responses; and snapshot validation against the unchanged schemas. These test commands must be added to `package.json` before they can be run.

## License

This project is licensed under the terms described in [LICENSE](LICENSE).

## Contributors

* **Isabela Bedoya Gaviria** — Developer
* **Rafael Aleman** — Developer
