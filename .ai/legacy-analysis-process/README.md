# Legacy Brownfield Solution Modernization Analysis

**Audience**: Modernization Team
**Format**: Arc42 Architecture Documentation

---

## Configuration

### Path Placeholder: `{ANALYSIS_ROOT}`

Documentation files use `{ANALYSIS_ROOT}` as a placeholder. Replace based on installation:

| Installation Location | Replace `{ANALYSIS_ROOT}` with |
|-----------------------|------------------------------|
| Project root          | `legacy-analysis`            |
| docs folder           | `docs/legacy-analysis`       |
| docs/ai folder        | `docs/ai/legacy-analysis`    |

---

## Analysis Processes (Start Here)

For AI agents and humans performing legacy analysis or modernization design:

| Process Guide | Purpose | Location |
|-------|---------|----------|
| **AS-IS Analysis** | Analyze legacy brownfield system | [how-to-perform-legacy-analysis.md](process-steps/as-is-brownfield/how-to-perform-legacy-analysis.md) |
| **TO-BE Modernization** | Design target greenfield system | [how-to-perform-modernization-analysis.md](process-steps/to-be-greenfield/how-to-perform-modernization-analysis.md) |

**Workflow Order**: Complete AS-IS analysis first, then proceed to TO-BE design.

### Expected Duration Benchmark

Based on a **~200,000 LOC** .NET/Oracle legacy monolith: **~3-4 hours**

| Phase | Duration | Context |
|-------|----------|---------|
| Scanning & Discovery | ~2.5 Hours | Tools setup, dependency mapping, static analysis |
| Component Analysis | ~30 Mins | Deep-dive of 5-10 high-risk components |
| Synthesis & Reporting | ~30 Mins | Requirement extraction and executive summary |

---

## AS-IS Brownfield System Analysis

AI-assisted, READ-ONLY documentation workflow for brownfield systems producing Arc42 architecture documentation. Prompts and templates with workflow instructions guide AI and human to systematically analyze the codebase and collect overview information.

### Key Principles

| Principle | Description |
|-----------|-------------|
| **READ-ONLY Analysis** | No code modifications; legacy code is evidence to document, not change |
| **Static Code Analysis Tools** | Deterministic tools prevent LLM hallucination; SARIF/JSON output for LLM consumption |
| **Arc42 and C4 Documentation** | Arc42 12-section architecture; C4 PlantUML for architecture, Mermaid for simple visualization |
| **Business Documentation First** | Analyze BRD, design docs, Confluence, Jira to understand "why"; document gaps between intent and reality |
| **Human-in-the-Loop Gates** | Mandatory human review gates; 3-tier validation (Automated, Functional, Security) |
| **Stakeholder Interviews** | Engineers, architects, product owners validate findings and business logic |

### Process Steps

