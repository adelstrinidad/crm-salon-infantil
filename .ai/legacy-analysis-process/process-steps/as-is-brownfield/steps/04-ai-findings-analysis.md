# Step 04: Findings and Documentation Gap Analysis

**Duration**: 2-3 hours
**Prerequisites**:
- Step 03 static analysis completed
- Step 01 documentation inventory completed
**Output**:
- Categorized code findings
- Documentation gap analysis
- Reality vs. Intent comparison

---

## Overview

This step performs TWO critical analyses:

1. **Code Findings Analysis** (existing): Analyze static analysis results
2. **Documentation Gap Analysis** (NEW): Compare code reality to business documentation

### Why Both Are Needed

| Analysis Type | Purpose | Prevents |
|---------------|---------|----------|
| Code Findings | Identify technical issues | Missing bugs, security flaws |
| Documentation Gaps | Understand business context | Misidentifying intentional design as "bugs" |

**Example**: A complex SQL procedure may look like "bad code" but is actually
a documented workaround for a vendor database limitation. Gap analysis reveals this.

---

**Original Overview (Code Analysis)**:

This step uses LLMs to analyze issues discovered by static analysis tools in Step 03. The key principle is: **feed structured diagnostic output to the LLM**, not the entire codebase.

**Critical Strategy**: Do NOT upload the entire codebase to the LLM. Extract specific file/line snippets mentioned in defect reports and construct focused prompts.

### Record Step Start Time

**PowerShell**:
```powershell
# Record this step's start time for timing tracker
$Step04StartTime = Get-Date
```

**Bash/sh**:
```bash
# Record this step's start time for timing tracker
STEP_04_START=$(date -Iseconds)
```

---

## 3.1 Workflow Selection

Choose the appropriate workflow based on the type of issue:

| Issue Type | Workflow | Input | Output |
|------------|----------|-------|--------|
| Code Quality (refactoring) | Workflow A | ZPA/Roslyn issues | Refactored code |
| Security Vulnerabilities | Workflow B | SCS/Fixinator issues | Patched code |
| Business Logic Extraction | Workflow C | Dependency graphs | Documentation |
| Test Generation | Workflow D | Code coverage gaps | Unit tests |

---

## 3.2 Workflow A: Modernization Refactoring

### Scenario
Converting legacy code patterns to modern syntax based on static analyzer findings.

### Step-by-Step Process

**1. Parse the scan results**

```powershell
# Load ZPA results
$scanDir = (Get-ChildItem -Path "{ANALYSIS_ROOT}/work/03-metrics" -Directory | Sort-Object Name -Descending | Select-Object -First 1).FullName
$zpaResults = Get-Content "$scanDir/plsql-prod-results.json" -Raw | ConvertFrom-Json

# Filter for specific rule (e.g., AvoidSelectStar)
$selectStarIssues = $zpaResults.issues | Where-Object { $_.ruleId -eq "AvoidSelectStar" }

Write-Host "Found $($selectStarIssues.Count) SELECT * issues to fix"
```

**2. Extract code context for each issue**

```powershell
foreach ($issue in $selectStarIssues) {
    $filePath = $issue.primaryLocation.filePath
    $lineNumber = $issue.primaryLocation.textRange.startLine

    # Read surrounding context (5 lines before and after)
    $content = Get-Content $filePath
    $startLine = [Math]::Max(0, $lineNumber - 6)
    $endLine = [Math]::Min($content.Count - 1, $lineNumber + 4)

    $context = $content[$startLine..$endLine] -join "`n"

    Write-Host "=== Issue at $filePath`:$lineNumber ==="
    Write-Host $context
}
```

**3. Construct focused LLM prompt**

```markdown
## Prompt Template for SELECT * Refactoring

The static analyzer (ZPA) identified a 'SELECT *' violation in the following PL/SQL code.

### Issue Details
- **File**: {filePath}
- **Line**: {lineNumber}
- **Rule**: AvoidSelectStar
- **Message**: Avoid SELECT * in production code

### Code Snippet (Lines {startLine}-{endLine})
```sql
{codeContext}
```

### Table Definition
```sql
{tableDDL}
```

### Task
Refactor this query to explicitly list only the columns that are actually used downstream.
Analyze the procedure to determine which columns are accessed and include only those.

### Output Format
Provide the refactored SQL code block only, no explanations.
```

**4. Apply fix and validate**

```powershell
# After LLM generates fix, save to file
$fixedCode = @"
-- AI-generated fix for AvoidSelectStar at line $lineNumber
$llmOutput
"@

# Write to temporary file for review
$tempFile = "temp-fixes/$($issue.ruleId)-$(Split-Path $filePath -Leaf)"
$fixedCode | Out-File $tempFile -Encoding UTF8

# Re-run ZPA on the fixed file to validate
zpa-cli --sources $tempFile --output-file "temp-validation.json" --output-format sq-generic-issue-import
```

---

## 3.3 Workflow B: Security Patching

### Scenario
Fixing security vulnerabilities identified by Security Code Scan or Fixinator.

### For C# SQL Injection (SCS0001)

**1. Parse SARIF results**

```powershell
$sarifResults = Get-Content "$scanDir/security-scan-results.sarif" -Raw | ConvertFrom-Json
$sqlInjectionIssues = $sarifResults.runs[0].results | Where-Object { $_.ruleId -eq "SCS0001" }

Write-Host "Found $($sqlInjectionIssues.Count) SQL Injection vulnerabilities"
```

**2. Construct security-focused prompt**

```markdown
## Prompt Template for SQL Injection Fix

Security Code Scan detected a **HIGH SEVERITY** SQL Injection vulnerability.

### Issue Details
- **File**: {filePath}
- **Line**: {lineNumber}
- **Rule**: SCS0001 - SQL Injection
- **Severity**: High

### Vulnerable Code
```csharp
{codeContext}
```

### Task
Rewrite this code to prevent SQL Injection by:
1. Using parameterized queries (SqlParameter)
2. Or using an ORM with LINQ if Entity Framework is available
3. Never concatenating user input into SQL strings

### Security Requirements
- All user-supplied values must be parameterized
- Use command.Parameters.AddWithValue() or SqlParameter objects
- Validate input types where possible

### Output Format
Provide the secure code replacement only.
```

### For ColdFusion SQL Injection

```markdown
## Prompt Template for CFML SQL Injection Fix

Fixinator detected a **High Confidence** SQL Injection vulnerability.

### Issue Details
- **File**: {filePath}
- **Line**: {lineNumber}
- **Rule**: SQLInjection

### Vulnerable Code
```cfml
{codeContext}
```

### Task
Rewrite this code using <cfqueryparam> for ALL dynamic values.

### Output Format
```cfml
<cfquery name="queryName" datasource="#datasource#">
    SELECT columns
    FROM table
    WHERE column = <cfqueryparam value="#variable#" cfsqltype="cf_sql_varchar">
</cfquery>
```
```

---

## 3.4 Workflow C: Business Logic Extraction

### Scenario
Documenting complex legacy code for knowledge preservation.

### For "God Class" Analysis

**1. Generate dependency data**

```powershell
# Use Visual Expert or manual analysis to identify high-coupling classes
$complexClasses = @(
    @{ Name = "OrderProcessor"; LOC = 2500; Dependencies = 45 },
    @{ Name = "VrkImportService"; LOC = 1800; Dependencies = 32 },
    @{ Name = "AddressValidator"; LOC = 1200; Dependencies = 28 }
)
```

**2. Construct documentation prompt**

```markdown
## Prompt Template for Business Logic Documentation

