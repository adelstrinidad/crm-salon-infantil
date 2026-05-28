# Context7 Arc42 Query Patterns for {PROJECT}

## Getting Started

**MCP Setup**: Context7 is already configured
**Library ID**: `/arc42/arc42-template` or `/websites/arc42`

## General Queries

### Get Complete Template Structure

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Complete Arc42 template structure with all 12 sections explained"
})
```

### Legacy System Documentation Guidance

```javascript
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Best practices for using Arc42 to document existing legacy system before modernization. Focus on AS-IS state documentation."
})
```

### Modernization Target Documentation

```javascript
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "How to use Arc42 to document target TO-BE architecture for system modernization and cloud migration"
})
```

---

## Section-Specific Queries

### Section 1: Introduction and Goals

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 1 Introduction and Goals template structure. How to document business context, quality goals, and stakeholders for legacy system."
})
```

### Section 2: Architecture Constraints

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 2 constraints - how to document technical constraints ({CURRENT_FRAMEWORK}, {CURRENT_DATABASE}), organizational constraints, and conventions for legacy system"
})
```

### Section 3: Context and Scope

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 3 System Scope and Context - documenting business context, technical context, and external interfaces"
})
```

### Section 4: Solution Strategy

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 4 Solution Strategy - technology decisions, top-level decomposition, and quality approaches"
})
```

### Section 5: Building Block View

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 5 Building Block View - hierarchical decomposition, black box and white box patterns, how to document component structure with C4 model integration"
})
```

### Section 6: Runtime View

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 6 Runtime View - documenting important use cases, scenarios, and interaction patterns"
})
```

### Section 7: Deployment View

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 7 Deployment View - infrastructure level, mapping building blocks to hardware, and technical infrastructure"
})
```

### Section 8: Crosscutting Concepts

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 8 Crosscutting Concepts - domain models, architecture patterns, and under-the-hood concepts"
})
```

### Section 9: Architecture Decisions

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 9 Architecture Decisions - documenting important decisions and their rationale using ADRs"
})
```

### Section 10: Quality Requirements

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 10 Quality Requirements - quality tree, quality scenarios, and concrete quality requirements"
})
```

### Section 11: Risks and Technical Debt

```javascript
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Arc42 Section 11 Technical Risks and Technical Debt - documenting known issues, God Objects, security vulnerabilities, performance bottlenecks in legacy system"
})
```

### Section 12: Glossary

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 12 Glossary - domain terminology and technical terms documentation"
})
```

---

## Project-Specific Queries

### Database-Heavy System

```javascript
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "How to document database-centric architecture in Arc42 where significant business logic resides in {DB_LANGUAGE} stored procedures and packages"
})
```

### Integration-Heavy System

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 3 Context and Scope - documenting multiple external integrations with different protocols (SOAP, REST, File)"
})
```

### {DATA_MODEL_TYPE} Data Model

```javascript
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "How to document {DATA_MODEL_TYPE} data model pattern in Arc42 building block view, including advantages and limitations"
})
```

### Modernization Migration Risks

```javascript
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Documenting migration risks in Arc42 Section 11 for TO-BE documentation - data migration, downtime, rollback strategy, dual-write complexity"
})
```

### Strangler Fig Pattern

```javascript
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Documenting Strangler Fig modernization pattern in Arc42 Section 4 Solution Strategy - incremental migration approach"
})
```

---

## AS-IS vs TO-BE Documentation Patterns

### For AS-IS (Legacy System)

**Focus areas**:
- What exists today (descriptive, not prescriptive)
- Current technical debt and issues
- Historical context and constraints
- Known limitations and workarounds

**Tone**: Observational, documenting reality

### For TO-BE (Target System)

**Focus areas**:
- Target architecture vision
- Modernization decisions (ADRs)
- Migration risks and mitigation
- Quality improvement targets

**Tone**: Prescriptive, defining the future

---

## Quick Reference

| Section | Primary Library | Key Topics |
|---------|----------------|------------|
| 1-4 | `/arc42/arc42-template` | Business context, constraints, strategy |
| 5-8 | `/arc42/arc42-template` | Technical structure, runtime, deployment |
| 9 | `/arc42/arc42-template` | Architecture decisions (ADRs) |
| 10 | `/arc42/arc42-template` | Quality scenarios |
| 11 | `/websites/arc42` | Technical debt, risks |
| 12 | `/arc42/arc42-template` | Terminology |

---

**Last Updated**: {LAST_UPDATED}
