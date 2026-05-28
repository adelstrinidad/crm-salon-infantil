# C4 Model Guide

The C4 model is a lean graphical notation technique for modeling the architecture of software systems.

## Core Principles

1. **Hierarchical Abstraction**: Think of zooming in from a map of a country, to a map of a city, to a street map, to a building floor plan
2. **Different Audiences**: Each level serves different stakeholders and purposes
3. **Standard Notation**: Uses common shapes (boxes, lines) with clear semantics
4. **Tool Agnostic**: Can be drawn with any diagramming tool

## The 4 Levels (C4)

### Level 1: System Context

**Purpose**: Show how your system fits into the world around it

**Audience**: Everyone (business stakeholders, developers, operations)

**Elements**:
- **People**: Users and personas
- **Software Systems**: Your system and external systems it interacts with

**Questions It Answers**:
- Who uses the system?
- What other systems does it integrate with?
- What are the system boundaries?

**Best For**:
- Executive presentations
- Non-technical stakeholder communication
- System documentation overview
- Integration planning

---

### Level 2: Container

**Purpose**: Show the high-level shape of the software architecture and how responsibilities are distributed

**Audience**: Technical team (developers, architects, operations)

**Elements**:
- **Containers**: Separately deployable/runnable units (web app, mobile app, database, file system)
- NOT Docker containers - think "runtime environments"

**Questions It Answers**:
- What are the major technical building blocks?
- How do they communicate?
- What technologies are used?

**Best For**:
- Technical architecture discussions
- Deployment planning
- Technology selection decisions
- Security boundary analysis

**Examples of Containers**:
- Single-page web application (React, Angular)
- Server-side web application (ASP.NET MVC)
- Mobile app (iOS, Android)
- Desktop application
- Database (PostgreSQL, MongoDB)
- File system
- Message queue (RabbitMQ, Kafka)

---

### Level 3: Component

**Purpose**: Decompose each container to show major structural building blocks and their interactions

**Audience**: Developers and architects

**Elements**:
- **Components**: Groupings of related functionality behind a well-defined interface
- Services, controllers, repositories, business logic

**Questions It Answers**:
- How is the container structured internally?
- What are the key responsibilities?
- How do components collaborate?

**Best For**:
- Codebase orientation for new developers
- Identifying refactoring opportunities
- Component-level design discussions
- Understanding coupling and cohesion

**Examples of Components**:
- REST API controller
- Business logic service
- Data access repository
- Domain model/entities
- Integration adapter
- Background worker

---

### Level 4: Code

**Purpose**: Show how components are implemented as code

**Audience**: Developers

**Elements**:
- Classes, interfaces, objects, functions
- Standard UML class diagrams

**Questions It Answers**:
- How is this component implemented?
- What design patterns are used?
- What are the key classes?

**Best For**:
- Detailed design documentation
- Complex algorithm explanation
- Design pattern documentation
- Critical component deep-dives

**When to Skip**:
- Code is self-explanatory
- IDE provides better navigation (Go To Definition)
- Component is simple CRUD

---

## Key Relationships

### Standard Relationship Types

| Type | Meaning | Example |
|------|---------|---------|
| **Uses** | One-way dependency | Web app uses API |
| **Reads from / Writes to** | Data flow | API reads from database |
| **Sends to / Receives from** | Messaging | Service sends to queue |
| **Calls** | Synchronous invocation | Controller calls service |
| **Publishes / Subscribes** | Event-driven | Service publishes events |

### Relationship Best Practices

1. **Use Verbs**: "Uses", "Calls", "Reads from", NOT "depends on"
2. **Show Technology**: Include protocol/technology (e.g., "REST/JSON", "SQL/TCP")
3. **Directional**: Use arrows to show data flow direction
4. **Limit Count**: 5-9 relationships per diagram for clarity
5. **Group Related**: Use boundaries to reduce visual complexity

---

## Notation Conventions

### C4-PlantUML Specific

#### Element Naming
```plantuml
ElementType(alias, "Display Label", "Description")
```

