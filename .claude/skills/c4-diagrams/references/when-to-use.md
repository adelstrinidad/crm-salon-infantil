# When to Use Each C4 Diagram Level

Quick decision guide for choosing the right C4 diagram level.

## Decision Tree

```
Start here
    |
    v
Is this for non-technical stakeholders (business, executives)?
    |
    ├─YES─> Use CONTEXT diagram (Level 1)
    |
    └─NO──> Are you documenting deployment architecture?
            |
            ├─YES─> Use CONTAINER diagram (Level 2)
            |
            └─NO──> Are you showing internal structure of a service/app?
                    |
                    ├─YES─> Use COMPONENT diagram (Level 3)
                    |
                    └─NO──> Are you documenting implementation details?
                            |
                            ├─YES─> Use CODE diagram (Level 4)
                            |
                            └─NO──> Are you showing a workflow or sequence?
                                    |
                                    └─YES─> Use SEQUENCE/DYNAMIC diagram
```

---

## Level 1: Context - Use When...

### ✅ Use Context Diagrams When:

1. **Stakeholder is non-technical**
   - Business owners, product managers, executives
   - Need to explain "what does this system do?"

2. **You need to show system boundaries**
   - What's in scope vs out of scope
   - External dependencies and integrations

3. **Integration planning**
   - What systems do we need to integrate with?
   - Who are the external stakeholders?

4. **Arc42 Section 3 (Context & Scope)**
   - Business context diagram
   - Technical context diagram

5. **Project kickoff or proposal**
   - High-level overview for new team members
   - System landscape visualization

### ❌ Don't Use Context When:

- You need to show internal technical details
- Audience is only developers
- You're explaining implementation specifics

### Example Questions Context Diagrams Answer:

- "Who uses this system?"
- "What external systems does it talk to?"
- "Where does data come from and go to?"

---

## Level 2: Container - Use When...

### ✅ Use Container Diagrams When:

1. **Documenting high-level technical architecture**
   - Web app, API, database separation
   - Microservices landscape

2. **Deployment planning**
   - What needs to be deployed?
   - How do deployable units communicate?

3. **Technology stack documentation**
   - What technologies are used?
   - Where does each technology fit?

4. **Arc42 Section 5.1 (Building Block View - Level 1)**
   - System whitebox decomposition
   - Major building blocks

5. **Security architecture**
   - Network boundaries (DMZ, internal, external)
   - Access control between containers

6. **Onboarding new developers**
   - "Here's how our system is structured at a high level"

### ❌ Don't Use Container When:

- Showing code-level details
- Audience doesn't care about technology
- System is too simple (single deployable unit)

### Example Questions Container Diagrams Answer:

- "What are the major building blocks?"
- "Where does authentication happen?"
- "How do the web app and mobile app both use the same API?"

---

## Level 3: Component - Use When...

### ✅ Use Component Diagrams When:

1. **Explaining internal structure of a container/service**
   - Controllers, services, repositories pattern
   - Package/namespace organization

2. **Onboarding developers to a specific service**
   - "Here's how the Payment Service is structured internally"

3. **Refactoring planning**
   - Identifying coupling between components
   - Planning component extraction

4. **Arc42 Section 5.2 (Building Block View - Level 2)**
   - Container whitebox decomposition
   - Component responsibilities

5. **Code review at architectural level**
   - "Does this new feature fit our component structure?"

6. **Testing strategy**
   - What components need unit tests vs integration tests?

### ❌ Don't Use Component When:

- Component is trivial (single class)
- IDE navigation is sufficient
- Changes too frequently to keep diagram updated

### Example Questions Component Diagrams Answer:

- "Where does validation logic live?"
- "Which component talks to the database?"
- "How are business rules separated from data access?"

---

## Level 4: Code - Use When...

### ✅ Use Code Diagrams When:

1. **Documenting complex design patterns**
   - Strategy pattern, Factory pattern implementations
   - How interfaces and implementations relate

2. **Critical algorithm visualization**
   - Complex calculation logic
   - State machine implementations

3. **Framework/library documentation**
   - How to use your framework
   - Extension points for plugins

4. **Onboarding to complex legacy code**
   - "Here are the key classes and how they interact"

### ❌ Don't Use Code When:

- Code is self-explanatory
- Changes frequently (diagram becomes stale)
- IDE provides better navigation (Go To Definition)
- Component is simple CRUD

### Example Questions Code Diagrams Answer:

- "How does the caching decorator work?"
- "What classes implement the PaymentProcessor interface?"
- "How does the object graph get constructed?"

---

## Dynamic/Sequence - Use When...

### ✅ Use Sequence Diagrams When:

1. **Showing runtime behavior**
   - Order of operations
   - Asynchronous workflows

2. **Documenting user flows**
   - "What happens when user clicks 'Submit'?"
   - End-to-end transaction flow

3. **Arc42 Section 6 (Runtime View)**
   - Key scenarios
   - Important workflows

4. **Troubleshooting**
   - Understanding where errors occur
   - Performance bottleneck identification

5. **Integration testing scenarios**
   - What calls happen in what order?

### ❌ Don't Use Sequence When:

- Static structure is more important than runtime flow
- Workflow is obvious (simple CRUD)
- Too many branches (makes diagram unreadable)

### Example Questions Sequence Diagrams Answer:

- "What happens during user login?"
- "How does payment processing work step-by-step?"
- "Where does the error occur in this workflow?"

---

## Combining Multiple Levels

### Full Arc42 Documentation

For comprehensive architecture documentation:

1. **Context** (Level 1) - Everyone reads this
2. **Container** (Level 2) - Technical team reads this
3. **Component** (Level 3) - For 2-3 key containers only
4. **Sequence** (Dynamic) - For 3-5 key workflows
5. **Code** (Level 4) - For critical components only (optional)

### Microservices Project

1. **Context**: Show all microservices and external systems
2. **Container**: Drill into ONE microservice per diagram
3. **Sequence**: Show key inter-service workflows

### Legacy Modernization (AS-IS)

1. **Context**: Current system boundaries
2. **Container**: Existing deployment units
3. **Component**: For modules being rewritten
4. **Sequence**: For workflows being redesigned

### Greenfield Project

1. Start with **Context** (what we're building)
2. Design **Container** architecture
3. Design **Component** structure for key containers
4. Add **Sequence** for complex workflows

---

## Quick Reference Table

| Diagram | Audience | When | Arc42 Section |
|---------|----------|------|---------------|
| Context | Everyone | System boundaries, integrations | Section 3 |
| Container | Tech team | Deployment, tech stack | Section 5.1 |
| Component | Developers | Internal structure | Section 5.2 |
| Code | Developers | Implementation details | Optional |
| Sequence | Developers | Runtime workflows | Section 6 |

---

## Red Flags (When NOT to Diagram)

1. **Over-Documentation**: Don't diagram everything, focus on:
   - Complex parts
   - Frequently asked questions
   - Onboarding needs

2. **Maintenance Burden**: Diagrams become stale if:
   - Code changes frequently
   - No one owns diagram updates
   - Diagram is too detailed

3. **Better Alternatives**: Sometimes better to use:
   - Code comments for small details
   - README for simple explanations
   - Live system tracing for runtime behavior

---

## Rule of Thumb

- **1 Context diagram** per system (always)
- **1-3 Container diagrams** per system (group by domain/bounded context)
- **0-5 Component diagrams** (only for complex containers)
- **3-5 Sequence diagrams** (key workflows only)
- **0-2 Code diagrams** (rarely needed, only for complex patterns)

**Total diagrams for typical project**: 5-10 diagrams maximum
