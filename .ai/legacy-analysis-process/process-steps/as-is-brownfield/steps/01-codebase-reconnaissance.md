# Step 01: Codebase and Documentation Reconnaissance

**Duration**: 45-60 minutes
**Prerequisites**: `PROJECT-SCOPE.md` must exist at analysis root (completed in Step 00)
**Output**: Technology inventory, documentation inventory, tool requirements, analysis scope, stakeholder contacts

---

## Start Analysis Timer

**IMPORTANT**: Record the analysis start time now. This will be used to calculate total analysis duration in Step 09.

```powershell
# Record start time
$AnalysisStartTime = Get-Date
Write-Host "Analysis started at: $($AnalysisStartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Cyan

# Save to file for later reference
$AnalysisStartTime.ToString('yyyy-MM-dd HH:mm:ss') | Out-File -FilePath "{ANALYSIS_ROOT}/ANALYSIS-START-TIME.txt"
```

Or simply note: **Analysis Start Time: ______________ (YYYY-MM-DD HH:MM)**

### Record Step Start Time

**PowerShell**:
```powershell
# Record this step's start time for timing tracker
$Step01StartTime = Get-Date
```

**Bash/sh**:
```bash
# Record this step's start time for timing tracker
STEP_01_START=$(date -Iseconds)
```

---

## Overview

Before installing any static analysis tools, use an AI assistant (e.g., Claude Code, GitHub Copilot, Cursor) to perform reconnaissance of **both the codebase AND business documentation**. This determines:
1. **Business Intent**: Why does this system exist? What problems does it solve?
2. **Documentation Availability**: What business requirements and design docs exist?
3. **Technologies Present**: What tech stack is actually used?
4. **Tool Requirements**: Which static analysis tools are needed?
5. **Stakeholder Contacts**: Who can validate findings?

**Key Principles**:
- **Business Context First**: Understand "why" before "how"
- **Documentation Before Code**: Find BRDs/specs before deep technical analysis
- **Don't install tools you don't need**: Scan first, then decide

---

# â›” GATE 0: Business Context Collection Approval

**Purpose**: Ensure business context inputs are ready before technical analysis begins

**Decision**: READY / PENDING / UNAVAILABLE / HELP

**Prerequisites**: None (this is the first gate)

**Output**: Approval to proceed with Step 01 business context collection

---

## AI Agent Required Action

Use AskUserQuestion tool to verify business context readiness:

Question: "What is your business context status for this legacy analysis?"

Header: "Gate 0: Context"

Options:
- Label: "âœ… Context Ready"
  Description: "Usage statistics and business docs available in analysis-step-inputs/00-project-context/. Proceed with full business context."

- Label: "â³ Context Pending"
  Description: "Need time to gather usage stats. Pause analysis - I will resume when ready."

- Label: "âŒ Context Unavailable"
  Description: "Usage stats not available. Proceed code-only - collect during Step 06 interviews."

- Label: "â“ Need Guidance"
  Description: "Not sure what to collect. Please explain business context requirements."

## Response Handling

**If "âœ… Context Ready"**: Proceed to Section 1.1 (Application Usage Context Collection)

**If "â³ Context Pending"**:
- Create `work/01-reconnaissance/GATE-0-PAUSED.md` with timestamp
- Display message: "Analysis paused at Gate 0. Resume when context inputs are ready."
- STOP workflow execution

**If "âŒ Context Unavailable"**:
- Create `work/01-reconnaissance/CONTEXT-UNAVAILABLE.md` documenting limitation
- Proceed with code-only analysis path
- Add note to collect context during Step 06 human interviews

**If "â“ Need Guidance"**:
- Display guidance from `analysis-step-inputs/README.md`
- Explain: usage statistics, BRDs, architecture docs, stakeholder contacts
- Return to Gate 0 question after guidance

---

# â›” MANDATORY: APPLICATION USAGE CONTEXT COLLECTION

## 1.1 Business Context Collection (Pre-Code Analysis)

**Duration**: 15-30 minutes (if inputs already prepared) OR schedule for later preparation
**Prerequisites**: User access to monitoring tools, logs, analytics, BI dashboards
**Output**: Business context summary with usage statistics

### ðŸ›‘ STOP: AI Agent Instruction

**YOU MUST COMPLETE THIS SECTION BEFORE ANY TECHNICAL CODE ANALYSIS.**

If you are an AI agent executing this workflow:

1. **DO NOT skip to technical reconnaissance** (file scanning, tool selection)
2. **DO NOT proceed without business context review**
3. **YOU MUST check for input folder** `docs/ai/legacy_analysis/analysis-step-inputs/00-project-context/`
4. **YOU MUST ask the user** if business context inputs are available
5. **YOU MUST gate progress** until user confirms inputs status

### Why Application Usage Statistics Are Critical

**Problem**: Code analysis alone cannot answer:
- â“ Which features are actively used vs unused?
- â“ Which technical debt has the highest user impact?
- â“ What should we modernize first?
- â“ What can we deprecate?

**Solution**: Collect usage statistics **BEFORE code analysis** to:
- âœ… Prioritize high-usage features for modernization
- âœ… Identify low-usage features for deprecation
- âœ… Assess business impact of technical findings
- âœ… Focus limited resources on high-value components

**Example**:
- **Finding**: "Low test coverage in VRK Import module"
- **Without usage data**: Severity = High (technical assessment only)
- **With usage data**: "VRK Import runs daily, blocks morning operations" â†’ Severity = **CRITICAL**
- **Result**: VRK Import moves to top of modernization priority list

### What Business Context Inputs to Collect

The analysis needs the following inputs from `analysis-step-inputs/00-project-context/`:

| File | Content | Priority | Why Critical |
|------|---------|----------|--------------|
| **usage-statistics.md** | Top 10 features, user counts, workflows, bottlenecks | **CRITICAL** | Enables usage-driven prioritization |
| business-overview.md | Domain, stakeholders, business goals | High | Grounds technical findings in business value |
| priority-features.md | Which features matter most to business | High | Focuses analysis on high-value components |
| modernization-drivers.md | Why modernize? Strategic goals | Medium | Aligns analysis with business objectives |

**Most Critical**: `usage-statistics.md` - Without this, the analysis cannot prioritize by business impact.

### Input Folder Location

