# Step 07: Data Model Planning

**Objective**: Design target database schema and migration strategy

---

## Inputs

- `artifacts/05-analysis/database/SA-14-prod-tables.md` (AS-IS schema)
- `arch-to-be/specifications/backend/AR-BE-*.md` (from Step 06)
- `arch-to-be/05-building-block-view.md`

---

## Activities

### 1. Schema Design

- Transform Oracle PL/SQL to target database (PostgreSQL/SQL Server)
- Normalize tables
- Define entity relationships
- Add new tables for new features

### 2. Data Dictionary

- Document all tables and columns
- Define data types
- Document constraints and indexes
- Define foreign keys

### 3. Migration Strategy

- Data transformation rules
- Data cleansing requirements
- Mapping AS-IS to TO-BE
- Incremental migration approach

### 4. Data Access Patterns

- Repository patterns
- ORM configuration
- Caching strategy
- Read/write splitting

---

## Outputs

`arch-to-be/implementation/DATA-MODEL.md`

Contents:
- Entity relationship diagrams (ERD)
- Table definitions
- Migration scripts outline
- Data access patterns

---

## Success Criteria

- [ ] All entities defined
- [ ] Relationships documented
- [ ] Migration strategy defined
- [ ] Data dictionary complete
- [ ] ERD created

---

**Estimated Duration**: 60-90 minutes
**Next Step**: [Step 08: Test Planning](08-test-planning.md)
