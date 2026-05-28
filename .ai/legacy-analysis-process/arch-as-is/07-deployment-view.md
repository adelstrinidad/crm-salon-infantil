# 7. Deployment View

<!--
Arc42 Section 7: Deployment View
Shows the technical infrastructure and how software maps to it.
Uses PlantUML for deployment diagrams with infrastructure icons.
-->

## 7.1 Infrastructure Overview

### Deployment Diagram

```plantuml
@startuml deployment
!include <C4/C4_Deployment>

title Deployment Diagram - {System Name}

Deployment_Node(internet, "Internet", "") {
    Deployment_Node(client, "Client Device", "Browser") {
        Container(browser, "Web Browser", "Chrome/Firefox", "User interface")
    }
}

Deployment_Node(cloud, "Cloud Environment", "AWS/Azure") {
    Deployment_Node(dmz, "DMZ", "Public Subnet") {
        Deployment_Node(lb, "Load Balancer", "ALB/nginx") {
            Container(loadbalancer, "Load Balancer", "L7", "Traffic distribution")
        }
    }

    Deployment_Node(app_zone, "Application Zone", "Private Subnet") {
        Deployment_Node(app1, "App Server 1", "Windows/Linux") {
            Container(api1, "API Instance", ".NET Core", "REST API")
        }
        Deployment_Node(app2, "App Server 2", "Windows/Linux") {
            Container(api2, "API Instance", ".NET Core", "REST API")
        }
        Deployment_Node(worker_node, "Worker Server", "Windows/Linux") {
            Container(worker, "Worker", ".NET Core", "Background jobs")
        }
    }

    Deployment_Node(data_zone, "Data Zone", "Private Subnet") {
        Deployment_Node(db_primary, "Database Primary", "Oracle") {
            ContainerDb(oracle, "Oracle DB", "19c", "Primary datastore")
        }
        Deployment_Node(cache_node, "Cache Cluster", "Redis") {
            ContainerDb(redis, "Redis", "6.x", "Cache layer")
        }
    }
}

Rel(browser, loadbalancer, "HTTPS", "443")
Rel(loadbalancer, api1, "HTTP", "8080")
Rel(loadbalancer, api2, "HTTP", "8080")
Rel(api1, oracle, "Oracle", "1521")
Rel(api2, oracle, "Oracle", "1521")
Rel(api1, redis, "Redis", "6379")
Rel(api2, redis, "Redis", "6379")
Rel(worker, oracle, "Oracle", "1521")

@enduml
```

*Export: `docs/architecture/diagrams/exports/deployment.png`*

---

## 7.2 Environment Overview

### Environments

| Environment | Purpose | URL | Notes |
|-------------|---------|-----|-------|
| Development | Local development | `localhost:5000` | Docker Compose |
| Test | Integration testing | `test.example.com` | Shared |
| Staging | Pre-production | `staging.example.com` | Production mirror |
| Production | Live system | `app.example.com` | HA enabled |

### Environment Comparison

```mermaid
flowchart LR
    subgraph Dev["Development"]
        D1[Single Instance]
        D2[SQLite/LocalDB]
    end

    subgraph Test["Test"]
        T1[2 Instances]
        T2[Oracle Test]
    end

    subgraph Staging["Staging"]
        S1[2 Instances]
        S2[Oracle Staging]
    end

    subgraph Prod["Production"]
        P1[4+ Instances]
        P2[Oracle HA]
        P3[Redis Cluster]
    end

    Dev --> Test --> Staging --> Prod
```

---

## 7.3 Infrastructure Topology

### Network Diagram

```mermaid
flowchart TB
    subgraph Internet
        Users[Users]
        Partner[Partner Systems]
    end

    subgraph DMZ["DMZ (10.0.1.0/24)"]
        WAF[WAF]
        LB[Load Balancer]
    end

    subgraph AppTier["App Tier (10.0.2.0/24)"]
        App1[App Server 1]
        App2[App Server 2]
        Worker[Worker]
    end

    subgraph DataTier["Data Tier (10.0.3.0/24)"]
        DB[(Oracle)]
        Cache[(Redis)]
    end

    subgraph Mgmt["Management (10.0.4.0/24)"]
        Bastion[Bastion Host]
        Monitor[Monitoring]
    end

    Users --> WAF --> LB
    Partner --> LB
    LB --> App1
    LB --> App2
    App1 --> DB
    App2 --> DB
    App1 --> Cache
    App2 --> Cache
    Worker --> DB
    Bastion --> AppTier
    Monitor --> AppTier
    Monitor --> DataTier
```