**Path**: `docs/ai/legacy_analysis/analysis-step-inputs/00-project-context/`

**Expected Files**:
```
analysis-step-inputs/
â”œâ”€â”€ 00-project-context/
â”‚   â”œâ”€â”€ usage-statistics.md         â† MOST CRITICAL
â”‚   â”œâ”€â”€ business-overview.md
â”‚   â”œâ”€â”€ priority-features.md
â”‚   â””â”€â”€ modernization-drivers.md
â””â”€â”€ templates/
    â”œâ”€â”€ usage-statistics-template.md  â† Users copy this
    â”œâ”€â”€ business-overview-template.md
    â””â”€â”€ ...
```

**If folder doesn't exist**: This is acceptable if this is the first legacy analysis in the organization. Document as limitation and proceed.

### Required User Dialogue (MANDATORY)

**Copy this text exactly and present it to the user**:

```
I have started the Legacy Analysis workflow (Step 01: Reconnaissance).

Before analyzing the code, I need to understand APPLICATION USAGE PATTERNS and business context.

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ“Š CRITICAL: Application Usage Statistics
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

The MOST IMPORTANT input for this analysis is APPLICATION USAGE DATA:
- Which features are used most (by transaction volume, users)?
- Which features are rarely/never used (deprecation candidates)?
- Which user workflows are critical to operations?
- What are the performance bottlenecks users report?

Without usage data, I cannot:
âŒ Prioritize components by business impact
âŒ Identify features to deprecate
âŒ Assess which technical debt matters most to users
âŒ Focus modernization on high-value areas

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

HAVE YOU ALREADY PREPARED business context inputs?

ðŸ“‚ Expected Location: docs/ai/legacy_analysis/analysis-step-inputs/00-project-context/

If NOT YET PREPARED, you can:
1. Use the template: docs/ai/legacy_analysis/analysis-step-inputs/templates/usage-statistics-template.md
2. Gather data from: Application logs, monitoring tools (AppInsights), database query logs, BI dashboards, help desk tickets
3. Fill the template with actual usage numbers
4. Save to: analysis-step-inputs/00-project-context/usage-statistics.md

Please select one of the following options:
```

### AI Agent Action (MANDATORY)

**After presenting the above**, you MUST:

1. **Use AskUserQuestion tool** with these exact options:
   ```
   Question: "Have you prepared business context inputs (especially usage statistics) for this analysis?"

   Header: "Business Context"

   Options:
   - Label: "âœ… YES - Inputs are ready"
     Description: "I have filled the usage statistics template and saved inputs to analysis-step-inputs/00-project-context/. Please review and proceed."

   - Label: "â³ NOT YET - I will prepare them now"
     Description: "I need 30-60 minutes to gather data from monitoring tools and fill the templates. Pause the analysis while I prepare inputs."

   - Label: "âŒ NOT AVAILABLE - Skip for now"
     Description: "I don't have access to usage data or cannot gather it right now. Proceed with code-only analysis and collect during interviews (Step 06)."

   - Label: "â“ HELP - Not sure what to provide"
     Description: "I'm not sure what usage statistics to collect or where to get them. Please provide guidance."
   ```

2. **WAIT for user response** - do NOT continue until user selects

3. **If user selects "âœ… YES - Inputs are ready"**:
   - Check that `analysis-step-inputs/00-project-context/` folder exists
   - Read `usage-statistics.md` (CRITICAL)
   - Read other files if present (business-overview.md, priority-features.md, modernization-drivers.md)
   - Validate completeness: Check for `{placeholder}` text that wasn't filled
   - Create summary: `work/01-reconnaissance/BUSINESS-CONTEXT-SUMMARY.md` (see template below)
   - Extract top 10 features for prioritization in later steps
   - Proceed to section 1.2 (Documentation Inventory)

4. **If user selects "â³ NOT YET - I will prepare them now"**:
   - Direct user to template: `analysis-step-inputs/templates/usage-statistics-template.md`
   - Provide guidance on data sources (see `analysis-step-inputs/README.md`)
   - Create file: `work/01-reconnaissance/BUSINESS-CONTEXT-PENDING.md` documenting pause
   - STOP and wait: Do NOT proceed until user indicates inputs are ready
   - When user returns with inputs, resume at step 3 above

5. **If user selects "âŒ NOT AVAILABLE - Skip for now"**:
   - Document limitation: Create `work/01-reconnaissance/BUSINESS-CONTEXT-UNAVAILABLE.md`
   - Note: Analysis will prioritize by technical severity only, not business impact
   - Note: Step 06 interviews will need to collect usage data from scratch
   - Warn: Modernization roadmap may not reflect actual business priorities without usage data
   - Proceed to section 1.2 (Documentation Inventory)

6. **If user selects "â“ HELP - Not sure what to provide"**:
   - Provide detailed guidance (see below)
   - Redirect to `analysis-step-inputs/README.md` for full instructions
   - Return to AskUserQuestion after guidance provided

### Guidance: What Usage Statistics to Provide

**If user requests help**, provide this guidance:

