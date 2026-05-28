# Project Scope Definition

<!--
  STEP: 00 - Project Scope Definition (BEFORE Step 01)

  PURPOSE: Define the exact boundaries of the legacy analysis in a monorepo.
  WHEN: BEFORE Step 01 (Codebase Reconnaissance) begins.
  WHY: Large monorepos contain multiple modules/subsystems. Without explicit scope,
       analysis will be unfocused, incomplete, or wastefully broad.

  OUTPUT LOCATION:
    {analysis-docs-folder}/PROJECT-SCOPE.md
    Example: tams-docs/tms-claims-payments-portlets/PROJECT-SCOPE.md

    Place at the ROOT of the analysis output folder, NOT in a subdirectory.
    This file anchors the entire analysis - all other artifacts reference it.

  This document is the CONTRACT for what will be analyzed.
-->

**Project**: {PROJECT_NAME}
**Analysis Target**: {MODULE_OR_SUBSYSTEM_NAME}
**Date**: {YYYY-MM-DD}
**Status**: [ ] Draft / [ ] Approved / [ ] In Progress / [ ] Complete

---

## 1. Analysis Target Definition

### 1.1 What Are We Analyzing?

| Attribute | Value |
|-----------|-------|
| **Module Name** | {e.g., Claims Processing Module} |
| **Module Type** | {Portlet / Service / Library / Batch Job / API / Full Application} |
| **Primary Function** | {One sentence: what does this module DO?} |
| **Business Domain** | {e.g., Tax Refunds, Certificate Management, Payment Processing} |
| **User-Facing?** | {Yes - Portal / Yes - Back Office / No - Backend Only} |

### 1.2 Why This Module?

**Business Driver**: {Why is this module being analyzed? Migration? Performance? Compliance?}

**Transformation Goals** (if modernization):
| Layer | Current (AS-IS) | Target (TO-BE) |
|-------|-----------------|----------------|
| Frontend | {Current UI tech} | {Target UI tech} |
| Backend | {Current framework} | {Target framework} |
| Features | Current functionality | {100% parity / Subset / Enhanced} |
| Business Rules | {Current location} | {Target approach} |
| Data Model | Current schema | {No change / Migration required} |

**Traceability Requirements** (if strict parity required):
- [ ] All features must be transferred AS-IS
- [ ] All business rules must be extracted and documented
- [ ] Data model must be preserved
- [ ] Change documentation required for any deviations:
  - Requirements carried forward unchanged
  - Requirements modified (with justification)
  - Requirements removed (with justification)
  - New requirements added (with justification)

**Selection Criteria**:
- [ ] High business value / critical workflow
- [ ] High technical debt / maintenance burden
- [ ] Scheduled for modernization
- [ ] Security/compliance concerns
- [ ] Performance bottleneck
- [ ] Other: {specify}

---

## 2. Scope Boundaries

### 2.1 Included Paths (IN SCOPE)

List all directories and files that ARE part of this analysis:

| Path | Type | Description | Estimated Size |
|------|------|-------------|----------------|
| `{path/to/module}/` | Source | Main module source code | {LOC or file count} |
| `{path/to/portlet}/` | Source | Portlet implementation | {LOC or file count} |
| `{path/to/resources}/` | Config | Configuration files | {file count} |
| `{path/to/sql}/` | Database | Related database scripts | {file count} |

**Total Estimated Scope**: {X files, ~Y,000 lines of code}

### 2.2 Excluded Paths (OUT OF SCOPE)

List directories that are explicitly EXCLUDED:

| Path | Reason for Exclusion |
|------|---------------------|
| `{path/to/other-module}/` | Separate module, not in scope |
| `{path/to/tests}/` | Test code - analyze separately if needed |
| `{path/to/generated}/` | Auto-generated code |
| `{path/to/third-party}/` | Vendor libraries |

### 2.3 Shared Dependencies (PARTIAL SCOPE)

Modules that this analysis target DEPENDS ON but are not fully analyzed:

| Dependency | Path | Analysis Depth |
|------------|------|----------------|
| `{tms-common}` | `{path}` | Interface only - document how target uses it |
| `{tms-core}` | `{path}` | Interface only - document integration points |
| `{database-schema}` | `{path}` | Tables/procedures used by this module only |