Analyze the following high-complexity class and extract business logic documentation.

### Class Information
- **Name**: {className}
- **File**: {filePath}
- **Lines of Code**: {loc}
- **Dependency Count**: {dependencyCount}

### Source Code
```csharp
{fullClassCode}
```

### Task
Create comprehensive documentation covering:

1. **Purpose**: What business problem does this class solve?
2. **Core Responsibilities**: List the main functions/methods and their purposes
3. **Business Rules**: Extract any validation logic, calculations, or decision logic as numbered rules
4. **Data Flow**: Describe what data comes in, what transformations happen, what goes out
5. **External Dependencies**: List all external systems, databases, or services this class interacts with
6. **Complexity Hotspots**: Identify the most complex methods that need attention
7. **Modernization Recommendations**: Suggest how this class could be refactored

### Output Format
Markdown documentation with the sections listed above.
```

---

## 3.5 Workflow D: Test Generation

### Scenario
Creating unit tests for legacy code with low test coverage.

**1. Identify test gaps**

```powershell
# From csharp-inventory.json, find classes without corresponding test files
$inventory = Get-Content "{ANALYSIS_ROOT}/01-metrics/csharp-inventory.json" -Raw | ConvertFrom-Json

$sourceFiles = $inventory.files.Keys | Where-Object { $_ -match "\.cs$" -and $_ -notmatch "[Tt]est" }
$testFiles = $inventory.files.Keys | Where-Object { $_ -match "[Tt]est.*\.cs$" }

foreach ($source in $sourceFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($source)
    $hasTest = $testFiles | Where-Object { $_ -match "$baseName" }

    if (-not $hasTest) {
        Write-Host "No tests for: $source"
    }
}
```

**2. Construct test generation prompt**

```markdown
## Prompt Template for Unit Test Generation

Generate xUnit tests for the following class.

### Class Under Test
- **File**: {filePath}
- **Framework**: xUnit + Moq (if mocking needed)
- **Naming Convention**: MethodName_Scenario_ExpectedResult

### Source Code
```csharp
{classCode}
```

### Task
Create comprehensive unit tests covering:
1. **Happy path** - Normal operation with valid inputs
2. **Edge cases** - Boundary values, empty collections, null inputs
3. **Error cases** - Exception handling, validation failures
4. **Mocking** - Mock any external dependencies (database, services)

### Output Format
Complete xUnit test class with all test methods.
Include necessary using statements and test setup/teardown.
```

---

## 3.6 Batch Processing Script

For processing multiple issues automatically:

```powershell
# Save as: scripts/process-issues-batch.ps1

param(
    [string]$ScanResultsDir,
    [string]$OutputDir = "{ANALYSIS_ROOT}/remediation-queue",
    [int]$MaxIssues = 50
)

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Load scan results
$zpaResults = Get-Content "$ScanResultsDir/plsql-prod-results.json" -Raw | ConvertFrom-Json

# Group issues by rule
$issuesByRule = $zpaResults.issues | Group-Object -Property ruleId

Write-Host "=== Issue Summary ===" -ForegroundColor Cyan
foreach ($group in $issuesByRule) {
    Write-Host "$($group.Name): $($group.Count) issues"
}

# Export issues for LLM processing
$processQueue = @()
$count = 0

foreach ($issue in $zpaResults.issues) {
    if ($count -ge $MaxIssues) { break }

    $filePath = $issue.primaryLocation.filePath
    $lineNumber = $issue.primaryLocation.textRange.startLine

    # Read code context
    if (Test-Path $filePath) {
        $content = Get-Content $filePath
        $startLine = [Math]::Max(0, $lineNumber - 6)
        $endLine = [Math]::Min($content.Count - 1, $lineNumber + 10)
        $context = $content[$startLine..$endLine] -join "`n"

        $processQueue += @{
            id = "ISSUE-$count"
            ruleId = $issue.ruleId
            severity = $issue.severity
            file = $filePath
            line = $lineNumber
            message = $issue.primaryLocation.message
            context = $context
            status = "pending"
        }

        $count++
    }
}

# Export queue
$processQueue | ConvertTo-Json -Depth 5 | Out-File "$OutputDir/remediation-queue.json" -Encoding UTF8
Write-Host "`nExported $count issues to: $OutputDir/remediation-queue.json" -ForegroundColor Green
```

---

## 3.7 LLM Integration Patterns

### Pattern 1: One-Shot Fix

```python
# Python example for LLM API integration
import json
import anthropic

def generate_fix(issue):
    client = anthropic.Anthropic()

    prompt = f"""
    Fix this {issue['ruleId']} issue at {issue['file']}:{issue['line']}

    Code:
    ```
    {issue['context']}
    ```

    Provide only the fixed code, no explanations.
    """

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text
```

### Pattern 2: Iterative Refinement

```python
def generate_and_validate_fix(issue, max_attempts=3):
    for attempt in range(max_attempts):
        fix = generate_fix(issue)

        # Save fix to temp file
        with open("temp_fix.sql", "w") as f:
            f.write(fix)

        # Re-run scanner
        result = subprocess.run(
            ["zpa-cli", "--sources", "temp_fix.sql", "--output-file", "validation.json"],
            capture_output=True
        )

        # Check if issue is resolved
        with open("validation.json") as f:
            validation = json.load(f)

        if len(validation.get("issues", [])) == 0:
            return fix, True

        # If still has issues, retry with feedback
        issue['previous_attempt'] = fix
        issue['remaining_issues'] = validation['issues']

    return fix, False
```

---

## 3.8 Validation Requirements

Before accepting any AI-generated fix:

### Automated Validation
- [ ] Re-run the original static analyzer on the fixed code
- [ ] Verify the specific rule violation is resolved
- [ ] Check no new issues were introduced
- [ ] Run existing unit tests (if available)

### Human Review Triggers
Fixes requiring mandatory human review:
- Security vulnerabilities (any severity)
- Changes to authentication/authorization code
- Database schema modifications
- API contract changes
- Changes affecting >50 lines of code

---

## 3.9 Output Tracking

Track all remediation activities:

```powershell
# Create remediation log
$logEntry = @{
    timestamp = (Get-Date).ToString("o")
    issueId = $issue.id
    ruleId = $issue.ruleId
    file = $issue.file
    line = $issue.line
    status = "fixed" # or "rejected", "pending-review"
    fixApplied = $true
    validationPassed = $true
    humanReviewRequired = $false
    notes = "AI-generated fix validated by re-scan"
}