```markdown
## How to Gather Application Usage Statistics

### Data Sources

| Source | What to Extract | Tool Examples |
|--------|-----------------|---------------|
| **Application Logs** | Page views, API calls, feature usage | IIS logs, application event logs |
| **Database Query Logs** | Most-run queries, hot tables | Oracle AWR reports, SQL Server DMVs |
| **Monitoring Tools** | User sessions, transactions, errors | Azure Application Insights, New Relic, Dynatrace |
| **Analytics Platforms** | Feature usage, user flows | Google Analytics, Mixpanel, Adobe Analytics |
| **Help Desk Tickets** | User complaints, feature requests | Jira Service Desk, ServiceNow |
| **Business Reports** | Transaction volumes, user counts | Power BI, Tableau, SQL reports |

### Key Questions to Answer

1. **Top 10 Most-Used Features** (by transaction volume, users, frequency)
   - Example: "Address Search API: 1.2M requests/month (65% of traffic)"
   - Example: "VRK Bulk Import: 30 batches/month (0.01% of transactions, but critical)"

2. **Least-Used Features** (candidates for deprecation)
   - Example: "Legacy Report Generator: 12 runs/month (0.001%)"

3. **Critical User Workflows** (frequency, performance, pain points)
   - Example: "Customer service address lookup: 5,000/day, must be <500ms, currently 800ms"

4. **Performance Bottlenecks** (user-reported issues with business impact)
   - Example: "VRK Import runs 4-8 hours, blocks morning operations"

5. **Integration Points** (external systems, volumes, criticality)
   - Example: "SNS event publishing: 10,000 events/day to 3 downstream systems"

### Template Location

**Template**: `docs/ai/legacy_analysis/analysis-step-inputs/templates/usage-statistics-template.md`

**How to Use**:
1. Copy template to `analysis-step-inputs/00-project-context/usage-statistics.md`
2. Replace ALL `{placeholders}` with actual data
3. Use numbers, percentages, specific metrics (not "many", "some", "often")
4. Add notes/context where helpful
5. If data unavailable for a section, write "Data unavailable - will collect during interviews"

### If No Data Available

**Fallback Options**:
1. **Interview Operations Team**: Ask about daily/weekly usage patterns
2. **Review Business Reports**: Check transaction volume reports
3. **Analyze Database**: Run queries for most-accessed tables
4. **Check Deployment Configs**: Identify active vs deprecated services
5. **Document Assumptions**: Clearly mark estimates vs actual data

**Document the Gap**: If usage data truly unavailable, document this as a critical limitation in the analysis.
```

### Business Context Summary Template

**File**: `work/01-reconnaissance/BUSINESS-CONTEXT-SUMMARY.md`

**Create this file ONLY if user provides inputs (selects "âœ… YES"):**

```markdown
# Business Context Summary

**Date**: {date}
**Status**: âœ… COMPLETE | â³ PARTIAL | âŒ UNAVAILABLE

---

## Input Files Reviewed

- [x] `analysis-step-inputs/00-project-context/usage-statistics.md`
- [ ] `analysis-step-inputs/00-project-context/business-overview.md`
- [ ] `analysis-step-inputs/00-project-context/priority-features.md`
- [ ] `analysis-step-inputs/00-project-context/modernization-drivers.md`

---

## Top 10 Most-Used Features (Prioritize for Modernization)

| Rank | Feature | Monthly Usage | % Total | User Segments | Performance Acceptable? |
|------|---------|--------------|---------|---------------|------------------------|
| 1 | {Feature Name} | {volume} | {%} | {users} | âœ… / âš ï¸ / âŒ |
| 2 | ... | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... |

**Analysis Impact**: These features will be prioritized in component analysis (Step 05) and technical debt assessment (Step 04).

---

## Deprecation Candidates (Low/No Usage)

| Feature | Usage | Reason for Low Usage | Recommendation |
|---------|-------|---------------------|----------------|
| {Feature Name} | {volume} | {reason} | Deprecate / Migrate / Retire |
| ... | ... | ... | ... |

**Analysis Impact**: These features will be marked as low-priority or recommended for deprecation in modernization roadmap.

---

## Critical User Workflows (High Business Impact)

| Workflow | Frequency | Users | Performance Target | Current Performance | Pain Points |
|----------|-----------|-------|-------------------|---------------------|-------------|
| {Workflow} | {daily/weekly} | {count} | {target} | {current} | {issues} |
| ... | ... | ... | ... | ... | ... |

**Analysis Impact**: Technical findings affecting these workflows will be marked as CRITICAL priority.

---

## Performance Bottlenecks (User-Reported)

| Component | Issue | User Impact | Business Impact | Frequency |
|-----------|-------|-------------|-----------------|-----------|
| {Component} | {description} | {impact} | {business impact} | {how often} |
| ... | ... | ... | ... | ... |

**Analysis Impact**: These components will receive deep-dive analysis in Step 05.

---

## Integration Points (External Systems)

| System | Direction | Volume | Criticality | Current Issues |
|--------|-----------|--------|-------------|----------------|
| {System} | {In/Out/Both} | {volume} | {Critical/High/Medium/Low} | {issues or "None"} |
| ... | ... | ... | ... | ... |

**Analysis Impact**: Integration complexity and reliability will be assessed in architecture analysis.

---

## Business Priorities (For Modernization Focus)

1. **{Priority 1}**: {description}
2. **{Priority 2}**: {description}
3. **{Priority 3}**: {description}

**Analysis Impact**: Modernization roadmap will align with these business priorities.

---

## Key Insights for Analysis

### What to Prioritize
- {Insight from usage data - e.g., "VRK Import is low-volume but business-critical"}
- {Insight - e.g., "80% of usage is Address Search API - must ensure performance"}
- {Insight - e.g., "Legacy Report Generator has 0.001% usage - candidate for deprecation"}

### What to Investigate
- {Area requiring deep dive - e.g., "Why is VRK Import taking 4-8 hours?"}
- {Area - e.g., "Address Search API performance degradation at peak hours"}

### What to Deprecate
- {Feature to deprecate - e.g., "Legacy Report Generator - migrate users to BI dashboard"}
- {Feature - e.g., "Unused WebForms pages (list from analytics)"}

---

## Data Quality Assessment

| Input | Quality | Completeness | Notes |
|-------|---------|--------------|-------|
| Usage Statistics | High/Med/Low | {%} | {notes} |
| Business Overview | High/Med/Low | {%} | {notes} |
| Priority Features | High/Med/Low | {%} | {notes} |
| Modernization Drivers | High/Med/Low | {%} | {notes} |

**Overall Assessment**: {High quality - proceed with confidence | Medium quality - validate during interviews | Low quality - treat as preliminary only}

---

## Next Steps

- [ ] Use Top 10 features to prioritize component analysis (Step 05)
- [ ] Use performance bottlenecks to focus technical debt assessment (Step 04)
- [ ] Use deprecation candidates for modernization roadmap (Step 09)
- [ ] Validate findings during stakeholder interviews (Step 06)

---

**Created**: {date}
**Last Updated**: {date}
```

### Business Context Unavailable Template

**File**: `work/01-reconnaissance/BUSINESS-CONTEXT-UNAVAILABLE.md`

**Create this file ONLY if user selects "âŒ NOT AVAILABLE":**

