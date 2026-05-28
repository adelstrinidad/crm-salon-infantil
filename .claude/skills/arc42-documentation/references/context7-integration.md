# Context7 Integration for Arc42

This document provides detailed examples of using Context7 MCP to query official Arc42 documentation.

## Available Arc42 Libraries

| Library ID | Description | Code Snippets | Reputation |
|------------|-------------|---------------|------------|
| `/arc42/arc42-template` | Pre-structured template for comprehensive architecture documentation | 33 | High |
| `/websites/arc42` | Practical guide with 144 tips and 35 examples across 12 sections | 277 | High |
| `/arc42/quality.arc42.org-site` | Quality attributes and relationships visualization | 456 | High |

## Query Examples by Section

### Section 1: Business Vision & Goals

```javascript
// Understanding Section 1 purpose
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 1 Introduction and Goals purpose and content structure"
})

// Quality goals guidance
mcp__context7__query-docs({
  libraryId: "/arc42/quality.arc42.org-site",
  query: "Quality goals definition and prioritization in Arc42"
})
```

### Section 2: Constraints

```javascript
// Types of constraints
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 2 technical organizational and regulatory constraints"
})
```

### Section 3: Context & Scope

```javascript
// System context diagram guidance
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "How to document context diagrams in Arc42 Section 3"
})

// Business vs technical context
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Difference between business context and technical context in Arc42"
})
```

### Section 4: Solution Strategy

```javascript
// Strategy documentation
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 4 Solution Strategy content and structure"
})

// Technology decisions
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Documenting technology decisions and key design patterns in solution strategy"
})
```

### Section 5: Building Block View

```javascript
// Hierarchy levels (whitebox/blackbox)
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 5 Building Block View hierarchy levels and whitebox blackbox"
})

// Decomposition approach
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Best practices for building block decomposition in Arc42 Section 5"
})
```

### Section 6: Runtime View

```javascript
// Runtime scenarios
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 6 Runtime View scenarios and sequence diagrams"
})

// Important workflows
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "How to select which runtime scenarios to document in Arc42"
})
```

### Section 7: Deployment View

```javascript
// Infrastructure documentation
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 7 Deployment View infrastructure and topology"
})
```

### Section 8: Crosscutting Concepts

```javascript
// Domain concepts
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 8 Crosscutting Concepts domain and technical patterns"
})

// Security and logging concepts
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Documenting security and logging as crosscutting concerns in Arc42"
})
```

### Section 9: Architecture Decisions

```javascript
// ADR format
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 9 Architecture Decision Records format and structure"
})

// When to document decisions
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "What architecture decisions should be documented in Arc42 Section 9"
})
```

### Section 10: Quality Requirements

```javascript
// Quality scenarios
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 10 Quality Requirements scenarios and metrics"
})

// Quality attributes catalog
mcp__context7__query-docs({
  libraryId: "/arc42/quality.arc42.org-site",
  query: "ISO 25010 quality attributes and how to measure them"
})
```

### Section 11: Risks & Technical Debt

```javascript
// Risk documentation
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 11 technical risks and limitations"
})
```

### Section 12: Glossary

```javascript
// Glossary best practices
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 12 Glossary structure and when to include terms"
})
```

## General Queries

### Templates and Structure

```javascript
// Overall template structure
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Complete Arc42 template structure with all 12 sections"
})

// When to use Arc42
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "When to use Arc42 documentation template vs other architecture frameworks"
})
```

### Stakeholder Communication

```javascript
// Tailoring for audiences
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "How to tailor Arc42 documentation for different stakeholder audiences"
})
```

### Diagram Conventions

```javascript
// Recommended diagram types
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Recommended diagram types for each Arc42 section"
})

// C4 model integration
mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Using C4 model with Arc42 Building Block View"
})
```

## Query Strategy

1. **Start broad**: Query for section purpose and structure
2. **Then specific**: Query for specific aspects (diagrams, quality attributes, etc.)
3. **Cross-reference**: Use multiple libraries for comprehensive guidance
4. **Iterate**: Refine queries based on initial results

## Performance Tips

- **Cache responses**: Store Context7 responses for frequently used sections
- **Batch queries**: Group related questions in single session
- **Specific queries**: More specific queries return better results
- **Use templates library first**: `/arc42/arc42-template` is most concise

## Example Workflow

```javascript
// 1. Start with section purpose
const section5Purpose = await mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 5 Building Block View purpose"
})

// 2. Get structure guidance
const section5Structure = await mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 5 hierarchy levels and decomposition approach"
})

// 3. Get diagram examples
const section5Diagrams = await mcp__context7__query-docs({
  libraryId: "/websites/arc42",
  query: "Building block view diagram examples with C4 model"
})

// 4. Document your architecture using the guidance
```

## Troubleshooting

**Query returns limited results:**
- Try more specific keywords
- Use different library (templates vs websites vs quality)
- Break complex queries into smaller parts

**Query returns too much information:**
- Be more specific about what you need
- Focus on one aspect at a time
- Use `/arc42/arc42-template` for concise guidance

**Unclear guidance:**
- Cross-reference multiple libraries
- Ask for examples: "Arc42 Section X examples"
- Query for specific scenarios: "Arc42 Section X for microservices"
