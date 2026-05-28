# 5. Building Block View

<!--
Arc42 Section 5: Building Block View
Shows the static decomposition of the system into building blocks and their dependencies.
Uses C4 model hierarchy: Context -> Container -> Component
-->

## 5.1 Level 1: System Context (Whitebox)

### Container Diagram

```plantuml
@startuml C4_Container
!include <C4/C4_Container>

title Container Diagram - {System Name}

Person(user, "User", "System user")

System_Boundary(system, "{System Name}") {
    Container(web, "Web Application", "React/Angular", "User interface")
    Container(api, "API Service", ".NET Core", "REST API endpoints")
    Container(worker, "Background Worker", ".NET Core", "Async processing")
    ContainerDb(db, "Database", "Oracle", "Primary data store")
    ContainerDb(cache, "Cache", "Redis", "Session and data cache")
}

System_Ext(ext1, "External System 1", "Description")
System_Ext(queue, "Message Queue", "SNS/SQS")

Rel(user, web, "Uses", "HTTPS")
Rel(web, api, "Calls", "REST/JSON")
Rel(api, db, "Reads/Writes", "Oracle")
Rel(api, cache, "Caches", "Redis")
Rel(api, queue, "Publishes", "HTTPS")
Rel(worker, queue, "Consumes", "HTTPS")
Rel(worker, db, "Updates", "Oracle")
Rel(api, ext1, "Integrates", "REST/SOAP")

@enduml
```

*Export: `docs/architecture/diagrams/exports/c4-container.png`*

### Container Overview

| Container | Technology | Purpose | Owner |
|-----------|------------|---------|-------|
| Web Application | React | User interface | Frontend Team |
| API Service | .NET Core | Business logic & API | Backend Team |
| Background Worker | .NET Core | Async processing | Backend Team |
| Database | Oracle | Persistent storage | DBA Team |
| Cache | Redis | Performance | DevOps |

---

## 5.2 Level 2: Container Decomposition

### 5.2.1 API Service (Whitebox)

```plantuml
@startuml C4_Component_API
!include <C4/C4_Component>

title Component Diagram - API Service

Container_Boundary(api, "API Service") {
    Component(controllers, "API Controllers", "ASP.NET Core", "HTTP endpoints")
    Component(services, "Domain Services", "C#", "Business logic")
    Component(validators, "Validators", "FluentValidation", "Input validation")
    Component(repos, "Repositories", "EF Core", "Data access")
    Component(mappers, "Mappers", "AutoMapper", "DTO mapping")
    Component(clients, "External Clients", "HttpClient", "External API calls")
}

ContainerDb(db, "Database", "Oracle")
Container_Ext(cache, "Cache", "Redis")
Container_Ext(ext, "External API", "")

Rel(controllers, validators, "Validates with")
Rel(controllers, services, "Calls")
Rel(services, repos, "Uses")
Rel(services, mappers, "Maps with")
Rel(services, clients, "Calls")
Rel(repos, db, "Queries")
Rel(services, cache, "Caches")
Rel(clients, ext, "Requests")

@enduml
```

#### Component Responsibilities

| Component | Responsibility | Key Classes |
|-----------|----------------|-------------|
| Controllers | HTTP request handling | `AddressController`, `SearchController` |
| Services | Business logic | `AddressService`, `SearchService` |
| Validators | Input validation | `AddressValidator`, `SearchValidator` |
| Repositories | Data access | `AddressRepository`, `IRepository<T>` |
| Mappers | Object mapping | `AddressProfile`, `DTOMappings` |
| Clients | External integration | `VrkClient`, `OsorClient` |

### 5.2.2 Background Worker (Whitebox)

```plantuml
@startuml C4_Component_Worker
!include <C4/C4_Component>

title Component Diagram - Background Worker

Container_Boundary(worker, "Background Worker") {
    Component(handlers, "Message Handlers", "C#", "Process messages")
    Component(jobs, "Scheduled Jobs", "Hangfire", "Recurring tasks")
    Component(sync, "Sync Engine", "C#", "Data synchronization")
    Component(repos, "Repositories", "EF Core", "Data access")
}

Container_Ext(queue, "Message Queue", "SNS/SQS")
ContainerDb(db, "Database", "Oracle")

Rel(queue, handlers, "Delivers")
Rel(handlers, sync, "Triggers")
Rel(jobs, sync, "Schedules")
Rel(sync, repos, "Uses")
Rel(repos, db, "Persists")

@enduml
```

---

## 5.3 Level 3: Component Details

### Key Component: {Component Name}

```mermaid
classDiagram
    class IAddressService {
        <<interface>>
        +GetById(id) Address
        +Search(criteria) List~Address~
        +Create(dto) Address
        +Update(id, dto) Address
    }

    class AddressService {
        -IAddressRepository repo
        -IValidator validator
        -IMapper mapper
        +GetById(id) Address
        +Search(criteria) List~Address~
        +Create(dto) Address
        +Update(id, dto) Address
    }

    class AddressRepository {
        -DbContext context
        +GetById(id) Address
        +Query() IQueryable
        +Add(entity) void
        +Update(entity) void
    }

    IAddressService <|.. AddressService
    AddressService --> AddressRepository
    AddressService --> IValidator
    AddressService --> IMapper
```

#### Class Responsibilities

| Class | Purpose | Dependencies |
|-------|---------|--------------|
| `AddressService` | Core business logic | Repository, Validator, Mapper |
| `AddressRepository` | Data access | DbContext |
| `AddressValidator` | Validation rules | None |

---

## 5.4 Dependency Overview

### Internal Dependencies

```mermaid
flowchart LR
    subgraph Services["Service Layer"]
        S1[AddressService]
        S2[SearchService]
        S3[SyncService]
    end

    subgraph Data["Data Layer"]
        R1[AddressRepository]
        R2[SearchRepository]
        DB[(Database)]
    end

    subgraph Common["Common"]
        C1[DarCommon]
        C2[Utilities]
    end

    S1 --> R1 --> DB
    S2 --> R2 --> DB
    S3 --> R1
    S1 --> C1
    S2 --> C1
    R1 --> C2
```

### Dependency Matrix

| Component | Depends On | Used By |
|-----------|------------|---------|
| DarCommon | - | All services |
| DarDatabaseServices | DarCommon | All services |
| AddressService | DarDatabaseServices, DarCommon | Controllers |
| SearchService | DarDatabaseServices, DarCommon | Controllers |

---

## 5.5 Important Interfaces

| Interface | Purpose | Implementors |
|-----------|---------|--------------|
| `IAddressService` | Address operations | `AddressService` |
| `IRepository<T>` | Generic data access | All repositories |
| `IExternalClient` | External API calls | `VrkClient`, `OsorClient` |

---

## References

- [Context](03-context-scope.md) - System boundary
- [Runtime View](06-runtime-view.md) - How blocks interact
- [Deployment View](07-deployment-view.md) - Where blocks run

---

*Last Updated: {Date}*
*Status: [ ] Draft / [ ] Review / [ ] Complete*
