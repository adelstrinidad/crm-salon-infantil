# Test Plan: {System Name}

<!--
Template: AS-IS Legacy System Test Plan
Purpose: Document existing test coverage and gaps for migration verification
Source: Step 07 Requirements Synthesis
Template Version: 1.0
-->

**System**: {System Name}
**Date**: {YYYY-MM-DD}
**Status**: Draft | In Review | Complete
**Analyst**: {AI Agent ID / Human Reviewer}

---

## 1. Overview

### 1.1 Purpose

This test plan documents:

1. **Existing test coverage** of the legacy system
2. **Test gaps** that represent migration risk
3. **Migration verification scenarios** for TO-BE validation
4. **Baseline behavior** for feature parity testing

### 1.2 Scope

| In Scope | Out of Scope |
|----------|--------------|
| Unit tests for business logic | Performance testing |
| Integration tests for external systems | Load testing |
| Acceptance tests for requirements | Security penetration testing |
| Business rule validation | Infrastructure testing |

### 1.3 Source Artifacts

| Artifact | Location | Content |
|----------|----------|---------|
| Functional Requirements | `artifacts/07-synthesis/requirements/FUNCTIONAL-REQUIREMENTS.md` | FR-XXX |
| Business Rules | `artifacts/07-synthesis/requirements/BUSINESS-RULES-CATALOG.md` | BR-XXX |
| User Stories | `artifacts/07-synthesis/requirements/USER-STORIES.md` | US-XXX |
| Component Analysis | `artifacts/05-analysis/SA-XX-*.md` | Code locations |

---

## 2. Test Case Inventory

### 2.1 Test Cases by Requirement

| Test ID | Requirement | Test Description | Test Type | Status | Location |
|---------|-------------|------------------|-----------|--------|----------|
| TC-001 | FR-01-001 | {Test description} | Unit | {Pass/Fail/Not Found} | {test file:line} |
| TC-002 | FR-01-001 | {Test description} | Integration | {Pass/Fail/Not Found} | {test file:line} |
| TC-003 | FR-01-002 | {Test description} | Unit | {Pass/Fail/Not Found} | {test file:line} |
| TC-004 | BR-001 | {Business rule validation} | Acceptance | {Pass/Fail/Not Found} | {test file:line} |

### 2.2 Test Cases by Component

#### Component: {Component Name 1}

**Source Analysis**: SA-XX

| Test ID | Test Description | Prerequisites | Expected Result | Actual Result |
|---------|------------------|---------------|-----------------|---------------|
| TC-XXX | {Description} | {Prerequisites} | {Expected} | {Actual/Not Tested} |

#### Component: {Component Name 2}

**Source Analysis**: SA-XX

| Test ID | Test Description | Prerequisites | Expected Result | Actual Result |
|---------|------------------|---------------|-----------------|---------------|
| TC-XXX | {Description} | {Prerequisites} | {Expected} | {Actual/Not Tested} |

### 2.3 Test Cases by Business Rule

| BR ID | Business Rule | Test Cases | Coverage Status |
|-------|---------------|------------|-----------------|
| BR-001 | {Rule description} | TC-001, TC-002 | Complete |
| BR-002 | {Rule description} | TC-003 | Partial |
| BR-003 | {Rule description} | - | **GAP** |

---

## 3. Test Data Requirements

### 3.1 Test Data Sets

| Data Set ID | Description | Location | Records | Sensitivity |
|-------------|-------------|----------|---------|-------------|
| TD-001 | {Data set name} | {Path/Database} | {n} | {Low/Medium/High} |
| TD-002 | {Data set name} | {Path/Database} | {n} | {Low/Medium/High} |

### 3.2 Test Data Characteristics

| Data Set | Valid Cases | Invalid Cases | Edge Cases | Notes |
|----------|-------------|---------------|------------|-------|
| TD-001 | {n} | {n} | {n} | {Notes on data} |

### 3.3 Test Data Privacy

| Sensitivity Level | Handling | Migration Notes |
|-------------------|----------|-----------------|
| Low | Use as-is | Can migrate directly |
| Medium | Anonymize | Replace PII before migration |
| High | Synthetic only | Create synthetic data for TO-BE |

---

## 4. Coverage Analysis

### 4.1 Coverage by Requirement Type

| Requirement Type | Total | Tested | Untested | Coverage % |
|------------------|-------|--------|----------|------------|
| Functional (FR-XXX) | {n} | {n} | {n} | {%} |
| Business Rules (BR-XXX) | {n} | {n} | {n} | {%} |
| Non-Functional (NFR-XXX) | {n} | {n} | {n} | {%} |
| **Total** | **{n}** | **{n}** | **{n}** | **{%}** |

### 4.2 Coverage by Component

| Component | Requirements | Test Cases | Coverage % | Risk Level |
|-----------|--------------|------------|------------|------------|
| {Component 1} | {n} | {n} | {%} | {High/Med/Low} |
| {Component 2} | {n} | {n} | {%} | {High/Med/Low} |

### 4.3 Coverage Gaps (Critical)

| Gap ID | Requirement | Gap Description | Risk Level | Migration Impact |
|--------|-------------|-----------------|------------|------------------|
| GAP-001 | FR-XX-001 | {No test coverage for X functionality} | High | Must create tests in TO-BE before go-live |
| GAP-002 | BR-XXX | {Business rule Y is untested} | High | Must verify behavior before migration |
| GAP-003 | FR-XX-005 | {Edge case Z not covered} | Medium | Should add test in TO-BE |