```markdown
# Business Context Unavailable

**Date**: {date}
**Reason**: {User's reason - e.g., "Monitoring data not accessible", "No analytics in place", "First-time analysis"}

---

## Impact on Analysis

### Limitations

âŒ **Cannot prioritize by business impact**: Technical severity will be the only prioritization metric
âŒ **Cannot identify deprecation candidates**: Unknown which features are unused
âŒ **Cannot assess user impact**: Unknown how technical debt affects actual users
âŒ **Cannot focus on high-value areas**: All components treated equally

### Compensating Actions

âœ… **Step 04 (Findings Analysis)**: Will flag findings as "Priority TBD - needs usage data"
âœ… **Step 05 (Component Analysis)**: Will analyze all components without prioritization
âœ… **Step 06 (Human Review)**: Will collect usage data during stakeholder interviews (data collection, not validation)
âœ… **Step 09 (Summary)**: Will note limitation in executive summary and recommendations

---

## Data to Collect During Interviews (Step 06)

### Critical Questions for Stakeholders

1. **Feature Usage**:
   - What are the top 10 most-used features (by users, transactions, frequency)?
   - Which features are rarely or never used?

2. **User Workflows**:
   - What are the critical daily/weekly workflows?
   - What performance is acceptable for each workflow?
   - What are the current pain points?

3. **Performance**:
   - What are the known performance bottlenecks?
   - What user complaints are most common?

4. **Integration**:
   - Which external systems are most critical?
   - What are the message/transaction volumes?
   - What integration issues exist?

5. **Business Priorities**:
   - Which features are business-critical (cannot be down)?
   - Which features could be deprecated if needed?
   - What are the strategic modernization goals?

---

## Recommendation

**STRONGLY RECOMMEND**: Pause analysis and gather usage data before proceeding. The quality of the analysis output depends heavily on understanding actual usage patterns.

**If must proceed without data**: Clearly document all findings as "Prioritization pending usage data" and plan thorough Step 06 interviews to collect this information.

---

**Created**: {date}
```

---

# â›” MANDATORY: DOCUMENTATION INVENTORY

## 1.2 Documentation Inventory (Business Requirements and Design Docs)

**Duration**: 15-30 minutes
**Prerequisites**: Section 1.1 complete (usage context collected or documented as unavailable)
**Output**: Documentation inventory listing available business requirements and technical design documents

### ðŸ›‘ STOP: AI Agent Instruction

**YOU MUST COMPLETE THIS SECTION BEFORE ANY TECHNICAL ANALYSIS.**

**PREREQUISITE**: Section 1.1 (Application Usage Context Collection) must be complete first.

If you are an AI agent executing this workflow:

1. **DO NOT skip to technical reconnaissance** (file scanning, tool selection)
2. **DO NOT proceed to Step 02** until this section is complete
3. **YOU MUST create the folder** `docs/business-context/` if it doesn't exist (users will upload documents here)
4. **YOU MUST create** `work/01-reconnaissance/DOCUMENTATION-INVENTORY.md`
5. **YOU MUST ask the user** the questions below

### Required User Dialogue (MANDATORY)

**Copy this text exactly and present it to the user**:

```
I have started the Legacy Analysis workflow (Step 01: Reconnaissance).

Before I analyze the code, I need to understand the BUSINESS INTENT and available documentation.

Please answer these questions:

1. **Business Requirements Documents (BRD)**:
   - Do you have any Business Requirements Documents, User Stories, or Product Specs?
   - If YES: Please upload them to `docs/business-context/` folder
   - If NO: I will document this gap and infer requirements from code

2. **Architecture and Design Documentation**:
   - Do you have Architecture Decision Records (ADRs), design documents, or technical specs?
   - If YES: Please upload them to `docs/business-context/` folder
   - If NO: I will document this gap

3. **External Documentation Systems**:
   - Does this project use Confluence, Jira, SharePoint, or other doc systems?
   - If YES: I can connect via MCP (Model Context Protocol) - please provide access details
   - If NO: I will work with what's in the Git repository

4. **Key Stakeholders**:
   - Who are the engineers/architects/product owners I should interview in Step 06?
   - Please provide names and roles (for stakeholder interview planning)

I will create a Documentation Inventory file and wait for your response before proceeding.
```

### AI Agent Action (MANDATORY)

**BEFORE asking the user**, you MUST:

1. **Create folder** `docs/business-context/` if it doesn't exist (PowerShell: `New-Item -ItemType Directory -Force -Path "docs/business-context"` or Bash: `mkdir -p docs/business-context`)
2. **Create folder** `work/01-reconnaissance/` if it doesn't exist

**After creating folders**, you MUST:

3. **Present the questions** above to the user
4. **Create** `work/01-reconnaissance/DOCUMENTATION-INVENTORY.md` using the template below
5. **Wait for user response** - do NOT continue until user provides answers
6. **Document findings** in the inventory file
7. **Only then** proceed to technical reconnaissance (section 0.1)

### Documentation Inventory Template

**File**: `work/01-reconnaissance/DOCUMENTATION-INVENTORY.md`

```markdown
# Documentation Inventory

**Status**: â³ PENDING USER INPUT | âœ… COMPLETE

---

## Business Context Documents

### Available in Repository
- [ ] Business Requirements Document (BRD)
- [ ] User Stories / Use Cases
- [ ] Product Specifications
- [ ] Original Project Proposal/Charter

**Location**: `docs/business-context/` â† User should upload here
**Status**: {User Response: YES - uploaded | NO - missing | PENDING}

### Available in External Systems
- [ ] Confluence Space: {space name or "N/A"}
- [ ] Jira Project: {project key or "N/A"}
- [ ] SharePoint: {URL or "N/A"}
- [ ] Other: {system or "N/A"}

**MCP Access**: {YES - configured | NO - not available | PENDING}

---

## Architecture and Design Documents

### Available in Repository
- [ ] Architecture Decision Records (ADRs)
- [ ] System Design Documents
- [ ] API Specifications (OpenAPI/Swagger)
- [ ] Database Schema Documentation
- [ ] Integration Specifications
- [ ] Deployment/Operations Runbooks

**Location**: `docs/` or `docs/architecture/`
**Status**: {FOUND - list files | NOT FOUND}

### Available in External Systems
- [ ] Confluence Architecture Pages
- [ ] Vendor Documentation (for integrations)
- [ ] Diagrams (Visio, Draw.io, etc.)

---

## Stakeholder Contacts (For Step 06 Interviews)

### Engineering
- **Principal Engineer/Architect**: {Name} - {Email/Slack}
- **Lead Developer**: {Name}
- **Database Expert**: {Name}

### Product/Business
- **Product Owner**: {Name}
- **Business Analyst**: {Name}

### Operations
- **Operations Lead**: {Name}
- **Support Lead**: {Name}

---

## Documentation Gap Analysis

### Critical Gaps (Must Address)
- {e.g., "No BRD found - business intent unclear"}
- {e.g., "No architecture docs - will reverse-engineer from code"}

### Medium Gaps (Nice to Have)
- {e.g., "No API specs - will generate from code"}

### Acceptable Gaps (Not Blocking)
- {e.g., "No runbooks - can create from operations team interview"}

---

## Next Actions

### For User
- [ ] Upload documents to `docs/business-context/` (if available)
- [ ] Provide MCP credentials for Confluence/Jira (if applicable)
- [ ] Confirm stakeholder contacts for interviews

### For AI Agent
- [ ] Wait for user document upload (if pending)
- [ ] Proceed to technical reconnaissance (Section 0.1) only after this is complete

---

**Created**: {date}
**Last Updated**: {date}
```