### Network Security

| Source | Destination | Port | Protocol | Purpose |
|--------|-------------|------|----------|---------|
| Internet | WAF | 443 | HTTPS | User access |
| WAF | Load Balancer | 443 | HTTPS | Traffic forwarding |
| Load Balancer | App Servers | 8080 | HTTP | Application traffic |
| App Servers | Database | 1521 | Oracle | Data access |
| App Servers | Cache | 6379 | Redis | Caching |
| Bastion | App Servers | 22/3389 | SSH/RDP | Administration |

---

## 7.4 Hardware/Cloud Specifications

### Compute Resources

| Component | Instance Type | vCPU | Memory | Storage | Quantity |
|-----------|--------------|------|--------|---------|----------|
| Load Balancer | ALB | N/A | N/A | N/A | 2 (HA) |
| App Server | m5.large | 2 | 8 GB | 50 GB | 2-4 (ASG) |
| Worker | m5.medium | 1 | 4 GB | 30 GB | 2 |
| Database | db.r5.2xlarge | 8 | 64 GB | 500 GB | 2 (Primary/Standby) |
| Cache | r6g.large | 2 | 16 GB | N/A | 3 (Cluster) |

### Storage

| Storage Type | Size | IOPS | Purpose |
|--------------|------|------|---------|
| Database SSD | 500 GB | 10,000 | Primary data |
| Database Backup | 2 TB | N/A | Daily backups |
| Application Logs | 100 GB | 3,000 | Log storage |
| File Storage | 200 GB | N/A | Document storage |

---

## 7.5 Configuration Management

### Configuration Sources

| Source | Scope | Examples |
|--------|-------|----------|
| appsettings.json | Application defaults | Logging, features |
| Environment Variables | Environment-specific | Connection strings, API keys |
| AWS Parameter Store | Secrets | Database passwords |
| Feature Flags | Runtime | Feature toggles |

### Configuration Hierarchy

```mermaid
flowchart TD
    Base[appsettings.json] --> EnvFile[appsettings.{Environment}.json]
    EnvFile --> EnvVars[Environment Variables]
    EnvVars --> Secrets[Secret Manager]
    Secrets --> Runtime[Runtime Overrides]

    style Base fill:#e1f5fe
    style Secrets fill:#ffcdd2
```

---

## 7.6 High Availability & Disaster Recovery

### HA Architecture

```plantuml
@startuml ha-architecture
!include <C4/C4_Deployment>

title High Availability Architecture

Deployment_Node(region1, "Primary Region", "eu-west-1") {
    Deployment_Node(az1, "AZ-1", "") {
        Container(app1, "App", ".NET")
        ContainerDb(db_primary, "Oracle Primary", "")
    }
    Deployment_Node(az2, "AZ-2", "") {
        Container(app2, "App", ".NET")
        ContainerDb(db_standby, "Oracle Standby", "")
    }
}

Deployment_Node(region2, "DR Region", "eu-central-1") {
    Deployment_Node(dr_az, "AZ-1", "") {
        Container(dr_app, "App (Standby)", ".NET")
        ContainerDb(dr_db, "Oracle DR", "")
    }
}

Rel(db_primary, db_standby, "Sync Replication")
Rel(db_primary, dr_db, "Async Replication")

@enduml
```

### Recovery Objectives

| Metric | Target | Current | Notes |
|--------|--------|---------|-------|
| RTO (Recovery Time Objective) | 1 hour | 2 hours | Automated failover in progress |
| RPO (Recovery Point Objective) | 5 minutes | 15 minutes | Sync replication planned |
| Availability Target | 99.9% | 99.5% | Multi-AZ deployment |

---

## 7.7 Monitoring & Observability

### Monitoring Stack

| Tool | Purpose | Scope |
|------|---------|-------|
| CloudWatch/Prometheus | Metrics | Infrastructure & Application |
| ELK/Splunk | Logging | All components |
| Jaeger/X-Ray | Tracing | Distributed requests |
| PagerDuty/Opsgenie | Alerting | On-call notifications |

### Key Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| CPU Utilization | >80% | Warning |
| Memory Usage | >85% | Warning |
| Response Time P99 | >2s | Critical |
| Error Rate | >1% | Critical |
| Database Connections | >80% | Warning |

---

## References

- [Building Blocks](05-building-block-view.md) - What is deployed
- [Runtime View](06-runtime-view.md) - How components interact
- [Crosscutting](08-crosscutting-concepts.md) - Logging, monitoring details

---

*Last Updated: {Date}*
*Status: [ ] Draft / [ ] Review / [ ] Complete*