# Append to log file
$logEntry | ConvertTo-Json -Compress | Add-Content "{ANALYSIS_ROOT}/remediation-log.jsonl"
```

---

## 4.3 Documentation Analysis and Gap Identification

### Input Files
- [DOCUMENTATION-INVENTORY.md](../../../work/01-reconnaissance/DOCUMENTATION-INVENTORY.md)
- Business documents in `docs/business-context/`
- Confluence/Jira content (via MCP)
- SARIF scan results in [work/03-metrics/](../../../work/03-metrics/) (code findings)

### Activities

#### 4.3.1 Business Documentation Review

**Prompt for AI Assistant**:

```
Review the following business documentation and extract:
1. Stated business requirements
2. Architecture design decisions with rationale
3. Known limitations or workarounds documented
4. Integration requirements and constraints
5. Performance requirements
6. Security requirements

Create a summary in work/04-findings/BUSINESS-DOCUMENTATION-SUMMARY.md
```

**Use MCP to Query Confluence**:
```javascript
// Search for architecture decisions
mcp__atlassian__search_confluence({
  query: "architecture decision OR design rationale OR why we chose",
  space: "PROJECT_KEY",
  maxResults: 50
})

// Search for known limitations
mcp__atlassian__search_confluence({
  query: "limitation OR workaround OR technical debt",
  space: "PROJECT_KEY",
  maxResults: 50
})
```

**Use MCP to Query Jira**:
```javascript
// Find requirements and user stories
mcp__atlassian__search_jira({
  jql: "project = {PROJECT} AND type IN (Epic, Story) AND status = Done",
  maxResults: 100
})

// Find documented bugs/issues
mcp__atlassian__search_jira({
  jql: "project = {PROJECT} AND type = Bug AND resolution = 'Won't Fix'",
  maxResults: 50
})
```

**Output**: `work/04-findings/BUSINESS-DOCUMENTATION-SUMMARY.md`

Template:
```markdown
# Business Documentation Summary

## Documented Requirements

### Functional Requirements
1. {Requirement from docs} - Source: {Confluence page / Jira ticket}
2. {Requirement from docs} - Source: {link}

### Non-Functional Requirements
1. {NFR} - Source: {link}
2. {NFR} - Source: {link}

## Documented Design Decisions

### ADR-style Decisions
| Decision | Rationale | Date | Source |
|----------|-----------|------|--------|
| Use EAV pattern | Flexibility needed | 2019-03 | {Confluence link} |
| Oracle over PostgreSQL | Existing license | 2018-11 | {Jira {PROJECT}-123} |

### Known Workarounds
| Issue | Workaround | Why Not Fixed | Source |
|-------|------------|---------------|--------|
| {Issue} | {Workaround} | {Reason} | {link} |

## Documented Limitations
1. {Limitation} - Source: {link}
2. {Limitation} - Source: {link}

## Integration Specifications
| System | Protocol | Requirements | Source |
|--------|----------|--------------|--------|
| {EXTERNAL_SYSTEM_1} | SOAP/XML | {requirements} | {link} |
| {EXTERNAL_SYSTEM_2} | REST/JSON | {requirements} | {link} |
```

#### 4.3.2 Gap Analysis: Documentation vs. Code Reality

**Prompt for AI Assistant**:

```
Compare the business documentation summary with the code analysis findings.

For each documented requirement/decision:
1. Does the code implement it as documented?
2. Has the code evolved beyond the documentation?
3. Are there undocumented features in the code?
4. Are documented features missing from code?

Create a gap analysis in work/04-findings/DOCUMENTATION-GAP-ANALYSIS.md
```

**Output**: `work/04-findings/DOCUMENTATION-GAP-ANALYSIS.md`

Template:
```markdown
# Documentation Gap Analysis

## Gap Categories

### 1. Documentation Ahead of Reality
**Features documented but not implemented (or removed)**

| Feature | Documented | Code Reality | Impact | Evidence |
|---------|-----------|--------------|--------|----------|
| {Feature} | "System shall..." | Not found in code | {High/Med/Low} | {File search results} |

### 2. Reality Ahead of Documentation
**Features implemented but not documented**

| Feature | Code Location | Description | When Added | Should Document? |
|---------|---------------|-------------|------------|------------------|
| {Feature} | {file:line} | {what it does} | {git log date} | {Yes/No/Maybe} |

### 3. Documentation Divergence
**Features exist in both but implementation differs from spec**

| Feature | Documented Behavior | Actual Behavior | Reason | Critical? |
|---------|-------------------|-----------------|--------|-----------|
| Address validation | "Must validate Finnish postal codes" | Validates all Nordic codes | Requirement expanded | No |
| EAV pattern | "For flexibility" | Performance bottleneck | Original intent valid but... | Yes |

### 4. Intentional Workarounds
**Code that looks "wrong" but is actually correct per documentation**

| Code Pattern | Appears As | Actually Is | Documentation Source |
|--------------|-----------|-------------|----------------------|
| Complex SQL in C# | Code smell | Documented workaround for Oracle limitation | Confluence: "Database Limitations" |
| Duplicate validation | DRY violation | Required by {EXTERNAL_SYSTEM_2} integration spec | Jira: {PROJECT}-456 |

### 5. Undocumented Technical Debt
**Issues in code with NO explanation in documentation**

| Issue | Code Location | Severity | Needs Research |
|-------|---------------|----------|----------------|
| {Issue} | {file:line} | {High/Med/Low} | {Interview with: Person} |

## Gap Statistics

| Gap Type | Count | High Priority | Needs Stakeholder Input |
|----------|-------|---------------|-------------------------|
| Documentation Ahead | {n} | {n} | {n} |
| Reality Ahead | {n} | {n} | {n} |
| Divergence | {n} | {n} | {n} |
| Intentional Workarounds | {n} | {n} | {n} |
| Undocumented Debt | {n} | {n} | {n} |

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
```

#### 4.3.3 Findings Categorization with Documentation Context

Update existing categorization to include documentation context:

### Enhanced Categorization

| Category | Definition | Action |
|----------|-----------|--------|
| **Bug** | Code defect, NOT documented as workaround | Fix in TO-BE |
| **Documented Workaround** | Code issue but documented as intentional | Keep or find better solution |
| **Missing Feature** | Documented but not implemented | Decide: implement or update docs |
| **Undocumented Feature** | Implemented but not in docs | Document in AS-IS |
| **Design Evolution** | Code evolved beyond original design | Update AS-IS docs with current reality |

### Example Categorization

| Finding | Type | Documentation Says | Code Does | Category | Action |
|---------|------|-------------------|-----------|----------|--------|
| SQL Injection risk | Security | Nothing | Vulnerable | Bug | Fix |
| Complex EAV queries | Performance | "Flexible data model" | Slow | Documented Workaround | Consider alternatives |
| Nordic postal validation | Scope creep | "Finnish only" | All Nordic countries | Design Evolution | Update docs |

---

## Step Output: Findings Summary

**IMPORTANT**: After completing this step, document your findings in the following format. Focus on BUSINESS LOGIC and REMEDIATION outcomes.

### Required Output Template

```markdown
# Step 03 Findings: AI-Assisted Analysis & Remediation

## Status: [COMPLETE | PARTIAL | BLOCKED]

## Remediation Summary