---

# â›” MANDATORY: ANALYSIS SCOPE SELECTION

## 1.3 Analysis Scope Selection (Code-Only vs Full Analysis)

**Duration**: 5-10 minutes
**Prerequisites**: Sections 1.1 and 1.2 complete
**Output**: Analysis scope decision recorded

### ðŸ›‘ STOP: Choose Analysis Depth Before Proceeding

**YOU MUST ask the user to select their analysis scope before technical reconnaissance.**

**PREREQUISITE**: Sections 1.1 (Usage Context) and 1.2 (Documentation Inventory) must be complete first.

This is a critical decision that affects:
- **Time commitment**: Full analysis can take 4-8 hours; Code-only takes 1-2 hours
- **Tool requirements**: Full analysis requires installing SDKs, databases, dependencies
- **Output quality**: Full analysis provides runtime validation; Code-only relies on static patterns

### Required User Dialogue (MANDATORY)

**Copy this text exactly and present it to the user**:

```
Before I proceed with technical reconnaissance, I need to understand the ANALYSIS SCOPE.

There are TWO modes of legacy analysis:

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ” MODE A: CODE-ONLY ANALYSIS (Recommended for initial assessment)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

â±ï¸  TIME: 1-2 hours
ðŸ“¦ SETUP: Minimal (just code metrics tools like cloc)
ðŸ”§ REQUIRES: Git clone only - NO building, NO running application

INCLUDES:
âœ… Static code analysis (file structure, patterns, dependencies)
âœ… Code metrics extraction (lines of code, complexity estimates)
âœ… Architecture documentation from code reading
âœ… Business logic extraction from source files
âœ… Database schema analysis (from DDL scripts)
âœ… Integration mapping (from code patterns)

EXCLUDES:
âŒ Runtime behavior validation
âŒ Actual build verification
âŒ Live application testing
âŒ Database query execution
âŒ Performance profiling

BEST FOR: Quick assessment, initial scope estimation, when build environment is complex

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸ”¬ MODE B: FULL ANALYSIS (Comprehensive with live validation)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

â±ï¸  TIME: 4-8 hours (varies significantly by project complexity)
ðŸ“¦ SETUP: Full development environment
ðŸ”§ REQUIRES: SDK installation, database setup, building, running application

âš ï¸  WARNING: This mode requires significant setup time:
    - Installing .NET SDK / Java JDK / Node.js (15-30 min)
    - Installing database tools (Oracle client, SQL Server tools) (15-45 min)
    - Building the application (may fail due to missing dependencies) (30-60 min)
    - Configuring database connections (may need credentials) (15-30 min)
    - Running static analysis tools (30-60 min)

INCLUDES (everything in Code-Only PLUS):
âœ… Full build verification (compile errors, warnings)
âœ… Static analysis tool output (SARIF reports, security scans)
âœ… Dependency vulnerability scanning
âœ… Code coverage from existing tests (if available)
âœ… Runtime validation (if application can run)
âœ… Database query analysis (if database accessible)

RISKS:
âš ï¸  Build may fail due to missing proprietary dependencies
âš ï¸  Database may not be accessible (need credentials, VPN)
âš ï¸  Environment setup may hit blockers requiring human intervention
âš ï¸  May spend hours on setup before any analysis begins

BEST FOR: When modernization is definitely happening, when you need validated metrics

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

Please select your analysis mode:

A) CODE-ONLY - Quick assessment without building/running (1-2 hours)
B) FULL ANALYSIS - Comprehensive with live validation (4-8 hours)
C) UNSURE - Help me decide based on my situation
```

### AI Agent Action (MANDATORY)

**After presenting the above**, you MUST:

1. **Use AskUserQuestion tool** with these exact options:
   ```
   Question: "Which analysis scope do you want to proceed with?"

   Header: "Analysis Mode"

   Options:
   - Label: "ðŸ” CODE-ONLY (Recommended)"
     Description: "Quick 1-2 hour assessment using static code analysis. No building or running required. Best for initial assessment."

   - Label: "ðŸ”¬ FULL ANALYSIS"
     Description: "Comprehensive 4-8 hour analysis with full environment setup, building, and validation. Best when modernization is confirmed."

   - Label: "â“ HELP ME DECIDE"
     Description: "I'm not sure which mode is best for my situation. Please ask clarifying questions."
   ```

2. **WAIT for user response** - do NOT continue until user selects

3. **If user selects "HELP ME DECIDE"**, ask follow-up questions:
   ```
   To help you decide, please answer:

   1. Do you have access to build the application locally?
      (Do you have all SDKs, database clients, credentials?)

   2. Is this a preliminary assessment or confirmed modernization project?
      (Preliminary = Code-Only recommended; Confirmed = Full recommended)

   3. How much time do you have available right now?
      (Less than 2 hours = Code-Only; More than 4 hours = Full possible)

   4. Do you need validated metrics (test coverage, security scan reports)?
      (If yes = Full; If estimates are OK = Code-Only)
   ```

4. **Record the decision** in `work/01-reconnaissance/ANALYSIS-SCOPE.md`:

