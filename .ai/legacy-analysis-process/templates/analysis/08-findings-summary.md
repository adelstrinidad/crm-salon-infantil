# Findings Summary Template

**IMPORTANT**: Each sub-agent MUST produce a findings summary at the end of its analysis document. This ensures consistent output across all agents.

### Required Output Template (End of Each SA-XX Document)

```markdown
---

## Findings Summary

### Component Overview

| Attribute | Value |
|-----------|-------|
| **Component Name** | {name} |
| **Type** | {Library/Service/Tool/Package} |
| **LOC** | {lines of code} |
| **Complexity** | {High/Medium/Low} |
| **Test Coverage** | {%} |

### Key Findings

| Finding | Category | Severity | Recommendation |
|---------|----------|----------|----------------|
| {finding 1} | {Code Quality/Security/Architecture} | {High/Med/Low} | {action} |
| {finding 2} | {Code Quality/Security/Architecture} | {High/Med/Low} | {action} |

### Business Logic Identified

| Logic ID | Description | Location | Reimplementation Effort |
|----------|-------------|----------|------------------------|
| BL-001 | {description} | {file:line} | {estimate} |

### Dependencies (Critical)

| Dependency | Type | Risk | Notes |
|------------|------|------|-------|
| {dependency} | {Internal/External/Database} | {High/Med/Low} | {notes} |

### Technical Debt

| Debt Item | Effort to Fix | Priority | Blocking? |
|-----------|---------------|----------|-----------|
| {item} | {hours/days} | {High/Med/Low} | {Yes/No} |

### Modernization Notes

- **Recommended Target**: {e.g., .NET 8, PostgreSQL}
- **Migration Complexity**: {High/Medium/Low}
- **Key Blockers**: {list blockers}
- **Quick Wins**: {list easy improvements}
```

### Example: Sub-Agent Findings (SA-04: Sync Components)

```markdown
---

## Findings Summary

### Component Overview

| Attribute | Value |
|-----------|-------|
| **Component Name** | SyncAgent, SyncAgent1VTJ, SyncAgentEAI |
| **Type** | WCF Services |
| **LOC** | ~8,500 |
| **Complexity** | High |
| **Test Coverage** | ~15% |

### Key Findings

| Finding | Category | Severity | Recommendation |
|---------|----------|----------|----------------|
| WSE 3.0 dependency in SyncAgent1VTJ | Security | High | Replace with HttpClient/WCF |
| God class: SyncRequestHandler | Architecture | Medium | Decompose into smaller handlers |
| Framework mismatch (.NET 4.5.2 vs 4.7.2) | Code Quality | Low | Upgrade SyncUtility to 4.7.2 |

### Business Logic Identified

| Logic ID | Description | Location | Reimplementation Effort |
|----------|-------------|----------|------------------------|
| BL-004-01 | {EXTERNAL_SYSTEM_4} sync message transformation | SyncRequestHandler:245 | 3 days |
| BL-004-02 | {EXTERNAL_SYSTEM_3} data mapping | AddressDataMapper:89 | 2 days |
| BL-004-03 | SNS event publishing | MessagePublisher:34 | 1 day |

### Dependencies (Critical)

| Dependency | Type | Risk | Notes |
|------------|------|------|-------|
| DarDatabaseServices | Internal | Low | Core DAL |
| Microsoft.Web.Services3 | External | High | Obsolete (WSE 3.0) |
| AWSSDK.SNS | External | Low | Cloud dependency |

### Technical Debt

| Debt Item | Effort to Fix | Priority | Blocking? |
|-----------|---------------|----------|-----------|
| Remove WSE 3.0 | 5 days | High | Yes (security) |
| Add unit tests | 8 days | Medium | No |
| Implement DI | 3 days | Medium | No |

### Modernization Notes

- **Recommended Target**: ASP.NET Core Web API or gRPC
- **Migration Complexity**: High (WSE 3.0 removal required)
- **Key Blockers**: {EXTERNAL_SYSTEM_4} integration relies on legacy protocol
- **Quick Wins**: Replace SyncUtility Oracle calls with Dapper
```