| Category | Issues Processed | Fixed | Rejected | Pending Review |
|----------|-----------------|-------|----------|----------------|
| Code Quality | {n} | {n} | {n} | {n} |
| Security | {n} | {n} | {n} | {n} |
| Deprecated APIs | {n} | {n} | {n} | {n} |

## Business Logic Extracted

### Core Domain Entities

| Entity | Purpose | Key Attributes | Relationships |
|--------|---------|----------------|---------------|
| {e.g., Address} | {description} | {list} | {related entities} |

### Business Rules Documented

| Rule ID | Description | Source Location | Complexity |
|---------|-------------|-----------------|------------|
| BR-001 | {rule description} | {file:line or SP name} | {High/Med/Low} |

### Calculation Formulas Extracted

| Formula ID | Purpose | Expression | C# Equivalent |
|------------|---------|------------|---------------|
| CALC-001 | {e.g., Distance} | {formula} | {method signature} |

### Data Flow Patterns

| Flow Name | Source | Transformation | Destination |
|-----------|--------|----------------|-------------|
| {e.g., {EXTERNAL_SYSTEM_1} Import} | {{EXTERNAL_SYSTEM_1} files} | {processing} | {{PROJECT} database} |

## Code Quality Improvements

| Improvement | Files Changed | Before | After |
|-------------|---------------|--------|-------|
| Complexity Reduction | {n} | {avg complexity} | {new avg} |
| Dead Code Removed | {n} | {LOC removed} | N/A |
| Null Safety Added | {n} | {null issues} | {fixed} |

## Security Fixes Applied

| Vulnerability | Fix Applied | Files | Verification |
|---------------|-------------|-------|--------------|
| {e.g., SSL bypass} | {fix description} | {files} | {re-scan passed} |

## Documentation Generated

| Document | Purpose | Location |
|----------|---------|----------|
| SA-XX | {analysis topic} | {path} |
| BR-Document | Business rules | {path} |

## Blocked Items (Require Human Decision)

| Item | Reason | Question for Human |
|------|--------|-------------------|
| {issue} | {why blocked} | {decision needed} |

## Recommendations for Next Steps

1. {recommendation based on findings}
2. {recommendation based on findings}
```

### Example Output ({PROJECT} Project)

```markdown
# Step 03 Findings: AI-Assisted Analysis & Remediation

## Status: COMPLETE

## Remediation Summary

| Category | Issues Processed | Fixed | Rejected | Pending Review |
|----------|-----------------|-------|----------|----------------|
| Code Quality | 342 | 287 | 12 | 43 |
| Security | 12 | 8 | 0 | 4 |
| Deprecated APIs | 28 | 15 | 5 | 8 |

## Business Logic Extracted

### Core Domain Entities

| Entity | Purpose | Key Attributes | Relationships |
|--------|---------|----------------|---------------|
| Address | Physical address | street, number, postal_code, municipality | Building, Apartment |
| Building | Structure containing apartments | building_id, coordinates, status | Address, Apartment[] |
| Apartment | Individual unit | apartment_id, floor, letter | Building, Address |

### Business Rules Documented

| Rule ID | Description | Source Location | Complexity |
|---------|-------------|-----------------|------------|
| BR-F001 | Address must have valid postal code | CHECK_BUILDING_ADDRESS:145 | Medium |
| BR-F002 | Building status transitions | MAINTENANCE_SERVICES:312 | High |
| BR-F003 | {EXTERNAL_SYSTEM_1} data validation before import | {EXT1}_EXAMPLE:89 | High |

### Calculation Formulas Extracted

| Formula ID | Purpose | Expression | C# Equivalent |
|------------|---------|------------|---------------|
| CALC-001 | Distance between addresses | âˆš((x2-x1)Â² + (y2-y1)Â²) | CalculateDistance() |
| CALC-002 | Coordinate conversion | WGS84 â†’ ETRS89-TM35FIN | ConvertCoordinates() |

### Data Flow Patterns

| Flow Name | Source | Transformation | Destination |
|-----------|--------|----------------|-------------|
| {EXTERNAL_SYSTEM_1} Import | {EXTERNAL_SYSTEM_1} ZIP files | Parse â†’ Validate â†’ Batch | {PROJECT} Oracle DB |
| Address Sync | {PROJECT} DB | Transform â†’ Publish | AWS SNS Topic |
| {EXTERNAL_SYSTEM_2} Export | {PROJECT} DB | Format â†’ Dump | {EXTERNAL_SYSTEM_2} system |

## Code Quality Improvements

| Improvement | Files Changed | Before | After |
|-------------|---------------|--------|-------|
| Complexity Reduction | 5 | Avg 25 | Avg 12 |
| Dead Code Removed | 12 | 450 LOC | N/A |
| Null Safety Added | 32 | 32 issues | 0 |

## Security Fixes Applied

| Vulnerability | Fix Applied | Files | Verification |
|---------------|-------------|-------|--------------|
| SSL bypass | Removed ValidateServerCertificate override | Global.asax | Re-scan passed |
| Hardcoded config | Moved to appsettings | SNSTopicLibrary | Manual review |

## Documentation Generated

| Document | Purpose | Location |
|----------|---------|----------|
| SA-01 to SA-07 | C# Layer Analysis | 02-csharp-analysis/ |
| SA-11 to SA-16 | Database Analysis | 03-database-analysis/ |
| SA-21 to SA-23 | Integration Analysis | 04-integration-analysis/ |

## Blocked Items (Require Human Decision)

| Item | Reason | Question for Human |
|------|--------|-------------------|
| WSE 3.0 removal | Breaking change to {EXTERNAL_SYSTEM_4} integration | Can we update {EXTERNAL_SYSTEM_4} client simultaneously? |
| EF6 â†’ EF Core | Major refactor | Prioritize in Phase 1 or Phase 2? |

## Recommendations for Next Steps

1. Schedule {EXTERNAL_SYSTEM_4} integration modernization (WSE 3.0 removal)
2. Run Deep Dive on COORDINATE_CONVERSION for exact transformation parameters
3. Prioritize CHECK_BUILDING_ADDRESS refactoring (1,473 LOC god function)
```

---

## 4.4 Component Risk Assessment and Analysis Strategy

### Purpose

Before proceeding to Step 05 (Component Analysis), evaluate each component for risks that may require special handling during AI analysis. This prevents inappropriate AI processing of sensitive code (e.g., proprietary algorithms, PII handling, security-critical code).

### Input Files

- [component-inventory.json](../../../work/01-reconnaissance/component-inventory.json) - List of all components
- SARIF files in [work/03-metrics/](../../../work/03-metrics/) - Static analysis findings
- [BUSINESS-DOCUMENTATION-SUMMARY.md](../../../work/04-findings/BUSINESS-DOCUMENTATION-SUMMARY.md) - Business context
- [DOCUMENTATION-GAP-ANALYSIS.md](../../../work/04-findings/DOCUMENTATION-GAP-ANALYSIS.md) - Gap analysis

### Risk Categories

Assess each component for the following risk types:

| Risk Type | Definition | Examples | Impact on Analysis |
|-----------|-----------|----------|-------------------|
| **IPR Risk** | Proprietary algorithms, licensed code, patent-sensitive logic | Encryption libraries, vendor-specific code, competitive advantage algorithms | May require manual review instead of AI |
| **Privacy Risk** | PII handling, GDPR-sensitive, data subject rights | Customer data processing, consent management, data retention | Requires privacy-aware analysis approach |
| **Security Risk** | Authentication, authorization, cryptography, secrets management | Login handlers, API keys, certificate validation, JWT generation | Requires security-focused review |

### Activities

#### 4.4.1 Generate Component Risk Assessment

**Prompt for AI Assistant**:

```markdown
Analyze static analysis findings and business documentation to assess risk level for each component.