---

## 3. Technology Boundaries

### 3.1 Technologies In Scope

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Language | {Java/C#/etc.} | {version} | Primary language |
| Framework | {Spring/Liferay/etc.} | {version} | Framework used |
| Database | {Oracle/PostgreSQL/etc.} | {version} | Database platform |
| Frontend | {Angular/JSP/etc.} | {version} | UI technology |

### 3.2 Integration Points (Document, Don't Deep-Dive)

| Integration | Direction | Protocol | Analysis Depth |
|-------------|-----------|----------|----------------|
| `{Core Services}` | Outbound | {REST/SOAP/Direct} | Document interface contracts |
| `{External System}` | Inbound/Outbound | {Protocol} | Document data flows only |
| `{Message Queue}` | Publish/Subscribe | {Protocol} | Document message formats |

---

## 3.3 Database Schema Location

> **Required for LITE process v2.7+**: Specify where to find database schema definitions for constraint extraction.

| Schema Type | Path | Description |
|-------------|------|-------------|
| DDL Scripts | `{path/to/sql/ddl/}` | CREATE TABLE, ALTER TABLE statements |
| Entity Classes | `{path/to/model/}` | JPA @Entity, @Column annotations |
| Repository Classes | `{path/to/repository/}` | @Query, native queries |
| Flyway/Liquibase | `{path/to/migrations/}` | Schema migration scripts |

**Tables In Scope** (this module owns or uses):

| Table Name | Owner? | Key Columns | Constraints to Scan |
|------------|--------|-------------|---------------------|
| `{ACC_CLAIM}` | Yes | CLAIM_ID, TAXPAYER_ID | PK, FK to TAXPAYER |
| `{PAYMENT}` | Yes | PAYMENT_ID, CLAIM_ID | PK, FK to ACC_CLAIM, NOT NULL |
| `{TAXPAYER}` | No (ref only) | TAXPAYER_ID | FK reference only |

**Grouping/Aggregation Logic Location**:

| Type | Path | Pattern to Scan |
|------|------|-----------------|
| SQL Queries | `{path/to/queries/}` | GROUP BY clauses |
| Java Streams | `{path/to/services/}` | Collectors.groupingBy |
| JPA Queries | `{path/to/repository/}` | @Query with aggregation |

---

## 3.4 Business Requirements Documents

> **Required for LITE process v2.8+**: Specify where to find business requirements documents for UI display rules.

| Document Type | Path | Description |
|---------------|------|-------------|
| Business Specs | `{path/to/docs/TMS-ACC-*.md}` | Module business requirements |
| BRD | `{path/to/BRD_*.md}` | Business Requirements Documents |
| SRD | `{path/to/SRD_*.md}` | System Requirements Documents |
| Confluence Export | `{path/to/confluence/*.md}` | Exported Confluence pages |

**UI Display Rules to Extract**:

| Pattern | Example | Rule Type |
|---------|---------|-----------|
| `display as blank` | "if AT then display as blank" | Conditional visibility |
| `do not show` | "do not show due date for AT" | Field hiding |
| `visible when` | "visible when status = ACTIVE" | Conditional display |
| `if ... then display` | "if taxType = X then display Y" | Tax-type specific |

---

## 3.5 Test Automation Location

> **Required for LITE process v2.11+**: Specify existing test automation for coverage analysis and migration planning.

| Test Type | Path | Framework | Description |
|-----------|------|-----------|-------------|
| E2E Tests | `{path/to/taxTestAutomation/src/test/**}` | Selenium/TestNG | UI automation tests |
| Page Objects | `{path/to/taxTestAutomation/src/main/java/pages/**}` | POM | Reusable page components |
| API Tests | `{path/to/taxTestAutomation/src/main/java/api/**}` | REST Assured | API integration tests |
| Test Data | `{path/to/taxTestAutomation/src/test/resources/testData/**}` | JSON/CSV | Test fixtures |

**Module-Specific Tests** (this module):

| Test Class | Type | Coverage | Notes |
|------------|------|----------|-------|
| `{PaymentTests.java}` | E2E | Payment flows | Portal payments |
| `{ClaimsAndPaymentsPage.java}` | Page Object | Claims list, cart | Shared component |

**TO-BE Test Stack** (from constitution/project decision):

| Layer | TO-BE Technology | Source |
|-------|------------------|--------|
| E2E Tests | `{defined in constitution}` | `{constitution file}` |
| Unit Tests | `{defined in constitution}` | `{constitution file}` |
| API Tests | `{defined in constitution}` | `{constitution file}` |
| Reporting | `{defined in constitution}` | `{constitution file}` |

> **Note**: Do NOT assume test automation technology. Reference project constitution or architecture decision records for TO-BE stack.

---

## 3.6 Shared Business Context (OPTIONAL)

> When business context documents (Glossary, BRDs, PDFs) are shared across multiple module
> analyses, specify the shared location here. Module-local `docs/business-context/` files
> take precedence over shared files with the same name.

| Document Type | Shared Path |
|---------------|-------------|
| Glossary | `{relative-path}/Glossary.md` |
| Common BRDs | `{relative-path}/` |

**Resolution order**: module-local `docs/business-context/` > shared path above

**If omitted**: All files expected in `{ANALYSIS_ROOT}/docs/business-context/` (default behavior).

---

## 4. Analysis Objectives

### 4.1 Primary Questions to Answer

1. **Architecture**: How is this module structured? What patterns does it use?
2. **Business Logic**: What business rules are implemented? Where are they located?
3. **Data Model**: What data does this module own? What does it reference?
4. **Integration**: How does this module interact with other system components?
5. **Technical Debt**: What are the maintainability and quality issues?

### 4.2 Deliverables Expected

| Deliverable | Description | Output Location |
|-------------|-------------|-----------------|
| Arc42 AS-IS Documentation | 12 architecture sections | `arch-as-is/` |
| Component Analysis | Detailed analysis per component | `work/05-analysis/` |
| Business Rules Catalog | Extracted business logic | `work/07-synthesis/` |
| Technical Debt Inventory | Issues and recommendations | `work/04-findings/` |
| Executive Summary | Management-level summary | `work/09-summaries/` |

### 4.3 Out of Scope for This Analysis

- [ ] TO-BE architecture design (separate phase)
- [ ] Implementation of fixes or modernization
- [ ] Analysis of modules outside defined scope
- [ ] Performance testing or load testing
- [ ] Security penetration testing

---

## 5. Stakeholders and Contacts

### 5.1 Analysis Team

| Role | Name | Responsibility |
|------|------|----------------|
| Analysis Lead | {Name} | Overall analysis coordination |
| Technical SME | {Name} | Domain knowledge, code walkthrough |
| Business SME | {Name} | Business rules validation |
| Architect | {Name} | Architecture review |

### 5.2 Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Sponsor | {Name} | {Date} | [ ] Approved |
| Technical Lead | {Name} | {Date} | [ ] Approved |
| Business Owner | {Name} | {Date} | [ ] Approved |

---

## 6. Constraints and Assumptions

### 6.1 Constraints

- **Time**: Analysis must complete by {date}
- **Access**: {Any access limitations to systems, databases, documentation}
- **Resources**: {Available team members, tools}

### 6.2 Assumptions

- Source code is the authoritative source of truth
- Database schema scripts reflect production state
- {Other assumptions}

### 6.3 Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing documentation | Medium | Interview stakeholders in Step 06 |
| Complex dependencies | High | Document interfaces, don't deep-dive |
| {Other risk} | {Impact} | {Mitigation} |

---

## 7. Scope Change Control

Any changes to scope boundaries MUST be:
1. Documented in this file with date and reason
2. Approved by Analysis Lead and Technical Lead
3. Reflected in updated time/resource estimates

### Change Log

| Date | Change | Reason | Approved By |
|------|--------|--------|-------------|
| {Date} | Initial scope defined | Project kickoff | {Name} |

---

**Next Step**: After scope approval, proceed to Step 01 (Codebase Reconnaissance)

---

*Template Version: 1.0*
*Last Updated: 2026-01-24*