```markdown
# Analysis Scope Selection

**Date**: {date}
**Selected Mode**: {CODE-ONLY | FULL}
**User Decision**: {user's selection}

## Implications

### If CODE-ONLY:
- Skip Step 02 tool installation (except cloc, pandoc)
- Skip Step 03 automated static analysis scans
- Proceed directly to Step 05 AI-powered analysis
- Output will be based on code reading, not validated metrics

### If FULL:
- Proceed to Step 02 for full tool installation
- Run Step 03 automated discovery scans
- Expect 4-8 hour total duration
- User warned about potential setup blockers
```

5. **Only then** proceed to technical reconnaissance (section 1.4)

---

## 1.4 Technical Reconnaissance (AFTER All Prerequisites Complete)

**Duration**: 30-45 minutes
**Prerequisites**: Sections 1.1, 1.2, and 1.3 complete
**Output**: Technology inventory, file counts, tool requirements, analysis scope

**PREREQUISITE**: Complete ALL sections above before proceeding:
1. âœ… Section 1.1: Application Usage Context Collection
2. âœ… Section 1.2: Documentation Inventory
3. âœ… Section 1.3: Analysis Scope Selection

### 1.4.1 File Type Inventory

### Run Basic Scan

```powershell
# Count all code file types
Get-ChildItem -Recurse -File |
    Group-Object Extension |
    Sort-Object Count -Descending |
    Select-Object Count, Name -First 20
```

### Expected Output for {PROJECT}

| Extension | Count | Technology | Tool Needed? |
|-----------|-------|------------|--------------|
| .sql | 1,313 | Oracle PL/SQL | ZPA (optional) |
| .cs | 662 | C# | Roslyn (built-in) |
| .csproj | 59 | Project files | N/A |
| .js | 54 | JavaScript | ESLint (if security scan needed) |
| .sln | 39 | Solutions | N/A |
| .py | 10 | Python | Bandit (if security scan needed) |
| .cfm/.cfc | **0** | ColdFusion | **NOT NEEDED** |

---

### 1.4.2 Technology-Specific Tool Requirements

Based on reconnaissance, here's what {PROJECT} actually needs:

### Required (Built-in)

| Tool | Purpose | Installation |
|------|---------|--------------|
| Roslyn Analyzers | C# code quality | Built into .NET SDK |
| dotnet build SARIF | C# scan output | Built into .NET SDK |

### Optional (Enhanced Analysis)

| Tool | Purpose | When to Use |
|------|---------|-------------|
| Security Code Scan | C# security vulnerabilities | If security audit needed |
| ZPA | PL/SQL code quality | If automated PL/SQL scan needed |

### NOT Needed for {PROJECT}

| Tool | Reason |
|------|--------|
| Fixinator | No ColdFusion code (0 .cfm/.cfc files) |
| CommandBox | No ColdFusion code |
| Visual Expert | Commercial; manual analysis sufficient |

---

### 1.4.3 MCP Server Configuration for External Documentation

**PREREQUISITE**: User must have confirmed external documentation systems exist (from "Business Context First" section).

### Purpose
If the user indicated Confluence, Jira, or other external documentation systems exist, configure MCP (Model Context Protocol) servers to access them during analysis.

**When to Skip**: If user confirmed "NO" to external systems, skip to section 0.4.

### Atlassian MCP Server (Confluence + Jira)

**When to Install**: If project uses Atlassian Confluence or Jira

**Installation Steps**:

```bash
# Install Atlassian MCP server
npm install -g @modelcontextprotocol/server-atlassian

# Configure in Claude Code settings
# Add to .claude/mcp_settings.json
{
  "mcpServers": {
    "atlassian": {
      "command": "mcp-server-atlassian",
      "args": [],
      "env": {
        "ATLASSIAN_URL": "https://your-domain.atlassian.net",
        "ATLASSIAN_USERNAME": "your-email@company.com",
        "ATLASSIAN_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Getting API Token**:
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Create API token
3. Store securely (do NOT commit to git)

**Verify Connection**:
```javascript
// Test Confluence access
mcp__atlassian__search_confluence({
  query: "architecture decision",
  space: "PROJECT_KEY"
})

// Test Jira access
mcp__atlassian__search_jira({
  jql: "project = {PROJECT} AND type = Epic",
  maxResults: 10
})
```

### GitHub MCP Server (For GitHub Issues)

**When to Install**: If project uses GitHub Issues for tracking

```bash
# Install GitHub MCP server
npm install -g @modelcontextprotocol/server-github

# Configure with GitHub token
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

---

### 1.4.4 AI-Powered Basic Analysis

AI assistants (Claude Code, GitHub Copilot, Cursor, etc.) can perform direct analysis without external tools for:

### What AI Assistants Can Do Directly

1. **Code Structure Analysis**
   - Read and understand file organization
   - Identify architectural patterns
   - Map dependencies between components

2. **Business Logic Extraction**
   - Read C# and SQL code
   - Document business rules
   - Extract validation logic

3. **Integration Mapping**
   - Identify database calls
   - Find API endpoints
   - Document data flows

4. **Pattern Detection**
   - Find common code smells
   - Identify duplicate logic
   - Spot potential issues

### AI Limitations (Where Static Analysis Tools Help)

1. **Quantitative Metrics**
   - Cyclomatic complexity scores
   - Exact line counts across large codebases
   - Test coverage percentages

2. **Exhaustive Scanning**
   - Finding ALL instances of a pattern
   - Guaranteed no false negatives
   - Consistent rule application

3. **Machine-Readable Output**
   - SARIF/JSON for dashboards
   - Integration with CI/CD
   - Automated ticket creation

---

### 1.4.5 Recommended Analysis Approach for {PROJECT}

### Tier 1: AI-Only (No Static Analysis Tools)

Use when:
- Initial exploration and understanding
- Business logic documentation
- Architecture mapping
- Quick code reviews

**Workflow**:
```
1. AI assistant reads code files directly
2. AI analyzes and documents findings
3. Human reviews AI output
```

**Example Tools**: Claude Code, GitHub Copilot Chat, Cursor, Cody

### Tier 2: Built-in Tools + AI

Use when:
- Need structured defect inventory
- Want machine-readable output
- Preparing for CI/CD integration