For each component in the component inventory:

1. **IPR Risk Assessment**:
   - Check for proprietary algorithm patterns
   - Look for licensing issues in code analysis
   - Identify competitive advantage code
   - Result: NONE | LOW | MEDIUM | HIGH

2. **Privacy Risk Assessment**:
   - Check for PII data handling (names, addresses, SSN, email)
   - Look for GDPR-related functionality (consent, deletion, export)
   - Identify data subject rights implementation
   - Result: NONE | LOW | MEDIUM | HIGH

3. **Security Risk Assessment**:
   - Check static analysis for security findings in this component
   - Look for authentication/authorization code
   - Identify cryptography or secrets handling
   - Result: NONE | LOW | MEDIUM | HIGH

4. **Recommend Analysis Strategy**:
   - Default: "Full AI Analysis" (if all risks are NONE or LOW)
   - Alternative: "Manual Review" (if any risk is HIGH)
   - Alternative: "Exclude" (if out of scope or third-party)

Create a component risk assessment document.
```

#### 4.4.2 Risk Assessment Document Template

**Output**: `work/04-findings/COMPONENT-RISK-ASSESSMENT.md`

```markdown
# Component Risk Assessment for AI Analysis

**Purpose**: Determine appropriate analysis strategy for each component based on IPR, privacy, and security risks.

**Status**: â³ PENDING HUMAN APPROVAL

---

## Risk Assessment Summary

| Risk Level | Count | Action |
|------------|-------|--------|
| HIGH | {n} | Manual Review Recommended |
| MEDIUM | {n} | Full AI with Caution |
| LOW | {n} | Full AI Analysis (Default) |
| NONE | {n} | Full AI Analysis (Default) |

**Default Strategy**: Full AI Analysis (unless HIGH risk identified)

---

## Component Risk Matrix

| Component | IPR Risk | Privacy Risk | Security Risk | Overall Risk | Recommended Strategy | Rationale |
|-----------|----------|--------------|---------------|--------------|---------------------|-----------|
| {PROJECT}Services | NONE | LOW | LOW | LOW | âœ… Full AI Analysis | Standard API, no sensitive logic |
| {PROJECT}Services | NONE | MEDIUM | MEDIUM | MEDIUM | âœ… Full AI Analysis | Handles addresses (semi-public data) |
| VrkImportService | NONE | HIGH | MEDIUM | HIGH | ðŸ” Manual Review | Processes PII from {EXTERNAL_SYSTEM_1} (names, SSN) |
| {PROJECT}Database | NONE | LOW | HIGH | HIGH | ðŸ” Manual Review | Contains connection strings, auth logic |
| CIBControls | LOW | NONE | NONE | LOW | âœ… Full AI Analysis | UI controls, no sensitive data |
| {PROJECT}Sync | NONE | LOW | HIGH | HIGH | ðŸ” Manual Review | AWS SNS credentials, security-critical |
| AddressValidator | LOW | MEDIUM | LOW | MEDIUM | âœ… Full AI Analysis | Business rules, minimal risk |

**Legend**:
- âœ… **Full AI Analysis**: Default strategy. AI can analyze code, extract business logic, generate documentation.
- ðŸ” **Manual Review**: Human review required. AI analysis disabled or limited to non-sensitive sections.
- âŒ **Exclude**: Out of scope or third-party component. Skip analysis.

---

## Detailed Risk Assessment

### Component: VrkImportService

**Overall Risk**: HIGH

**IPR Risk**: NONE
- No proprietary algorithms detected
- Standard data import patterns

**Privacy Risk**: HIGH
- **Evidence**: Processes PII from {EXTERNAL_SYSTEM_1} (Finnish Population Register)
  - Personal names (ETUNIMET, SUKUNIMI)
  - Social Security Numbers (HETU)
  - Addresses (home addresses)
- **GDPR Impact**: Data subject rights apply
- **Recommendation**: Manual review for PII handling patterns

**Security Risk**: MEDIUM
- **Evidence**: File-based import with validation
  - File parsing vulnerabilities (CWE-91)
  - No SQL injection risks (uses parameterized queries)
- **Recommendation**: Review file parsing security

**Recommended Strategy**: ðŸ” Manual Review
**Rationale**: HIGH privacy risk due to PII processing. Human should review before AI analysis to ensure GDPR compliance awareness.

**Alternative Strategy Available**: âœ… Full AI Analysis with Privacy Constraints
- If approved: AI can analyze code but must not export PII examples
- Sanitize any sample data before AI processing

---

### Component: {PROJECT}Database

**Overall Risk**: HIGH

**IPR Risk**: NONE
- Standard ADO.NET patterns
- No proprietary database logic

**Privacy Risk**: LOW
- Database access layer, minimal PII exposure
- No data retention logic

**Security Risk**: HIGH
- **Evidence**: Security-critical code detected
  - Connection string management (hardcoded in some files)
  - SQL command construction
  - Authentication to Oracle database
- **Static Analysis Findings**:
  - 3 instances of hardcoded connection strings
  - 2 SQL injection risks (SCS0001)
- **Recommendation**: Security-focused review required

**Recommended Strategy**: ðŸ” Manual Review
**Rationale**: HIGH security risk. Must ensure connection strings and credentials are not exposed during AI analysis.

**Alternative Strategy Available**: âœ… Full AI Analysis with Security Sanitization
- If approved: Sanitize connection strings and credentials before AI processing
- AI can analyze query patterns and business logic

---

### Component: {PROJECT}Services

**Overall Risk**: LOW

**IPR Risk**: NONE
**Privacy Risk**: LOW (addresses are semi-public data)
**Security Risk**: LOW (no critical findings)

**Recommended Strategy**: âœ… Full AI Analysis (Default)
**Rationale**: Standard API component with no high-risk findings. Safe for AI analysis.

---

## Human Decision Required

**INSTRUCTIONS FOR HUMAN REVIEWER**:

For each component marked with ðŸ” Manual Review or âŒ Exclude:
1. Review the detailed risk assessment above
2. Decide whether to:
   - âœ… **Accept Recommendation**: Use the recommended strategy
   - ðŸ”„ **Override to Full AI**: Approve AI analysis despite risks (e.g., with sanitization)
   - âŒ **Exclude**: Skip this component entirely

**Components Requiring Decision**:

| Component | Recommended | Human Decision | Justification |
|-----------|-------------|----------------|---------------|
| VrkImportService | ðŸ” Manual Review | â³ PENDING | {Human fills this} |
| {PROJECT}Database | ðŸ” Manual Review | â³ PENDING | {Human fills this} |
| {PROJECT}Sync | ðŸ” Manual Review | â³ PENDING | {Human fills this} |

