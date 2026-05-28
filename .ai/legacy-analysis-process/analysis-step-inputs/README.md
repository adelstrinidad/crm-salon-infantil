# Legacy Analysis Input Collection

**Purpose**: This directory contains **user-provided business context inputs** that ground the legacy code analysis in real-world business needs.

---

## Why Collect Inputs?

**Problem**: Code analysis alone cannot answer:
- Which features are actively used vs unused?
- What is the business priority of each component?
- Which technical issues have the highest user impact?
- What are the actual user workflows?

**Solution**: Collect business context inputs **before code analysis** to:
1. **Prioritize analysis efforts** on high-value components
2. **Ground technical findings** in business impact
3. **Identify deprecation candidates** (unused features)
4. **Focus stakeholder interviews** on validation, not data collection
5. **Prioritize modernization roadmap** by business value

---

## Input Folder Structure

```
analysis-step-inputs/
├── 00-project-context/        # Initial business context (CRITICAL - collect first)
│   ├── usage-statistics.md    # Application usage data (MOST CRITICAL)
│   ├── business-overview.md   # Business domain, stakeholders
│   ├── modernization-drivers.md  # Why modernize?
│   └── priority-features.md   # Which features matter most?
│
├── 01-reconnaissance/         # Additional discovery inputs
├── 04-findings/               # Business impact of technical findings
├── 06-human-review/           # Stakeholder interview materials
│
└── templates/                 # Templates for filling inputs
    ├── usage-statistics-template.md
    ├── business-overview-template.md
    └── ...
```

---

## Critical Input: Usage Statistics

### What to Provide

**File**: `00-project-context/usage-statistics.md`

**Use Template**: `templates/usage-statistics-template.md`

**Critical Data**:
1. **Top 10 Most-Used Features** (by transaction volume, user count, etc.)
2. **Least-Used Features** (candidates for deprecation)
3. **Active User Counts** (monthly, peak concurrent)
4. **Critical User Workflows** (frequency, users, performance)
5. **Performance Bottlenecks Reported by Users**
6. **Integration Point Usage** (external systems, message volumes)

### Data Sources

| Source | What to Extract |
|--------|-----------------|
| Application Logs (IIS, app logs) | Page views, API calls, feature usage |
| Database Query Logs | Most-run queries, hot tables |
| Monitoring Tools (AppInsights, New Relic) | User sessions, transactions, errors |
| Analytics (Google Analytics, Mixpanel) | Feature usage, user flows |
| Help Desk Tickets (Jira, ServiceNow) | User complaints, feature requests |
| Business Reports (BI dashboards) | Transaction volumes, user counts |

### If No Usage Data Available

**Fallback**:
1. Document lack of data as limitation
2. Interview stakeholders to estimate patterns
3. Review business reports for transaction volumes
4. Analyze database query frequency
5. Clearly document assumptions

---

## How to Fill Inputs

### Step 1: Copy Templates

```bash
# Copy templates to project-context folder
cp templates/usage-statistics-template.md 00-project-context/usage-statistics.md
cp templates/business-overview-template.md 00-project-context/business-overview.md
cp templates/priority-features-template.md 00-project-context/priority-features.md
cp templates/modernization-drivers-template.md 00-project-context/modernization-drivers.md
```

### Step 2: Gather Data

- **Usage Statistics**: Export from monitoring tools, query logs, analytics
- **Business Overview**: Interview business stakeholders
- **Priority Features**: Workshop with product owners
- **Modernization Drivers**: Review business case, strategic goals

### Step 3: Fill Templates

- Use markdown tables for structured data
- Include dates, data sources, and periods covered
- Add notes/context where helpful
- Be specific with numbers (don't use "many", "some")

### Step 4: Validate Completeness

Before starting analysis:
- [ ] Usage statistics provided (or documented as unavailable)
- [ ] Top 10 features identified
- [ ] Business priorities clear
- [ ] Modernization drivers documented

---

## When to Provide Inputs

| Input Folder | When to Provide | Used By Step |
|--------------|-----------------|--------------|
| **00-project-context/** | **Before Step 01 (Reconnaissance)** | Steps 01, 04, 05, 06, 07, 09 |
| 01-reconnaissance/ | During Step 01 | Step 01 |
| 04-findings/ | After Step 04 (Findings) | Step 04 |
| 06-human-review/ | During Step 06 (Interviews) | Step 06 |

---

## Example: Good vs Bad Inputs

### ❌ BAD: Vague Usage Description

```markdown
## Feature Usage
- The address search is used a lot
- Some users use the import feature
- The reports are rarely used
```

**Why Bad**: No numbers, no specifics, no actionable data

### ✅ GOOD: Specific Usage Data

```markdown
## Feature Usage (Top 10)

| Feature | Monthly Usage | % Total | Users |
|---------|--------------|---------|-------|
| Address Search API | 1.2M requests | 65% | Customer service (80%), Ordering (20%) |
| VRK Bulk Import | 30 batches | 0.01% | Operations team (daily batch) |
| WebForms UI | 15K sessions | 25% | Internal users (address management) |
| Legacy Report Generator | 12 runs | 0.001% | Finance team (deprecated, migrate to BI) |
```

**Why Good**: Numbers, percentages, user segments, context

---

## Benefits by Analysis Step

### Step 01: Reconnaissance
- Focus inventory on actively-used components
- Identify deprecated code early

### Step 04: Findings Analysis
- Prioritize findings by business impact
- Example: Low test coverage in top-10 feature = CRITICAL
- Example: Security issue in unused report = Low priority

### Step 05: Component Analysis
- Analyze high-usage components first
- Skip or deprioritize unused components

### Step 06: Human Review
- Validate usage patterns from data
- Focus interviews on clarifications, not data collection
- Ask targeted questions about high-impact components

### Step 07: Requirements Synthesis
- Map code features to business requirements
- Identify features without business justification

### Step 09: Summary Documentation
- Prioritize modernization roadmap by usage + business value
- Recommend deprecation of unused features
- Estimate user impact of changes

---

## Questions?

If you're unsure what to provide or how to gather data, review:
- **Templates**: `analysis-step-inputs/templates/` - Fill-in-the-blank formats
- **Plan Document**: `.tmp/ANALYSIS-INPUT-FOLDER-PLAN.md` - Full implementation plan
- **Step 01 Instructions**: `process-steps/as-is-brownfield/steps/01-codebase-reconnaissance.md` - Updated with input collection steps

---

**Remember**: The quality of analysis outputs depends on the quality of business context inputs. **Usage statistics are the most critical input** - prioritize collecting this data first.
