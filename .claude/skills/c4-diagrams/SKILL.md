---
name: c4-diagrams
description: Create C4 model architecture diagrams using PlantUML. Use when creating system context diagrams, container diagrams, component diagrams, or documenting architecture visualization.
---

# C4 Model Diagrams

This skill provides PlantUML templates for creating C4 model architecture diagrams.

## When to Use

Auto-triggered when discussing:
- C4 model or C4 diagrams
- System context diagrams
- Container diagrams
- Component diagrams
- Architecture visualization
- Software architecture diagrams

## C4 Model Overview

The C4 model provides a hierarchical way to visualize software architecture at different levels of abstraction:

| Level | Name | Purpose | Audience |
|-------|------|---------|----------|
| 1 | Context | System boundaries and external dependencies | Everyone (business + technical) |
| 2 | Container | Applications and data stores within the system | Technical team + architects |
| 3 | Component | Components within containers | Developers + architects |
| 4 | Code | Class diagrams and implementation details | Developers |

## Using C4-PlantUML

All templates use the PlantUML built-in C4 standard library:

```plantuml
!include <C4/C4_{Level}>
```

### Available Includes:
- `<C4/C4_Context>` - Level 1: System Context
- `<C4/C4_Container>` - Level 2: Containers
- `<C4/C4_Component>` - Level 3: Components
- `<C4/C4_Deployment>` - Infrastructure/deployment
- `<C4/C4_Dynamic>` - Sequence/runtime diagrams

## Quick Start

1. **Choose the right level**: Start with Context, drill down as needed
2. **Copy template**: Use templates from `templates/` directory
3. **Replace placeholders**: Fill in `{System Name}`, `{Description}`, etc.
4. **Add relationships**: Use `Rel()` to show interactions
5. **Export**: Use PlantUML to generate PNG/SVG

## Template Examples

See `templates/` directory for:
- **c4-context.puml** - System Context (Level 1)
- **c4-container.puml** - Container View (Level 2)
- **c4-component.puml** - Component View (Level 3)
- **c4-code.puml** - Code/Class View (Level 4)
- **c4-sequence.puml** - Dynamic/Sequence View

## Common Elements

### People
```plantuml
Person(alias, "Label", "Description")
Person_Ext(alias, "External User", "Description")
```

### Systems
```plantuml
System(alias, "System Name", "Description")
System_Ext(alias, "External System", "Description")
System_Boundary(alias, "System Boundary") {
  ' Nested elements
}
```

### Containers (Level 2)
```plantuml
Container(alias, "Container Name", "Technology", "Description")
ContainerDb(alias, "Database", "Technology", "Description")
ContainerQueue(alias, "Message Queue", "Technology", "Description")
```

### Components (Level 3)
```plantuml
Component(alias, "Component Name", "Technology", "Description")
ComponentDb(alias, "Data Store", "Technology", "Description")
```

### Relationships
```plantuml
Rel(from, to, "Label", "Technology/Protocol")
Rel_R(from, to, "Label")  ' Right
Rel_D(from, to, "Label")  ' Down
Rel_L(from, to, "Label")  ' Left
Rel_U(from, to, "Label")  ' Up

BiRel(from, to, "Label")  ' Bidirectional
```

## Best Practices

1. **Start High-Level**: Begin with Context diagram, drill down only where needed
2. **Limit Elements**: 5-9 elements per diagram (cognitive load principle)
3. **Clear Labels**: Use action verbs for relationships ("Uses", "Reads from", "Sends to")
4. **Show Technology**: Include protocols/tech stack in relationship labels
5. **Use Boundaries**: Group related elements with boundaries
6. **Add Legend**: Always include `SHOW_LEGEND()` at the end
7. **Consistent Naming**: Use same aliases across diagrams for the same elements

## Choosing the Right Level

### Use Context (Level 1) when:
- Showing system boundaries to non-technical stakeholders
- Documenting external integrations
- Creating Arc42 Section 3 (Context & Scope)
- Everyone needs to understand the big picture

### Use Container (Level 2) when:
- Showing high-level technical architecture
- Documenting microservices or modular architecture
- Creating Arc42 Section 5.1 (Building Block View - Level 1)
- Technical team needs to understand system structure

### Use Component (Level 3) when:
- Showing internal structure of a container/service
- Documenting package/namespace organization
- Creating Arc42 Section 5.2 (Building Block View - Level 2)
- Developers need to understand component interactions

### Use Code (Level 4) when:
- Documenting critical algorithms or patterns
- Showing class relationships
- Creating detailed design documentation
- Developers need implementation details

## Color Coding

C4-PlantUML uses standard colors:
- **Person**: Blue
- **System**: Blue (internal), Gray (external)
- **Container**: Blue (internal), Gray (external)
- **Component**: Blue (internal), Gray (external)

Override with custom colors:
```plantuml
System(system, "My System", "Description", $tags="custom")
AddElementTag("custom", $bgColor="green", $fontColor="white")
```

## Exporting Diagrams

### Using PlantUML CLI:
```bash
# Install PlantUML
brew install plantuml  # macOS
# OR download from https://plantuml.com/

# Generate PNG
plantuml diagram.puml

# Generate SVG (vector)
plantuml -tsvg diagram.puml
```

### Using Online Editor:
Visit https://www.plantuml.com/plantuml/uml/

### Using VS Code:
Install "PlantUML" extension by jebbs

## Integration with Arc42

C4 diagrams map directly to Arc42 sections:

| Arc42 Section | C4 Level | Diagram Name |
|---------------|----------|--------------|
| Section 3: Context & Scope | Level 1 | System Context |
| Section 5.1: Building Blocks (Whitebox) | Level 2 | Container |
| Section 5.2: Building Blocks (Blackbox) | Level 3 | Component |
| Section 6: Runtime View | Dynamic | Sequence |
| Section 7: Deployment View | Deployment | Infrastructure |

## Examples

See `examples/` directory for:
- **microservices-c4.md** - C4 diagrams for microservices architecture
- **monolith-c4.md** - C4 diagrams for monolithic systems
- **integration-c4.md** - C4 diagrams for system integrations

## References

- **c4-model-guide.md** - Detailed C4 model explanation
- **plantuml-syntax.md** - PlantUML C4 syntax reference
- **when-to-use.md** - Choosing the right diagram level
- **Official C4 Model**: https://c4model.com/
- **C4-PlantUML GitHub**: https://github.com/plantuml-stdlib/C4-PlantUML

## Notes

- Templates use `{placeholders}` for reusability
- All templates include `SHOW_LEGEND()` by default
- Diagrams are technology-agnostic unless you specify technology labels
- For project-specific diagrams, see `{ANALYSIS_ROOT}/diagrams/` (if using legacy analysis workflow, where `{ANALYSIS_ROOT}` is user-specified)