**Default for All Other Components**: âœ… Full AI Analysis

---

## Approval Section

**Status**: â³ AWAITING HUMAN APPROVAL

**Approver**: {name}
**Date**: {date}
**Decision**: {APPROVED | REVISE | STOP}

**Notes**:
{Human notes here}

---

## Next Step After Approval

Once approved, proceed to Step 05 (Component Analysis) using the selected strategies:
- Components marked âœ… Full AI Analysis: Proceed with AI-assisted deep dive
- Components marked ðŸ” Manual Review: Use human-led analysis approach
- Components marked âŒ Exclude: Skip in Step 05

```

#### 4.4.3 Example Risk Assessment ({PROJECT} Project)

For the {PROJECT} project, the assessment might look like:

```markdown
# Component Risk Assessment - {PROJECT} Project

## Risk Assessment Summary

| Risk Level | Count | Action |
|------------|-------|--------|
| HIGH | 3 | Manual Review Recommended |
| MEDIUM | 4 | Full AI with Caution |
| LOW | 12 | Full AI Analysis (Default) |
| NONE | 8 | Full AI Analysis (Default) |

## Components Requiring Manual Review (HIGH Risk)

1. **VrkImportService** - HIGH Privacy (processes PII: names, SSN, addresses)
2. **{PROJECT}Database** - HIGH Security (connection strings, auth)
3. **{PROJECT}Sync** - HIGH Security (AWS credentials, security-critical)

## Components Safe for AI Analysis (LOW/MEDIUM Risk)

All other components approved for Full AI Analysis.

## Human Decisions

| Component | AI Recommendation | Human Decision | Justification |
|-----------|------------------|----------------|---------------|
| VrkImportService | ðŸ” Manual Review | ðŸ”„ Full AI with Sanitization | PII will be sanitized before analysis |
| {PROJECT}Database | ðŸ” Manual Review | âœ… Manual Review | Security-critical, manual only |
| {PROJECT}Sync | ðŸ” Manual Review | âœ… Manual Review | AWS credentials, manual only |

**Approved by**: John Smith (Principal Engineer)
**Date**: 2026-01-07
**Status**: âœ… APPROVED - Proceed to Step 05 with selected strategies
```

---

## 4.5 Business Impact Grounding

### Purpose

Cross-reference technical findings with business context collected in Step 01 to prioritize by **business impact**, not just technical severity. This ensures modernization efforts focus on high-usage, high-value components.

### Prerequisites

- Step 01 Section 1.1 complete (business context collected or documented as unavailable)
- Technical findings identified from Step 03, Step 04, or static analysis

### Why Business Impact Matters

**Problem**: Technical severity alone cannot prioritize modernization efforts.

**Example**:
- **Finding**: "Low test coverage in Legacy Report Generator"
- **Technical Severity**: HIGH (missing tests = risk)
- **Usage Data**: 12 runs in 90 days, deprecated, replaced by BI dashboards
- **Business Impact**: NONE (feature scheduled for deprecation)
- **Final Priority**: P3 - Low (do not waste time fixing)

**Contrast**:
- **Finding**: "Low test coverage in VRK Import module"
- **Technical Severity**: HIGH (missing tests = risk)
- **Usage Data**: Runs daily, blocks morning operations, critical regulatory requirement
- **Business Impact**: CRITICAL (business stops if this fails)
- **Final Priority**: P0 - Critical (fix immediately)

**Without usage data**: Both findings would have same priority (HIGH). **With usage data**: Correct prioritization emerges.

---

### Activity 4.5.1: Check for Business Context Inputs

**Check Step 01 outputs**:

1. **If business context IS available**:
   - File exists: [BUSINESS-CONTEXT-SUMMARY.md](../../../work/01-reconnaissance/BUSINESS-CONTEXT-SUMMARY.md)
   - Proceed to Activity 4.5.2 (Cross-Reference with Usage Data)

2. **If business context NOT available**:
   - File exists: [BUSINESS-CONTEXT-UNAVAILABLE.md](../../../work/01-reconnaissance/BUSINESS-CONTEXT-UNAVAILABLE.md)
   - Proceed to Activity 4.5.3 (Flag Findings Needing Usage Data)

---

### Activity 4.5.2: Cross-Reference Technical Findings with Usage Data

**When business context IS available**, use the following prioritization approach:

#### Prioritization Matrix

Combine technical severity with business impact for accurate prioritization:

| Technical Severity | Business Impact | Final Priority | Action | Example |
|-------------------|-----------------|----------------|--------|---------|
| Critical | High | **P0 - Critical** | Immediate attention required | Security flaw in top-10 feature |
| Critical | Medium | **P1 - High** | Schedule for next sprint | Performance issue in moderate-use feature |
| Critical | Low | **P2 - Medium** | Backlog, address when convenient | Bug in deprecation candidate |
| High | High | **P1 - High** | Schedule soon | Code quality issue in critical workflow |
| High | Medium/Low | **P2 - Medium** | Technical debt backlog | Complexity in low-usage component |
| Medium | High | **P1 - High** | Business-critical despite moderate technical issue | Missing validation in top-10 feature |
| Medium | Medium/Low | **P3 - Low** | Monitor, address if time permits | Minor issue in standard component |
| Low | High | **P2 - Medium** | Consider if affects user experience | UI polish in critical workflow |
| Low | Medium/Low | **P4 - Defer** | Ignore or defer | Cosmetic issue in unused feature |

#### Business Impact Assessment Rules

**Read usage data**:
```powershell
$businessContext = Get-Content "work/01-reconnaissance/BUSINESS-CONTEXT-SUMMARY.md" -Raw
```

**For each technical finding**, check:

**1. Is the affected component in Top 10 Most-Used Features?**
- **YES** â†’ **Business Impact = HIGH** â†’ Increase priority
- **NO** â†’ Continue to next check

**2. Is the affected component in Deprecation Candidates?**
- **YES** â†’ **Business Impact = NONE** â†’ Decrease priority (or mark as "fix in TO-BE, not AS-IS")
- **NO** â†’ Continue to next check

**3. Does it affect Critical User Workflows?**
- **YES** â†’ **Business Impact = CRITICAL** â†’ Mark as P0/P1
- **NO** â†’ Continue to next check

**4. Is it related to reported Performance Bottlenecks?**
- **YES** â†’ **Business Impact = HIGH** â†’ Mark as P0/P1
- **NO** â†’ Continue to next check

**5. Does it affect Business-Critical Integrations?**
- **YES** â†’ **Business Impact = CRITICAL** â†’ Mark as P0/P1
- **NO** â†’ **Business Impact = LOW/MEDIUM** â†’ Use technical severity as primary factor

#### Output Format

**Create**: `work/04-findings/FINDINGS-PRIORITIZED-BY-BUSINESS-IMPACT.md`

```markdown
# Technical Findings Prioritized by Business Impact

**Source**: Step 04 findings cross-referenced with Step 01 business context

