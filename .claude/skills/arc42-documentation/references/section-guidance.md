# Arc42 Section Guidance

Detailed guidance on when and how to use each Arc42 section.

## Section 1: Business Vision, Goals, and Requirements

**When to use:**
- Start of every Arc42 document
- Establishing business context and motivation
- Defining quality goals and success criteria

**Key content:**
- **Requirements Overview**: What does the system do? (1-2 paragraphs)
- **Quality Goals**: Top 3-5 quality attributes (prioritized)
- **Stakeholders**: Who cares about this system and why?

**Best practices:**
- Focus on business value, not technical details
- Prioritize quality goals (can't have 10 "top priorities")
- Make quality goals measurable (e.g., "99.9% uptime" not "very reliable")
- Include user stories or use cases for context

**Skip if:**
- Never skip Section 1 - it's the foundation

---

## Section 2: Technical, Organizational & Regulatory Constraints

**When to use:**
- Documenting non-negotiable limitations
- Explaining "why we can't do X"
- Setting expectations for modernization scope

**Key content:**
- **Technical**: Legacy tech stack, existing integrations, data models
- **Organizational**: Team structure, budget, timeline
- **Regulatory**: Compliance requirements (GDPR, HIPAA, SOX)

**Best practices:**
- Only document real constraints, not preferences
- Explain impact: "Oracle license until 2026 → can't migrate DB yet"
- Distinguish temporary vs. permanent constraints

**Skip if:**
- Greenfield project with no constraints (rare)
- Can be brief in proof-of-concept documentation

---

## Section 3: Context & Scope

**When to use:**
- Showing system boundaries
- Documenting external interfaces
- Explaining integration points

**Key content:**
- **Business Context**: Users, external systems, data sources
- **Technical Context**: APIs, protocols, channels
- **System Context Diagram** (C4 Context level)

**Best practices:**
- Use C4 System Context diagram (Person, System, System_Ext)
- Clearly mark what's IN SCOPE vs. OUT OF SCOPE
- Document integration protocols (REST, SOAP, file-based)
- Show data flow direction

**Skip if:**
- Never skip - essential for understanding boundaries

---

## Section 4: Solution Strategy

**When to use:**
- Summarizing high-level architecture approach
- Explaining key design decisions
- Bridging business goals to technical choices

**Key content:**
- **Technology Decisions**: Why .NET vs. Java? Why PostgreSQL?
- **Architecture Patterns**: Microservices, event-driven, layered monolith
- **Quality Goal Mapping**: How solution achieves Section 1 goals

**Best practices:**
- 1-2 pages maximum (high-level summary)
- Link quality goals to solution: "Microservices enable scalability (Goal 1)"
- Justify non-obvious choices: "Chose Redis because..."
- Reference detailed decisions in Section 9 (ADRs)

**Skip if:**
- Simple systems with obvious solution strategy
- Proof of concept documentation

---

## Section 5: Building Block View

**When to use:**
- Documenting static structure and decomposition
- Showing components, modules, layers
- Explaining code organization

**Key content:**
- **Level 1: System Whitebox** (Container Diagram - C4 Container)
- **Level 2: Container Decomposition** (Component Diagram - C4 Component)
- **Level 3: Component Internals** (Optional - Class diagrams)

**Best practices:**
- Use C4 hierarchy: Context (Sec 3) → Container (Sec 5.1) → Component (Sec 5.2)
- Show dependencies between building blocks
- Use "whitebox" (show internals) and "blackbox" (hide internals) strategically
- Document important interfaces between blocks

**Skip if:**
- Never skip - core architecture documentation
- Can be lightweight for simple systems (1-2 diagrams)

---

## Section 6: Runtime View

**When to use:**
- Documenting dynamic behavior
- Showing key workflows and interactions
- Explaining sequence of operations

**Key content:**
- **Important Scenarios**: User workflows, data processing flows
- **Sequence Diagrams**: Show runtime interactions
- **State Machines**: If system has complex state

**Best practices:**
- Select 3-5 most important scenarios (not all possible flows)
- Use sequence diagrams or activity diagrams
- Show error handling for critical paths
- Document asynchronous patterns if used

**Skip if:**
- Trivial CRUD applications with obvious flows
- Can reference Section 5 if static structure is sufficient

---

## Section 7: Deployment View

**When to use:**
- Documenting infrastructure and hosting
- Showing physical/cloud topology
- Explaining deployment process

**Key content:**
- **Infrastructure**: Servers, containers, cloud services
- **Deployment Topology**: How components map to infrastructure
- **Deployment Diagram**: Physical or cloud architecture

**Best practices:**
- Show production environment (not dev/test unless significantly different)
- Document scaling approach (horizontal, vertical)
- Include load balancers, databases, message queues
- Show network zones (public, private, DMZ)

**Skip if:**
- Simple single-server deployment
- SaaS with no infrastructure control

---

## Section 8: Crosscutting Concepts

**When to use:**
- Documenting principles that apply across components
- Explaining domain patterns and rules
- Avoiding repetition in other sections

**Key content:**
- **Domain Concepts**: Business rules, domain model
- **Technical Concepts**: Logging, error handling, security
- **UX Patterns**: Common UI patterns
- **Data Standards**: Date formats, naming conventions

**Best practices:**
- Document once here, reference in other sections
- Focus on patterns used across multiple components
- Include code examples for technical concepts
- Explain "why" behind patterns

**Skip if:**
- Very simple system with no recurring patterns
- Can be brief if most concepts are component-specific

---

## Section 9: Architecture Decisions

**When to use:**
- Documenting significant decisions and trade-offs
- Explaining "why we chose X over Y"
- Creating decision log

**Key content:**
- **ADRs** (Architecture Decision Records)
- **Decision Log**: Date, context, options, outcome
- **Trade-offs**: What we gave up by choosing this

**Best practices:**
- Use MADR (Markdown Any Decision Records) format
- Document decisions when made (not retroactively)
- Include options considered and why rejected
- Link to Section 11 if decision introduced risks

**Skip if:**
- Greenfield with no significant decisions yet
- Can start minimal and grow over time

---

## Section 10: Quality Requirements

**When to use:**
- Defining measurable quality attributes
- Specifying SLAs and performance targets
- Creating quality scenarios

**Key content:**
- **Quality Scenarios**: Concrete examples with metrics
- **Quality Tree**: Decomposition of quality goals from Section 1
- **Metrics**: How to measure each quality attribute

**Best practices:**
- Make scenarios testable: "System handles 1000 req/sec with <100ms latency"
- Prioritize (not everything can be "critical")
- Use ISO 25010 quality model if needed
- Link back to Section 1 quality goals

**Skip if:**
- Proof of concept with no quality requirements
- Can be brief if quality goals in Section 1 are sufficient

---

## Section 11: Risks & Technical Debt

**When to use:**
- Documenting known limitations
- Tracking technical debt
- Identifying architectural risks

**Key content:**
- **Technical Risks**: Security vulnerabilities, scalability limits
- **Technical Debt**: Shortcuts taken, areas needing refactoring
- **Mitigation Plans**: How to address risks

**Best practices:**
- Be honest about limitations
- Prioritize risks (likelihood × impact)
- Include mitigation timeline/plan
- Reference Section 9 if decision caused debt

**Skip if:**
- Greenfield project with no debt yet
- Can start minimal and grow as issues are discovered

---

## Section 12: Glossary

**When to use:**
- Documenting domain terminology
- Defining acronyms and abbreviations
- Avoiding misunderstandings

**Key content:**
- **Domain Terms**: Business-specific vocabulary
- **Technical Terms**: Non-obvious technical concepts
- **Acronyms**: All abbreviations used in document

**Best practices:**
- Alphabetical order
- Link to first use in other sections
- Include both domain and technical terms
- Mark terms as: [Business], [Technical], [Organizational]

**Skip if:**
- System uses only common terminology
- Can be added incrementally as needed

---

## Section 13: Documentation Gaps (BMAD Extension)

**When to use:**
- Brownfield/legacy system analysis
- Incomplete information discovered
- Areas requiring stakeholder clarification

**Key content:**
- **Missing Information**: What we don't know
- **Assumptions Made**: What we assumed in absence of data
- **Tribal Knowledge**: Undocumented rules/patterns
- **Follow-up Required**: Who to contact for clarification

**Best practices:**
- Mark each gap with severity: [Critical], [Important], [Nice-to-have]
- Track resolution status
- Convert to proper documentation when clarified
- Include in stakeholder review

**Skip if:**
- Greenfield project with complete requirements
- Well-documented legacy system (rare)

---

## Appendix: Requirements Summary (99)

**When to use:**
- Comprehensive requirements traceability
- Linking architecture to business rules
- Full user story catalog

**Key content:**
- **Business Rules** (BR-XXX)
- **Functional Requirements** (FR-XXX)
- **Non-Functional Requirements** (NFR-XXX)
- **User Stories** (US-XXX)
- **Traceability Matrix**: Req → Component → Test

**Best practices:**
- Use consistent ID format
- Link requirements to Section 5 components
- Include acceptance criteria
- Reference test coverage

**Skip if:**
- Requirements already in external tool (JIRA, etc.)
- Brief project with few requirements

---

## Tailoring Guidelines

### Minimal Arc42 (Proof of Concept)
- Section 1: Goals (1 page)
- Section 3: Context (1 diagram)
- Section 5: Building Blocks (1-2 diagrams)

### Standard Arc42 (Production System)
- Sections 1-12 (full template)
- 10-30 pages total
- 5-10 diagrams

### Comprehensive Arc42 (Enterprise System)
- Sections 1-13 + Appendix 99
- 30-100 pages
- 15-30 diagrams
- Multiple ADRs in Section 9

### Legacy Modernization (AS-IS/TO-BE)
- Full Arc42 for both states
- Section 13 (Documentation Gaps) for AS-IS
- Section 4 (Solution Strategy) critical for TO-BE
- Delta analysis comparing AS-IS vs. TO-BE

---

## Section Priority by Project Type

### Microservices
- **Critical**: Sections 3 (context), 5 (building blocks), 7 (deployment)
- **Important**: Sections 6 (runtime), 8 (crosscutting), 9 (decisions)
- **Optional**: Section 13 (gaps)

### Monolithic Legacy
- **Critical**: Sections 1 (goals), 2 (constraints), 5 (building blocks), 13 (gaps)
- **Important**: Sections 9 (decisions), 11 (risks)
- **Optional**: Section 7 (deployment - if simple)

### Data-Intensive Systems
- **Critical**: Sections 5 (building blocks), 6 (runtime), 8 (crosscutting - data model)
- **Important**: Sections 10 (quality - performance), 11 (risks - data quality)
- **Optional**: Section 13 (gaps - data lineage)

### Cloud-Native
- **Critical**: Sections 3 (context), 5 (building blocks), 7 (deployment - cloud)
- **Important**: Sections 9 (decisions - cloud services), 10 (quality - SLAs)
- **Optional**: Section 2 (constraints - cloud platform lock-in)
