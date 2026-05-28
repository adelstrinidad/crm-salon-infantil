# Documentation Gap Analysis Template

**Purpose**: Compare code reality vs. business documentation to identify gaps
**Output Location**: `artifacts/03-remediation/DOCUMENTATION-GAP-ANALYSIS.md`
**Used In**: Step 04 (Findings & Gap Analysis)

---

## Gap Categories

### 1. Documentation Ahead of Reality
**Features documented but not implemented (or removed)**

| Feature | Documented | Code Reality | Impact | Evidence |
|---------|-----------|--------------|--------|----------|
| {Feature} | "System shall..." | Not found in code | {High/Med/Low} | {File search results} |

---

### 2. Reality Ahead of Documentation
**Features implemented but not documented**

| Feature | Code Location | Description | When Added | Should Document? |
|---------|---------------|-------------|------------|------------------|
| {Feature} | {file:line} | {what it does} | {git log date} | {Yes/No/Maybe} |

---

### 3. Documentation Divergence
**Features exist in both but implementation differs from spec**

| Feature | Documented Behavior | Actual Behavior | Reason | Critical? |
|---------|-------------------|-----------------|--------|-----------|
| Address validation | "Must validate Finnish postal codes" | Validates all Nordic codes | Requirement expanded | No |
| EAV pattern | "For flexibility" | Performance bottleneck | Original intent valid but... | Yes |

---

### 4. Intentional Workarounds
**Code that looks "wrong" but is actually correct per documentation**

| Code Pattern | Appears As | Actually Is | Documentation Source |
|--------------|-----------|-------------|----------------------|
| Complex SQL in C# | Code smell | Documented workaround for Oracle limitation | Confluence: "Database Limitations" |
| Duplicate validation | DRY violation | Required by {EXTERNAL_SYSTEM_2} integration spec | Jira: {PROJECT}-456 |

---

### 5. Undocumented Technical Debt
**Issues in code with NO explanation in documentation**

| Issue | Code Location | Severity | Needs Research |
|-------|---------------|----------|----------------|
| {Issue} | {file:line} | {High/Med/Low} | {Interview with: Person} |

---

## Gap Statistics

| Gap Type | Count | High Priority | Needs Stakeholder Input |
|----------|-------|---------------|-------------------------|
| Documentation Ahead | {n} | {n} | {n} |
| Reality Ahead | {n} | {n} | {n} |
| Divergence | {n} | {n} | {n} |
| Intentional Workarounds | {n} | {n} | {n} |
| Undocumented Debt | {n} | {n} | {n} |

---

## Recommendations for Step 06 Interviews

**Questions for Principal Engineer**:
1. {Question about undocumented feature}
2. {Question about divergence}
3. {Question about technical debt}

**Questions for Product Owner**:
1. {Question about missing documented feature}
2. {Question about requirement changes}

**Questions for DBA**:
1. {Question about database workarounds}

---

*Template Version: 1.0*