**Workflow**:
```
1. dotnet build with SARIF output (built-in)
2. AI assistant processes SARIF results
3. AI generates fixes
4. Human reviews and approves
```

**Example**: GitHub Copilot Autofix, Claude Code with SARIF parsing

### Tier 3: External Tools + AI

Use when:
- Security audit required
- Compliance documentation needed
- Exhaustive scanning required

**Workflow**:
```
1. Install Security Code Scan / ZPA
2. Run comprehensive scans
3. AI assistant processes results
4. Human reviews and approves
```

**Example**: SonarQube + AI remediation, Snyk + Copilot

---

### 1.4.6 {PROJECT}-Specific Scope

Based on reconnaissance:

### C# Layer (662 files)

| Area | Path | Priority |
|------|------|----------|
| External Services | `trunk/{PROJECT}/src/ExternalServices/` | High |
| Sync Components | `trunk/{PROJECT}/src/Sync/` | High |
| Tools | `trunk/{PROJECT}/src/Tools/` | Medium |
| Common Libraries | `trunk/{PROJECT}/src/Common/` | Medium |
| UI | `trunk/{PROJECT}/src/UI/` | Low |

### Database Layer (1,313 SQL files)

| Area | Path | Priority |
|------|------|----------|
| Prod Functions | `prod/DARDb/functions/` | High |
| Prod Packages | `prod/DARDb/packages/` | High |
| Prod Procedures | `prod/DARDb/procedures/` | High |
| Prod Tables | `prod/DARDb/tables/` | High |
| Trunk DB | `{SOURCE_ROOT}Db/` | Medium |

---

### 1.4.7 Quick Reconnaissance Script

```powershell
# Save as: scripts/00-reconnaissance.ps1

Write-Host "=== {PROJECT} Codebase Reconnaissance ===" -ForegroundColor Cyan

# 1. File type inventory
Write-Host "`n--- File Types ---" -ForegroundColor Yellow
Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -match "\.(cs|sql|js|ts|py|cfm|cfc|vb|java)$" } |
    Group-Object Extension |
    Sort-Object Count -Descending |
    Format-Table @{L='Count';E={$_.Count}}, @{L='Type';E={$_.Name}} -AutoSize

# 2. Directory structure
Write-Host "`n--- Key Directories ---" -ForegroundColor Yellow
@("trunk/{PROJECT}/src", "prod/DARDb", "{SOURCE_ROOT}Db") | ForEach-Object {
    if (Test-Path $_) {
        $count = (Get-ChildItem -Path $_ -Recurse -File -ErrorAction SilentlyContinue).Count
        Write-Host "[EXISTS] $_ ($count files)" -ForegroundColor Green
    } else {
        Write-Host "[MISSING] $_" -ForegroundColor Red
    }
}

# 3. ColdFusion check
Write-Host "`n--- ColdFusion Check ---" -ForegroundColor Yellow
$cfFiles = Get-ChildItem -Recurse -Include "*.cfm","*.cfc" -ErrorAction SilentlyContinue
if ($cfFiles.Count -eq 0) {
    Write-Host "[SKIP] No ColdFusion files - Fixinator NOT needed" -ForegroundColor Green
} else {
    Write-Host "[FOUND] $($cfFiles.Count) ColdFusion files - Fixinator recommended" -ForegroundColor Yellow
}

# 4. Tool recommendations
Write-Host "`n--- Tool Recommendations ---" -ForegroundColor Yellow
Write-Host "[REQUIRED] Roslyn Analyzers (built into .NET SDK)" -ForegroundColor Green
Write-Host "[OPTIONAL] Security Code Scan (for security audit)" -ForegroundColor Yellow
Write-Host "[OPTIONAL] ZPA (for automated PL/SQL scanning)" -ForegroundColor Yellow
Write-Host "[SKIP] Fixinator/CommandBox (no ColdFusion)" -ForegroundColor DarkGray
```

---

### 1.4.8 Decision Matrix

| Question | If Yes | If No |
|----------|--------|-------|
| Need security audit? | Install Security Code Scan | Skip |
| Need automated PL/SQL scan? | Install ZPA | Use AI assistant directly |
| Have ColdFusion code? | Install Fixinator | Skip ({PROJECT}: No) |
| Need CI/CD integration? | Use SARIF output | Use AI analysis |
| Need compliance docs? | Full tool suite | AI-first approach |

---

## 1.5 Step Output: Findings Summary

**IMPORTANT**: After completing this step, document your findings in the following format. Focus on PROJECT characteristics, not workflow execution.

### Required Output Template

```markdown
# Step 00 Findings: Codebase Reconnaissance

## Status: [COMPLETE | PARTIAL | BLOCKED]

## Technology Stack Summary

