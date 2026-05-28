# Requirements Traceability Matrix Template

**Usage**: Map requirements to code with COMPLETE traceability.
**Version**: 2.4 (2026-02-08)

---

## CRITICAL: Complete Traceability Required

> **RTM must show 100% traceability.** Every LBR links to FR, every FR links to source.
>
> If links are missing, **the process is incomplete** - return to extraction and complete the work.

---

```markdown
# Requirements Traceability Matrix: {Module}

**Date**: {YYYY-MM-DD}
**Module**: {Module Name}
**Status**: [DRAFT]

---

## 1. Traceability Matrix

| LBR | FR | UC | INT | DTO | Source File:Line |
|-----|-----|-----|-----|-----|------------------|
| LBR-001 | FR-002 | UC-003 | INT-002 | DTO-003 | Validator.java:42 |
| LBR-002 | FR-005 | UC-003 | INT-002 | DTO-003 | Validator.java:58 |
| LBR-003 | FR-008 | UC-005 | INT-004 | DTO-005 | Controller.java:156 |
| - | FR-001 | UC-001 | INT-001 | DTO-001 | Controller.java:89 |

**Notes:**
- `-` in LBR column = FR has no associated business rule (display/navigation only)
- Every row must have Source File:Line reference
- All LBRs from LBR-{module}.md must appear in this matrix

---

## 2. Cross-Reference Index

### 2.1 LBR → FR
| LBR | FR(s) |
|-----|-------|
| LBR-001 | FR-002, FR-003 |
| LBR-002 | FR-005 |

### 2.2 UC → LBR
| UC | LBR(s) Applied |
|----|----------------|
| UC-001 | - |
| UC-003 | LBR-001, LBR-002 |

### 2.3 INT → DTO
| INT | Request DTO | Response DTO |
|-----|-------------|--------------|
| INT-001 | - | DTO-001 |
| INT-002 | DTO-003 | DTO-004 |

---

## 3. Change History

| Date | Change | Author |
|------|--------|--------|
| {YYYY-MM-DD} | Initial RTM | {Name} |

---

**Status**: [DRAFT] - Pending human verification
```

---

## Process Completion Check

Before finalizing RTM, verify:
- [ ] Every LBR has at least one FR
- [ ] Every FR has source file:line reference
- [ ] Every UC references its LBRs
- [ ] Every INT has DTO mapping (or explicit "none")

If any check fails, return to extraction and complete the work.

---

*Template Version: 2.4 | Updated: 2026-02-08*
