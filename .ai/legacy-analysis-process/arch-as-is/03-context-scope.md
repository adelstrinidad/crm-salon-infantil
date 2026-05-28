# 3. Context and Scope

<!--
Arc42 Section 3: Context and Scope
Defines the system boundary and its interactions with external systems.
-->

## 3.1 Business Context

### Context Diagram

```plantuml
@startuml C4_Context
!include <C4/C4_Context>

title System Context Diagram - {System Name}

Person(user, "System User", "Primary user of the system")
Person(admin, "Administrator", "System administrator")

System(system, "{System Name}", "Core system description")

System_Ext(ext1, "{External System 1}", "Description")
System_Ext(ext2, "{External System 2}", "Description")
System_Ext(ext3, "{External System 3}", "Description")

Rel(user, system, "Uses", "HTTPS")
Rel(admin, system, "Manages", "HTTPS")
Rel(system, ext1, "Sends data to", "REST/JSON")
Rel(ext2, system, "Pushes updates", "SOAP/XML")
Rel(system, ext3, "Queries", "SQL")

@enduml
```

*Export: `docs/architecture/diagrams/exports/c4-context.png`*

### Business Partners/Users

| Partner/User | Description | Interface | Data Exchanged |
|--------------|-------------|-----------|----------------|
| {Name} | {Who they are} | {How they interact} | {What data} |
| {Name} | {Who they are} | {How they interact} | {What data} |
| {Name} | {Who they are} | {How they interact} | {What data} |

### External Systems

| System | Description | Interface | Protocol | Direction |
|--------|-------------|-----------|----------|-----------|
| {Name} | {Purpose} | {API/File/DB} | {REST/SOAP/File} | {In/Out/Both} |
| {Name} | {Purpose} | {API/File/DB} | {REST/SOAP/File} | {In/Out/Both} |

---

## 3.2 Technical Context

### Technical Context Diagram

```plantuml
@startuml Technical_Context
!include <C4/C4_Context>

title Technical Context - {System Name}

System(system, "{System Name}", "")

System_Ext(lb, "Load Balancer", "HAProxy/F5")
System_Ext(db, "Database", "Oracle 19c")
System_Ext(cache, "Cache", "Redis")
System_Ext(queue, "Message Queue", "RabbitMQ/SNS")
System_Ext(storage, "File Storage", "S3/NFS")
System_Ext(auth, "Identity Provider", "Azure AD/LDAP")

Rel(lb, system, "Routes requests", "HTTPS:443")
Rel(system, db, "Persists data", "Oracle:1521")
Rel(system, cache, "Caches data", "Redis:6379")
Rel(system, queue, "Publishes events", "AMQP:5672")
Rel(system, storage, "Stores files", "HTTPS:443")
Rel(system, auth, "Authenticates", "LDAPS:636")

@enduml
```

### Technical Interfaces

| Interface | Technology | Port | Protocol | Security |
|-----------|------------|------|----------|----------|
| Web API | IIS/Kestrel | 443 | HTTPS | TLS 1.2+ |
| Database | Oracle | 1521 | TNS | Encrypted |
| Cache | Redis | 6379 | RESP | TLS |
| Events | SNS/SQS | 443 | HTTPS | IAM |

### Network Zones

```mermaid
flowchart TB
    subgraph Internet["Internet Zone"]
        Client[Client Applications]
    end

    subgraph DMZ["DMZ"]
        LB[Load Balancer]
        WAF[Web Application Firewall]
    end

    subgraph Internal["Internal Network"]
        App[Application Servers]
        API[API Gateway]
    end

    subgraph Data["Data Zone"]
        DB[(Database)]
        Cache[(Cache)]
    end

    Client --> WAF --> LB --> App
    App --> API
    App --> DB
    App --> Cache
```

---

## 3.3 Mapping Input/Output

### Data Flow Summary

| Direction | Source | Destination | Data | Format | Frequency |
|-----------|--------|-------------|------|--------|-----------|
| Inbound | {Source} | {System} | {Data type} | {JSON/XML} | {Real-time/Batch} |
| Outbound | {System} | {Destination} | {Data type} | {JSON/XML} | {Real-time/Batch} |

### Input Channels

| Channel | Source | Data | Format | Validation |
|---------|--------|------|--------|------------|
| {Name} | {Source} | {Description} | {Format} | {Rules} |

### Output Channels

| Channel | Destination | Data | Format | SLA |
|---------|-------------|------|--------|-----|
| {Name} | {Destination} | {Description} | {Format} | {Response time} |

---

## References

- [Building Block View](05-building-block-view.md) - Internal structure
- [Runtime View](06-runtime-view.md) - Runtime interactions
- [Deployment View](07-deployment-view.md) - Physical deployment

---

*Last Updated: {Date}*
*Status: [ ] Draft / [ ] Review / [ ] Complete*