---

## 5. Test Environment

### 5.1 AS-IS Test Environment

| Environment | Purpose | Configuration | Data |
|-------------|---------|---------------|------|
| Local Dev | Unit tests | {Config details} | {Data source} |
| Integration | Integration tests | {Config details} | {Data source} |
| Staging | E2E tests | {Config details} | {Data source} |

### 5.2 Test Execution Notes

| Test Type | How to Run | Prerequisites | Duration |
|-----------|------------|---------------|----------|
| Unit Tests | `{command}` | {Prerequisites} | {Time} |
| Integration Tests | `{command}` | {Prerequisites} | {Time} |
| E2E Tests | `{command}` | {Prerequisites} | {Time} |

---

## 6. Migration Verification Scenarios

These scenarios MUST be executed against the TO-BE system to verify feature parity with AS-IS:

### 6.1 Critical Migration Scenarios

| Scenario ID | Description | AS-IS Baseline | TO-BE Expected | Priority |
|-------------|-------------|----------------|----------------|----------|
| MIG-001 | {Critical scenario 1} | {AS-IS behavior} | {Same as AS-IS} | Must |
| MIG-002 | {Critical scenario 2} | {AS-IS behavior} | {Same as AS-IS} | Must |

### 6.2 Detailed Migration Scenarios

---

#### MIG-001: {Scenario Title}

**Description**: {What this scenario validates}

**Business Rules Validated**: BR-001, BR-002

**Requirements Validated**: FR-01-001, FR-01-002

**Preconditions**:
1. {Precondition 1}
2. {Precondition 2}

**Steps**:
1. {Step 1 - Action}
2. {Step 2 - Action}
3. {Step 3 - Action}

**AS-IS Expected Result**:
- {Expected outcome 1}
- {Expected outcome 2}

**TO-BE Expected Result**:
- {Same as AS-IS / Modified behavior with rationale}

**Verification Method**:
- [ ] Manual testing
- [ ] Automated test: {test file}
- [ ] Data comparison

---

#### MIG-002: {Scenario Title}

**Description**: {What this scenario validates}

**Business Rules Validated**: BR-003

**Requirements Validated**: FR-02-001

**Preconditions**:
1. {Precondition}

**Steps**:
1. {Step}

**AS-IS Expected Result**:
- {Expected outcome}

**TO-BE Expected Result**:
- {Same as AS-IS}

**Verification Method**:
- [ ] Automated test

---

### 6.3 Migration Scenario Summary

| Scenario Type | Count | Priority Must | Priority Should |
|---------------|-------|---------------|-----------------|
| Data Migration | {n} | {n} | {n} |
| Functional Parity | {n} | {n} | {n} |
| Integration | {n} | {n} | {n} |
| Performance | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** |

---

## 7. Test Results Summary

### 7.1 Current Test Suite Status

| Test Type | Total | Passing | Failing | Skipped | Not Implemented |
|-----------|-------|---------|---------|---------|-----------------|
| Unit Tests | {n} | {n} | {n} | {n} | {n} |
| Integration Tests | {n} | {n} | {n} | {n} | {n} |
| E2E Tests | {n} | {n} | {n} | {n} | {n} |
| Acceptance Tests | {n} | {n} | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** | **{n}** | **{n}** |

### 7.2 Test Execution History

| Run Date | Environment | Pass Rate | Notable Issues |
|----------|-------------|-----------|----------------|
| {Date} | {Environment} | {%} | {Issues or "Clean"} |

---

## 8. Recommendations

### 8.1 For TO-BE Implementation

| Priority | Recommendation | Rationale |
|----------|----------------|-----------|
| Must | Create tests for GAP-001, GAP-002 | Critical business logic untested |
| Should | Increase coverage for {Component X} | High-risk component with low coverage |
| Could | Add performance tests | Current tests don't validate NFRs |

### 8.2 Test Strategy for Migration

1. **Before Migration**: Execute all AS-IS tests, document baseline results
2. **During Migration**: Run migration scenarios incrementally
3. **After Migration**: Execute full test suite, compare with baseline
4. **Acceptance**: All MIG-XXX scenarios passing = feature parity achieved

---

## 9. Appendix: Test Case Details

### 9.1 Unit Test Listing

| Test File | Test Count | Coverage | Component |
|-----------|------------|----------|-----------|
| {test file path} | {n} | {%} | {Component} |

### 9.2 Integration Test Listing

| Test File | Test Count | Systems Tested | Component |
|-----------|------------|----------------|-----------|
| {test file path} | {n} | {Systems} | {Component} |

---

## References

| Document | Location | Purpose |
|----------|----------|---------|
| Functional Requirements | `artifacts/07-synthesis/requirements/FUNCTIONAL-REQUIREMENTS.md` | FR-XXX source |
| Business Rules | `artifacts/07-synthesis/requirements/BUSINESS-RULES-CATALOG.md` | BR-XXX source |
| User Stories | `artifacts/07-synthesis/requirements/USER-STORIES.md` | Acceptance criteria |
| Traceability Matrix | `artifacts/07-synthesis/requirements/REQUIREMENTS-TRACEABILITY-MATRIX.md` | Full traceability |

---

*Last Updated: {Date}*
*Status: [ ] Draft / [ ] Review / [ ] Complete*
*Template Version: 1.0*