**Example**:
```plantuml
System(payment_api, "Payment API", "Processes online payments")
```

#### Aliases
- **Use lowercase with underscores**: `payment_api`, `user_db`
- **Be consistent**: Same alias for same element across diagrams
- **Be descriptive**: `api` vs `payment_processing_api`

#### Labels
- **Concise**: 1-5 words
- **Descriptive**: "Payment Processing API" not "API"
- **Stakeholder Language**: Use business terms

#### Descriptions
- **One sentence**: What it does
- **Value-focused**: Why it exists
- **Optional**: Can omit for well-known systems

---

## Boundaries and Grouping

### System Boundary
Groups containers within a system:

```plantuml
System_Boundary(boundary_alias, "System Name") {
    Container(...)
    Container(...)
}
```

### Enterprise Boundary
Groups systems within an organization:

```plantuml
Enterprise_Boundary(enterprise, "Company Name") {
    System(...)
    System(...)
}
```

### Use Cases for Boundaries
- **Security Zones**: DMZ, internal, external
- **Organizational Units**: Teams, departments
- **Physical Locations**: Data centers, regions
- **Deployment Environments**: Cloud, on-premise

---

## Color and Styling

### Default Colors
- **Person**: Blue (#08427B)
- **Internal System/Container/Component**: Blue (#1168BD)
- **External System/Container**: Gray (#999999)

### Custom Styling
```plantuml
AddElementTag("critical", $bgColor="red", $fontColor="white")
System(sys, "Critical System", "Description", $tags="critical")
```

### When to Use Custom Colors
- **Priority**: Critical vs nice-to-have
- **Status**: Legacy vs modern
- **Security**: Public vs internal
- **Ownership**: Internal vs third-party

---

## Common Patterns

### Microservices Architecture
- **Context**: Show service mesh and API gateway
- **Container**: Each microservice as container
- **Component**: Internal structure of key services

### Monolithic Legacy System
- **Context**: Monolith + external integrations
- **Container**: Monolith broken down by deployment unit (web tier, app tier, data tier)
- **Component**: Internal modules and layers

### Event-Driven Architecture
- **Context**: Systems and event broker
- **Container**: Services, event broker, subscribers
- **Dynamic**: Event flow sequences

---

## Anti-Patterns to Avoid

1. **Too Much Detail**: Don't show every class in Container diagram
2. **Inconsistent Abstraction**: Don't mix database tables with systems
3. **Technology Logos**: Keep it simple, use text labels
4. **Crossed Lines**: Rearrange elements to minimize line crossings
5. **Missing Legend**: Always include `SHOW_LEGEND()`
6. **No Technology**: Always specify protocols and tech stack
7. **Ambiguous Relationships**: "Communicates with" vs "Calls REST API"

---

## Integration with Other Models

### C4 + Arc42
- **Arc42 Section 3**: Context diagram
- **Arc42 Section 5.1**: Container diagram
- **Arc42 Section 5.2**: Component diagram
- **Arc42 Section 6**: Dynamic/sequence diagrams

### C4 + UML
- **Context/Container/Component**: Structural (like UML component diagrams)
- **Code**: UML class diagrams
- **Dynamic**: UML sequence diagrams

### C4 + ADRs (Architecture Decision Records)
- Link diagrams to decisions
- "See ADR-003 for why we chose microservices"
- Update diagrams when ADRs change architecture

---

## Tools and Resources

### PlantUML
- **C4-PlantUML**: https://github.com/plantuml-stdlib/C4-PlantUML
- **PlantUML**: https://plantuml.com/

### Other Tools
- **Structurizr**: https://structurizr.com/ (official C4 tool)
- **draw.io**: https://app.diagrams.net/ (with C4 shapes)
- **Miro/Mural**: Collaborative whiteboarding

### Official C4 Resources
- **C4 Model**: https://c4model.com/
- **Examples**: https://c4model.com/#examples
- **FAQ**: https://c4model.com/#faq