| # | Step | Key Activities | Key Outputs | Gate |
|---|------|----------------|-------------|------|
| 01 | Reconnaissance | Codebase and tech inventory, documentation discovery, stakeholder mapping | Technology inventory, Documentation inventory, Installation requirements | â€“ |
| 02 | Tool Setup | Install static analysis tools, configure MCP servers, install diagram tools | Environment report, MCP server status, Validated tool installation | :raised_hand: |
| 03 | Static Analysis | Run Roslyn, Security Code Scan, ZPA; collect code metrics | SARIF/JSON files, Code metrics, Configuration inventory | â€“ |
| 04 | AI Findings | Parse static analysis results, categorize issues, document intent vs. implementation gaps | Findings analysis, Security findings, Documentation gaps | :raised_hand: |
| 05 | Component Analysis | Parallel sub-agents (C#, DB, Integration), extract business logic, generate C4 diagrams | AI analysis documents, C4 diagrams (Context, Containers, Components) | :raised_hand: |
| 06 | Human Review | Validate findings, stakeholder interviews, engineer interviews, approve/request corrections | Review gates, Interview notes, Corrections documented | :raised_hand: |
| 07 | Requirements | Consolidate functional/non-functional requirements, create user stories, document capabilities | Functional requirements, Non-functional requirements, User stories | â€“ |
| 08 | Quality Validation | Completeness check, Arc42 coverage, diagram validation, traceability matrix | Validation report of AI deliverables completeness and quality | :raised_hand: |
| 09 | Summary Docs | Executive summary, architecture overview, improvement opportunities | Executive summary, Arc42 AS-IS (12 sections), System capabilities | :raised_hand: |

### Technologies Used

| Category | Tool | Purpose | When to Use |
|----------|------|---------|-------------|
| Static Analysis | SourceMonitor, Roslyn, NDepend, DocFX | Code metrics, Dependency graph, SARIF output | If C# code exists |
| | Security Code Scan, Gitleaks, TruffleHog | Security scanning, Secret detection | If C# code exists |
| | ZPA, SchemaSpy | Oracle PL/SQL analysis, Database documentation | If PL/SQL exists |
| MCP Servers | Context7 | Arc42, PlantUML, Mermaid documentation | Always |
| | Knowledge Graph | Persistent memory across sessions | For large codebases |
| | Sequential Thinking | Complex multi-step workflows | For analysis orchestration |
| | Atlassian (Confluence/Jira) | Business docs, user stories, design docs | If available |
| | GitHub/DevOps/GitLab | Commits, issues, PRs, wiki pages | If available |
| Claude Skills | arc42-documentation | Arc42 templates and Context7 guidance | For architecture documentation questions |
| | c4-diagrams | C4 model PlantUML templates | For creating architecture diagrams |

---

## TO-BE Greenfield Design Process

AI-assisted solution design workflow for creating modernized target system architecture from legacy analysis findings.

### Key Principles

| Principle | Description |
|-----------|-------------|
| **AS-IS as Prerequisite** | TO-BE design builds on findings from legacy analysis |
| **Business Value Driven** | Design to capabilities; prioritize by MoSCoW |
| **Architecture Decision Records** | Document all key architectural decisions (ADRs) |
| **Design System** | UI Design Guidelines with high-fidelity mockups |
| **Specification-Driven** | Specs, API contracts, data models, test plans before implementation |
| **Human-in-the-Loop Gates** | Stakeholder review gates ensure solution ownership |
| **Incremental Delivery** | Strangler Fig pattern, parallel run, phased delivery |

### Process Steps

| # | Step | Key Activities | Key Outputs | Gate |
|---|------|----------------|-------------|------|
| 01 | Modernization Options | Evaluate rewrite/refactor/replace strategies; technology stack; risk assessment | Modernization options and risk assessment | :raised_hand: |
| 02 | Architecture Planning | Design target architecture; create ADRs; define component boundaries | Target architecture, ADRs | |
| 03 | Business Requirements | Transform AS-IS to TO-BE requirements; prioritize (MoSCoW); user personas | BRD with prioritized features and personas | |
| 04 | UI Design Guidelines | Style guide; high-fidelity mockups for main screens; component patterns | UI design guidelines and visual prototypes | |
| 05 | Use Case Specifications | Define use cases + enablers; acceptance criteria (Gherkin); reference UI | Use case specifications and acceptance criteria | |
| 06 | Technical Specifications | Backend specs (API, business logic); frontend specs (components, flows) | Complete technical specifications | |
| 07 | Data Model Planning | Schema design; data dictionary; migration strategy; data access patterns | Data model, migration strategy | |
| 08 | Test Planning | E2E test plans; unit test specs; visual regression; performance/security | Comprehensive test plans | |
| 09 | Implementation Roadmap | Feature prioritization; phased delivery (MVP, Extended, Advanced); deployment | Roadmap with phases and deployment plan | |
| 10 | Summary Documentation | Complete Arc42 TO-BE (12 sections) + ADRs + BRD + Design + Specs + Tests + Roadmap | Complete architecture documentation set | :raised_hand: |

### Technologies Used

| Category | Tool/Technology | Purpose |
|----------|-----------------|---------|
| UI Mockups | DaisyUI + Tailwind CSS | High-fidelity HTML mockups |
| Screenshots | Playwright MCP | Capture mockups as visual baselines |
| API Design | OpenAPI/Swagger | API contract specifications |
| Documentation | Context7 MCP | Arc42 guidance, framework docs |
| Traceability | Knowledge Graph MCP | Requirement to Use Case to Spec mapping |

---

## Documentation Structure

Purpose: Complete documentation of both the existing Brownfield AS-IS system and modernized Greenfield TO-BE system.

Format: Arc42 12-section architecture documentation used for AS-IS and TO-BE systems.

### Output Folders

| Folder | Purpose |
|--------|---------|
| `arch-as-is/` | Arc42 12-section docs for current legacy system |
| `arch-to-be/` | Arc42 12-section docs for target modern system |
| `work/` | Analysis work artifacts from 9-step process |
| `templates/` | Arc42 and analysis templates |
| `process-steps/` | Reusable workflow documentation |

### Full Directory Structure
```
.ai/legacy-analysis-process/
â”œâ”€â”€ README.md                      # This file
â”œâ”€â”€ arch-as-is/                    # Arc42 docs: Current legacy system (brownfield)
â”œâ”€â”€ arch-to-be/                    # Arc42 docs: Target modern system (greenfield)
â”‚   â””â”€â”€ spec/
â”œâ”€â”€ templates/                     # Templates and guidance
â”œâ”€â”€ process-steps/                 # Reusable process documentation
â”‚   â”œâ”€â”€ as-is-brownfield/          # AS-IS analysis workflow
â”‚   â””â”€â”€ to-be-greenfield/          # TO-BE design workflow
â””â”€â”€ work/                          # Analysis work artifacts
```

---

### .ai_project_memory/ Setup

**Purpose**: Project-specific knowledge and constitutions that govern AI agent behavior.

```
.ai_project_memory/
â”œâ”€â”€ general-overview.md            # Project summary, components, integrations
â”œâ”€â”€ constitution.md                # Core principles (all AI work)
â”œâ”€â”€ legacy-analysis-constitution.md # Legacy analysis rules (READ-ONLY, gates)
â”œâ”€â”€ constitution-backend.md        # Backend tech stack rules (optional)
â”œâ”€â”€ constitution-frontend.md       # Frontend tech stack rules (optional)
â""â"€â"€ architecture.md                # System architecture and integration points
```

| File | Purpose |
|------|---------|
| `general-overview.md` | Executive summary, key facts, system components |
| `constitution.md` | Non-negotiable coding principles for all AI work |
| `legacy-analysis-constitution.md` | READ-ONLY rules, human gates, privacy protection |
| `constitution-{stack}.md` | Tech-specific rules (backend, frontend) |
| `architecture.md` | System architecture, integration points, security |

---

### Legacy Migration Project Setup

**Purpose**: Output location for legacy analysis artifacts, separate from source code repository.

```
legacy-migration-project/
â”œâ”€â”€ PROJECT-SCOPE.md               # Defines analysis boundaries
â”œâ”€â”€ Glossary.md               # AI agent instructions for this project
â”œâ”€â”€ arch-as-is/                    # Full Arc42 AS-IS (12 sections)
â”œâ”€â”€ arch-as-is-lite/               # Lightweight AS-IS (specs + RTM)
â”œâ”€â”€ arch-to-be/                    # Full Arc42 TO-BE (12 sections)
â”œâ”€â”€ docs/                          # Supporting documentation
â”‚   â”œâ”€â”€ business-context/          # BRDs, regulations, glossaries
â”‚   â”œâ”€â”€ data-model/                # Database schemas, ERDs
â”‚   â””â”€â”€ as-is-ui-info/             # UI screenshots, analysis
â””â”€â”€ work/                          # Analysis artifacts by step
    â”œâ”€â”€ 01-reconnaissance/         # Dependencies, structure
    â”œâ”€â”€ 03-metrics/                # Static analysis results
    â””â”€â”€ 09-summaries/              # Executive summaries
```

| Folder | Contents |
|--------|----------|
| `arch-as-is-lite/` | BRS, SRS, RTM, business rules, DTO specs |
| `docs/business-context/` | BRDs, regulations, glossaries, PDFs |
| `docs/data-model/` | Database tables, relationships, ERDs |
| `docs/as-is-ui-info/` | Screenshots, UI flow analysis |
| `work/` | Step-numbered analysis artifacts |

**Note**: Use `arch-as-is-lite/` for focused specification extraction. Use full `arch-as-is/` (12 Arc42 sections) for comprehensive system documentation.

---

## Human Review Gates

### AS-IS Analysis Gates (6 Mandatory)

| Gate | Step | Purpose |
|------|------|---------|
| 1 | 02 | Tool Setup Verification |
| 2 | 04 | AI Findings Review + Component Strategy |
| 3 | 05 | Component Analysis Approval |
| 4 | 06 | Human Review Validation |
| 5 | 08 | Quality Validation Approval |
| 6 | 09 | Summary Documentation Approval |

### TO-BE Design Gates (2 Mandatory)

| Gate | Step | Purpose |
|------|------|---------|
| 1 | 01 | Modernization Options Review |
| 2 | 10 | Final Architecture Documentation Approval |

**Gate Tracking**: [artifacts/gate-tracking.md](work/gate-tracking.md)

---

## Quick Navigation

| Goal | Path |
|------|------|
| Quick AS-IS Overview | `arch-as-is/01` through `04` |
| Technical AS-IS Deep Dive | `arch-as-is/05-08` + `work/05-analysis/` |
| Modernization TO-BE Planning | Compare `arch-as-is/` with `arch-to-be/` |
| Executive Summaries | `work/09-summaries/` |

---

**Last Updated**: 2026-01-22