**Status**: âœ… Business-grounded prioritization complete

---

## P0 - Critical (Business-Critical + Technical Issue)

| Finding ID | Component | Technical Severity | Business Impact | Reason | File Location |
|------------|-----------|-------------------|-----------------|--------|---------------|
| F-001 | VRK Import | HIGH | CRITICAL | Runs daily, blocks morning operations | VrkImportService.cs:142 |
| F-002 | Address Search API | MEDIUM | CRITICAL | 1.2M requests/month, top-10 feature | DarSearchServices.cs:89 |

**Action**: Fix these IMMEDIATELY. Business stops if these fail.

---

## P1 - High (High Usage OR High Technical Risk)

| Finding ID | Component | Technical Severity | Business Impact | Reason | File Location |
|------------|-----------|-------------------|-----------------|--------|---------------|
| F-010 | Building Management UI | CRITICAL | MEDIUM | Security flaw, 5K sessions/month | BuildingController.cs:67 |

**Action**: Schedule for next sprint. High priority but not business-blocking.

---

## P2 - Medium (Moderate Impact)

| Finding ID | Component | Technical Severity | Business Impact | Reason | File Location |
|------------|-----------|-------------------|-----------------|--------|---------------|
| F-020 | Coordinate Conversion | HIGH | LOW | Used occasionally, low volume | CoordinateConverter.cs:45 |

**Action**: Technical debt backlog. Address when resources available.

---

## P3 - Low (Deprecation Candidates OR Low Usage)

| Finding ID | Component | Technical Severity | Business Impact | Reason | File Location |
|------------|-----------|-------------------|-----------------|--------|---------------|
| F-030 | Legacy Report Generator | HIGH | NONE | 12 runs in 90 days, deprecated | ReportGenerator.cs:234 |

**Action**: Do NOT fix. These features are being deprecated. Fix issues in TO-BE modernized system, not AS-IS legacy.

---

## Summary Statistics

| Priority | Count | % of Total | Action |
|----------|-------|------------|--------|
| P0 - Critical | {n} | {%} | Fix immediately |
| P1 - High | {n} | {%} | Schedule for next sprint |
| P2 - Medium | {n} | {%} | Technical debt backlog |
| P3 - Low | {n} | {%} | Do not fix in AS-IS |
| P4 - Defer | {n} | {%} | Ignore |

---

## Findings That Changed Priority Based on Usage Data

**Upgraded Priority** (higher business impact than expected):

| Finding ID | Component | Technical Severity | Original Priority | New Priority | Reason |
|------------|-----------|-------------------|------------------|--------------|--------|
| F-002 | Address Search API | MEDIUM | P2 - Medium | P0 - Critical | 1.2M requests/month, top-10 feature |

**Downgraded Priority** (lower business impact than expected):

| Finding ID | Component | Technical Severity | Original Priority | New Priority | Reason |
|------------|-----------|-------------------|------------------|--------------|--------|
| F-030 | Legacy Report Generator | HIGH | P1 - High | P3 - Low | Deprecation candidate, 12 runs in 90 days |
```

---

### Activity 4.5.3: Flag Findings Needing Usage Data (When Business Context Unavailable)

**When business context NOT available**, document the limitation:

**Create**: `work/04-findings/FINDINGS-PRIORITIZED-BY-TECHNICAL-SEVERITY-ONLY.md`

```markdown
# Technical Findings Prioritized by Technical Severity Only

**Source**: Step 04 findings

**âš ï¸ LIMITATION**: Business context unavailable. Prioritization based on TECHNICAL SEVERITY ONLY, not business impact.

**Status**: âš ï¸ Usage data needed for accurate prioritization

---

## Critical Severity (Technical Assessment)

| Finding ID | Component | Technical Severity | Business Impact | File Location |
|------------|-----------|-------------------|-----------------|---------------|
| F-001 | VRK Import | CRITICAL | â“ UNKNOWN | VrkImportService.cs:142 |
| F-002 | Address Search API | CRITICAL | â“ UNKNOWN | DarSearchServices.cs:89 |

**âš ï¸ CAUTION**: Cannot determine if these are truly critical without usage data.

---

## Questions for Step 06 Interviews

**CRITICAL QUESTIONS** to gather missing business context:

### Usage Frequency Questions

1. **VRK Import** (Finding F-001):
   - How often does VRK Import run?
   - What operations depend on VRK Import completing?
   - If VRK Import fails, what is the business impact?

2. **Address Search API** (Finding F-002):
   - How many address searches per month?
   - Which user groups use address search most?
   - Is performance acceptable?

### Deprecation Candidate Questions

3. **Unused Features**:
   - Which features are scheduled for deprecation?
   - Which features have low/no usage?

---

## Recommendation for Step 06

**Prioritize interview time** on gathering usage statistics to re-prioritize these findings accurately.
```

---

### Activity 4.5.4: Update Gate 2 Summary

**Before presenting Gate 2 to human**, include business impact summary:

**Add to Gate 2 presentation**:

```
## Business Impact Summary (from Section 4.5)

**Business Context Status**: {âœ… Available | âŒ Unavailable}

**If Available**:
- P0 (Critical): {n} findings (business-critical + technical issue)
- P1 (High): {n} findings (high usage OR high risk)
- P2 (Medium): {n} findings (moderate impact)
- P3 (Low): {n} findings (deprecation candidates)

**Deprecation Opportunities**: {n} components recommended for deprecation (P3), reducing modernization scope by {X%}.