| Layer | Technologies | File Count | Complexity |
|-------|-------------|------------|------------|
| Application | {e.g., C# .NET 4.7.2} | {n} | {Low/Med/High} |
| Database | {e.g., Oracle PL/SQL} | {n} | {Low/Med/High} |
| Frontend | {e.g., ASP.NET WebForms, jQuery} | {n} | {Low/Med/High} |
| Integration | {e.g., WCF, REST, AWS SNS} | {n} | {Low/Med/High} |

## Architecture Pattern

- **Primary Pattern**: {e.g., Monolithic, Layered, Microservices}
- **Database Strategy**: {e.g., Smart Database, ORM, Repository Pattern}
- **Deployment Model**: {e.g., IIS, Windows Service, Container}

## Critical Dependencies

| Dependency | Version | Risk Level | Notes |
|------------|---------|------------|-------|
| {e.g., Oracle.ManagedDataAccess} | {version} | {High/Med/Low} | {end-of-life, security, etc.} |
| {e.g., .NET Framework 4.7.2} | 4.7.2 | Medium | Legacy, migration needed |

## Business Domain Summary

- **Primary Domain**: {e.g., Address Registry Management}
- **Key Entities**: {e.g., Address, Building, Apartment, PostalCode}
- **External Integrations**: {e.g., {EXTERNAL_SYSTEM_1} (Population Register), {EXTERNAL_SYSTEM_2}, {EXTERNAL_SYSTEM_3}}

## Initial Risk Assessment

| Risk Area | Level | Description |
|-----------|-------|-------------|
| Technical Debt | {High/Med/Low} | {brief description} |
| Security Exposure | {High/Med/Low} | {brief description} |
| Maintainability | {High/Med/Low} | {brief description} |
| Scalability | {High/Med/Low} | {brief description} |

## Scope Recommendations

- **High Priority Areas**: {list directories/components}
- **Can Skip/Defer**: {list areas not critical}
- **Requires Deep Dive**: {list complex areas}

## Next Steps

- [ ] Proceed to Step 01 (Environment Setup) - if tools needed
- [ ] Skip to Step 05 (Orchestration) - if AI-only analysis
```

### Example Output ({PROJECT} Project)

```markdown
# Step 00 Findings: Codebase Reconnaissance

## Status: COMPLETE

## Technology Stack Summary

| Layer | Technologies | File Count | Complexity |
|-------|-------------|------------|------------|
| Application | C# .NET Framework 4.7.2 | 554 | High |
| Database | Oracle PL/SQL | 843 | High |
| Frontend | ASP.NET WebForms, jQuery | ~50 | Medium |
| Integration | WCF, AWS SNS, REST APIs | ~30 | High |

## Architecture Pattern

- **Primary Pattern**: Monolithic with Layered Architecture
- **Database Strategy**: Smart Database (heavy PL/SQL business logic)
- **Deployment Model**: IIS + Windows Services

## Critical Dependencies

| Dependency | Version | Risk Level | Notes |
|------------|---------|------------|-------|
| .NET Framework 4.7.2 | 4.7.2 | Medium | End of mainstream support |
| Oracle.ManagedDataAccess | 19.x | Low | Stable, but Oracle-locked |
| Microsoft.Web.Services3 (WSE 3.0) | 3.0 | **High** | Obsolete, security risk |
| Entity Framework 6 | 6.x | Medium | Legacy, EF Core preferred |

## Business Domain Summary

- **Primary Domain**: Finnish Address Registry ({PROJECT})
- **Key Entities**: Address, Building, Apartment, PostalCode, Municipality
- **External Integrations**: {EXTERNAL_SYSTEM_1} (Population Register), {EXTERNAL_SYSTEM_2}, {EXTERNAL_SYSTEM_3}, AWS SNS

## Initial Risk Assessment

| Risk Area | Level | Description |
|-----------|-------|-------------|
| Technical Debt | High | 843 DB objects with business logic, WSE 3.0 dependency |
| Security Exposure | Medium | SSL validation bypass in Global.asax, legacy auth |
| Maintainability | High | 5K+ LOC god classes, split logic between C#/PL/SQL |
| Scalability | Medium | Smart Database pattern limits horizontal scaling |

## Scope Recommendations

- **High Priority**: {PROJECT}Database, {PROJECT}Sync, {EXT1}_EXAMPLE package
- **Can Defer**: UI layer (will be replaced), Test projects
- **Requires Deep Dive**: CHECK_BUILDING_ADDRESS (1,473 LOC), COORDINATE_CONVERSION

## Next Steps

- [x] Proceed to Step 01 (Environment Setup) - ZPA for PL/SQL scan
- [ ] Step 02 (Automated Scan) - dotnet build + ZPA
```

---

## Record Step Completion Time

**IMPORTANT**: Record this step's completion time for the timing tracker.

**PowerShell**:
```powershell
# Record step completion time and append to timing tracker
$Step01EndTime = Get-Date
$timingEntry = @{
    step = "01"
    description = "Codebase Reconnaissance"
    start = $Step01StartTime.ToString('yyyy-MM-ddTHH:mm:ss')
    end = $Step01EndTime.ToString('yyyy-MM-ddTHH:mm:ss')
    duration_min = [math]::Round(($Step01EndTime - $Step01StartTime).TotalMinutes, 1)
}
$timingEntry | ConvertTo-Json -Compress | Add-Content "{ANALYSIS_ROOT}/STEP-TIMING-TRACKER.jsonl"
Write-Host "Step 01 timing recorded: $($timingEntry.duration_min) minutes" -ForegroundColor Cyan
```

**Bash/sh**:
```bash
# Record step completion time and append to timing tracker
STEP_01_END=$(date -Iseconds)
STEP_01_DURATION=$(( ($(date -d "$STEP_01_END" +%s) - $(date -d "$STEP_01_START" +%s)) / 60 ))

echo "{\"step\":\"01\",\"description\":\"Codebase Reconnaissance\",\"start\":\"$STEP_01_START\",\"end\":\"$STEP_01_END\",\"duration_min\":$STEP_01_DURATION}" >> "{ANALYSIS_ROOT}/STEP-TIMING-TRACKER.jsonl"
echo "Step 01 timing recorded: $STEP_01_DURATION minutes"
```

---

## Next Step

Based on **Analysis Scope Selection** (from earlier in this step):

### If CODE-ONLY Mode Selected (1-2 hours):
1. **Go to**: [02-environment-setup.md](02-environment-setup.md) for minimal setup (cloc, pandoc only)
2. **Then skip to**: [05-component-analysis.md](05-component-analysis.md) (AI-powered code reading)
3. **Skip**: Steps 03-04 (no static analysis tools needed)

### If FULL Mode Selected (4-8 hours):
1. **Go to**: [02-environment-setup.md](02-environment-setup.md) for full tool installation
2. **Then**: Follow full workflow: Step 03 â†’ 04 â†’ 05 â†’ ...

### Ensure Before Proceeding:
- [ ] Section 1.1 complete: Business context collection (usage statistics and business inputs reviewed or documented as unavailable)
- [ ] Section 1.2 complete: Documentation inventory (DOCUMENTATION-INVENTORY.md created)
- [ ] Section 1.3 complete: Analysis scope selected and recorded (ANALYSIS-SCOPE.md created)
- [ ] Section 1.4 complete: Technical reconnaissance (technology inventory, tool requirements)
- [ ] User understands time commitment for selected mode

---

*Document Version: 2.0*
*Last Updated: 2026-01-14*
*Changes:
- **v2.0**: Added Section 1.1 (Business Context Collection) with mandatory application usage statistics collection before code analysis. Renumbered sections 1.1-1.5.
- v1.2: Added Analysis Scope Selection dialog with CODE-ONLY vs FULL modes
- v1.1: Added Documentation Inventory section
- v1.0: Initial version*

