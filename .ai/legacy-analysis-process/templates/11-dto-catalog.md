# Template 11: DTO Catalog

**Purpose**: Document Data Transfer Objects with traceability to entities and business rules
**Used By**: Component analysis, API documentation, data mapping
**Step**: Step 05, Step 07

---

## DTO Catalog

### Summary

| Metric | Count |
|--------|-------|
| Total DTOs | {count} |
| Request DTOs | {count} |
| Response DTOs | {count} |
| Shared DTOs | {count} |

---

## DTO Registry

| DTO ID | Name | Type | Source Entity | Business Rules | Source Location |
|--------|------|------|---------------|----------------|-----------------|
| DTO-001 | {DtoName} | Request/Response/Shared | ENT-nnn | BR-nnn, BR-nnn | {file:line} |
| DTO-002 | {DtoName} | Request/Response/Shared | ENT-nnn | BR-nnn | {file:line} |

---

## DTO Details

### DTO-001: {DtoName}

**Type**: Request | Response | Shared
**Purpose**: {Brief description of what this DTO is used for}
**Source Entity**: [ENT-nnn](link-to-entity)
**Source Location**: `{file:line}`

#### Fields

| Field | Type | Required | Validation | Business Rule | Description |
|-------|------|----------|------------|---------------|-------------|
| id | long | Yes | > 0 | - | Primary identifier |
| name | string | Yes | max 100 chars | BR-001 | Display name |
| amount | decimal | Yes | >= 0, precision(15,2) | BR-002, BR-003 | Transaction amount |
| status | enum | Yes | [PENDING, APPROVED, REJECTED] | BR-004 | Current status |
| createdDate | datetime | No | - | - | Creation timestamp |

#### Business Rules Applied

| Rule ID | Rule Name | Field(s) Affected | Validation Logic |
|---------|-----------|-------------------|------------------|
| BR-001 | Name Format | name | Must not contain special characters |
| BR-002 | Amount Positive | amount | Must be >= 0 |
| BR-003 | Amount Precision | amount | Max 2 decimal places |
| BR-004 | Status Transition | status | PENDING → APPROVED or REJECTED only |

#### Usage

| Used In | Operation | Direction |
|---------|-----------|-----------|
| ClaimsController.submitClaim() | POST /api/claims | Request |
| ClaimsService.createClaim() | Internal | Input |

---

### DTO-002: {DtoName}

**Type**: Request | Response | Shared
**Purpose**: {Brief description}
**Source Entity**: [ENT-nnn](link-to-entity)
**Source Location**: `{file:line}`

#### Fields

| Field | Type | Required | Validation | Business Rule | Description |
|-------|------|----------|------------|---------------|-------------|
| {field} | {type} | {Yes/No} | {constraints} | {BR-nnn} | {description} |

#### Business Rules Applied

| Rule ID | Rule Name | Field(s) Affected | Validation Logic |
|---------|-----------|-------------------|------------------|
| {BR-nnn} | {name} | {fields} | {logic} |

---

## Traceability Matrix

### Entity to DTO Mapping

| Entity ID | Entity Name | DTOs |
|-----------|-------------|------|
| ENT-001 | {EntityName} | DTO-001, DTO-002 |
| ENT-002 | {EntityName} | DTO-003 |

### Business Rule to DTO Mapping

| Rule ID | Rule Name | DTOs Affected | Fields |
|---------|-----------|---------------|--------|
| BR-001 | {RuleName} | DTO-001, DTO-005 | name, displayName |
| BR-002 | {RuleName} | DTO-001, DTO-003 | amount |

---

## Validation Summary

### Common Validation Patterns

| Pattern | Business Rules | DTOs Using |
|---------|----------------|------------|
| Amount validation | BR-002, BR-003 | DTO-001, DTO-003, DTO-007 |
| Status transitions | BR-004 | DTO-001, DTO-002 |
| Date range validation | BR-010 | DTO-005, DTO-008 |

### Cross-Field Validations

| Validation | Business Rule | DTO | Fields | Logic |
|------------|---------------|-----|--------|-------|
| Date range | BR-011 | DTO-005 | startDate, endDate | endDate > startDate |
| Amount total | BR-012 | DTO-007 | lineItems[], total | sum(lineItems.amount) == total |

---

## Notes

- All DTOs should have corresponding BR-nnn references for validation rules
- Field-level validations trace to specific business rules
- Cross-field validations documented separately
- Computed fields reference the BR-nnn containing the calculation formula

---

*Template Version: 1.0*
*Created: 2026-01-25*