**If Unavailable**:
- âš ï¸ Prioritization based on technical severity only
- Step 06 interviews will focus on gathering missing usage statistics
```

---

### Success Criteria for Section 4.5

Before proceeding to Gate 2, ensure:

- [ ] Business context status checked (available or unavailable documented)
- [ ] If available: Findings prioritized by business impact (P0/P1/P2/P3/P4)
- [ ] If available: Deprecation candidates identified (P3)
- [ ] If unavailable: Findings flagged as "Priority TBD - needs usage data"
- [ ] If unavailable: Questions prepared for Step 06 interviews
- [ ] Business impact summary added to Gate 2 presentation

---

# â›” MANDATORY HUMAN REVIEW GATE #2

**STOP**: You MUST NOT proceed beyond this section without explicit human approval.

## Why This Gate Exists

Static analysis findings, especially security vulnerabilities, may be severe enough to require immediate remediation before continuing analysis. Human must decide if the discovered risks are acceptable to continue or if critical issues must be fixed first.

## What Human Must Review

1. **Security Findings Summary**:
   - Count by severity: Critical, High, Medium, Low
   - Top 5 most critical security vulnerabilities with file locations
   - Any hardcoded secrets, SQL injection risks, authentication bypasses

2. **Code Quality Findings Summary**:
   - Total issues by category
   - Complexity hotspots (cyclomatic complexity > 15)
   - Dead code and unused references count
   - Deprecated API usage count

3. **Documentation Gap Analysis**:
   - Features documented but not implemented
   - Features implemented but not documented
   - Documented workarounds vs. actual bugs
   - Undocumented technical debt count

4. **Component Risk Assessment** (NEW - Section 4.4):
   - [COMPONENT-RISK-ASSESSMENT.md](../../../work/04-findings/COMPONENT-RISK-ASSESSMENT.md) must be generated
   - Risk assessment for each component (IPR, Privacy, Security)
   - Recommended analysis strategy per component
   - Components requiring Manual Review vs. Full AI Analysis

5. **Remediation Status** (if AI-assisted remediation was enabled):
   - Issues fixed vs. pending review
   - Changes that need validation

6. **Decisions Required**:
   - Are findings acceptable to continue?
   - Approve/modify component analysis strategy for each high-risk component
   - Should critical issues be fixed first?

## Required AI Agent Action

**YOU MUST perform these steps IN ORDER**:

1. **Count and categorize findings**:
   ```
   Security Findings:
     - Critical: {count}
     - High: {count}
     - Medium: {count}
     - Low: {count}

   Code Quality Issues:
     - Complexity hotspots: {count}
     - Dead code: {count}
     - Deprecated APIs: {count}

   Documentation Gaps:
     - Documented but not implemented: {count}
     - Implemented but not documented: {count}
     - Divergences: {count}
   ```

2. **List top 5 critical findings** with file locations:
   ```
   1. {Vulnerability type} in {file}:{line} - {brief description}
   2. {Vulnerability type} in {file}:{line} - {brief description}
   ...
   ```

3. **Generate Component Risk Assessment** (Section 4.4):
   - Follow instructions in Section 4.4.1
   - Create `work/04-findings/COMPONENT-RISK-ASSESSMENT.md`
   - Assess each component for IPR, Privacy, Security risks
   - Recommend analysis strategy per component (default: Full AI Analysis)
   - Identify components requiring Manual Review (HIGH risk)
   - Output: Component risk assessment document ready for human review

4. **Update gate-tracking.md**:
   - Set Gate 2 status to "â¸ï¸ Blocked"
   - Add log entry with findings summary AND component risk assessment summary

5. **Use AskUserQuestion tool** with these exact options:
   ```
   Question: "Static analysis findings review and component risk assessment complete. Please review:

   - [COMPONENT-RISK-ASSESSMENT.md](work/04-findings/COMPONENT-RISK-ASSESSMENT.md) - Risk analysis per component
   - [scan-results/](work/03-metrics/scan-results/) - Raw scan output files (if available)

   Summary shown above includes security findings and code quality metrics. The component risk assessment recommends analysis strategies based on IPR, privacy, and security risks.

   Do you approve the findings and component analysis strategies to proceed to Step 05?"

   Header: "Gate 2: Findings & Strategy"

   Options:
   - Label: "âœ… APPROVE - Accept recommendations"
     Description: "Security findings acceptable. Component strategies approved as recommended. Proceed to Step 05."

   - Label: "ðŸ”„ APPROVE WITH CHANGES - Modify strategies"
     Description: "Findings acceptable but want to override component strategies. Will update COMPONENT-RISK-ASSESSMENT.md before proceeding."

   - Label: "â¸ï¸ PAUSE - Fix critical issues first"
     Description: "Security findings too severe. Must remediate critical issues before continuing."

   - Label: "ðŸ” INVESTIGATE - Show detailed findings"
     Description: "Want detailed information about specific vulnerabilities, code quality issues, or risk assessments."
   ```

6. **WAIT for human response** - do NOT continue until approved

7. **Update gate-tracking.md** with human decision:
   - Update status based on response
   - Add human approver and decision
   - Update "Notes" with any additional context (including component strategy changes if applicable)
   - Add timestamp

8. **Handle response**:
   - If "âœ… APPROVE": Proceed to Step 05 with recommended component strategies
   - If "ðŸ”„ APPROVE WITH CHANGES": Wait for human to update COMPONENT-RISK-ASSESSMENT.md, then proceed to Step 05
   - If "â›” STOP": End workflow, document blockers, create remediation plan
   - If "ðŸ” INVESTIGATE": Provide detailed findings report, re-request approval

## Exit Condition

**ONLY proceed when human selects "âœ… APPROVE" or "ðŸ”„ APPROVE WITH CHANGES".**

- If human selects "âœ… APPROVE": Proceed to Step 05 using recommended component strategies from COMPONENT-RISK-ASSESSMENT.md
- If human selects "ðŸ”„ APPROVE WITH CHANGES": Wait for human to update component strategies in COMPONENT-RISK-ASSESSMENT.md, then proceed to Step 05
- If human selects "â›” STOP": End analysis workflow here. Create `work/remediation-plan.md` listing issues that must be fixed.
- If human selects "ðŸ” INVESTIGATE": Provide detailed SARIF/JSON reports and component risk details, then re-request approval.

## Consequences of Skipping This Gate

âš ï¸ **If you skip this gate:**

- You may spend hours analyzing a codebase with critical security flaws that make analysis results irrelevant
- Security vulnerabilities may go unaddressed in production
- Component analysis may focus on wrong priorities
- **Analysis results will be INVALID if critical security issues exist**
- You will need to restart from Step 04 after issues are fixed

---

## Record Step Completion Time

**IMPORTANT**: Record this step's completion time for the timing tracker (after Gate 2 approval).

**PowerShell**:
```powershell
# Record step completion time and append to timing tracker
$Step04EndTime = Get-Date
$timingEntry = @{
    step = "04"
    description = "Findings and Documentation Gap Analysis"
    start = $Step04StartTime.ToString('yyyy-MM-ddTHH:mm:ss')
    end = $Step04EndTime.ToString('yyyy-MM-ddTHH:mm:ss')
    duration_min = [math]::Round(($Step04EndTime - $Step04StartTime).TotalMinutes, 1)
}
$timingEntry | ConvertTo-Json -Compress | Add-Content "{ANALYSIS_ROOT}/STEP-TIMING-TRACKER.jsonl"
Write-Host "Step 04 timing recorded: $($timingEntry.duration_min) minutes" -ForegroundColor Cyan
```

**Bash/sh**:
```bash
# Record step completion time and append to timing tracker
STEP_04_END=$(date -Iseconds)
STEP_04_DURATION=$(( ($(date -d "$STEP_04_END" +%s) - $(date -d "$STEP_04_START" +%s)) / 60 ))

echo "{\"step\":\"04\",\"description\":\"Findings and Documentation Gap Analysis\",\"start\":\"$STEP_04_START\",\"end\":\"$STEP_04_END\",\"duration_min\":$STEP_04_DURATION}" >> "{ANALYSIS_ROOT}/STEP-TIMING-TRACKER.jsonl"
echo "Step 04 timing recorded: $STEP_04_DURATION minutes"
```

---

## Next Step

After Gate 2 approval, proceed to: [05-component-analysis.md](05-component-analysis.md)

---

*Document Version: 2.0*
*Last Updated: 2026-01-14*
*Changes:
- **v2.0**: Added Section 4.5 (Business Impact Grounding) for usage-driven prioritization. Findings are now cross-referenced with business context from Step 01 to prioritize by business impact, not just technical severity.
- v1.2: Added Gate 2 with Component Risk Assessment
- v1.1: Added documentation gap analysis
- v1.0: Initial version*
