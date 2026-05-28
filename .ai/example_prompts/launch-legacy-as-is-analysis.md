# Launch Legacy AS-IS Analysis

## How to Use This Prompt

**Purpose**: This prompt launches the 9-step legacy brownfield system analysis workflow, producing Arc42 architecture documentation of the current AS-IS system.

**When to Use**:
- Starting analysis of a legacy codebase for modernization
- Need to document existing system architecture (Arc42 format)
- Preparing for TO-BE greenfield design (AS-IS must be completed first)

**How to Launch**:

```
Read the prompt file at .ai/example_prompts/launch-legacy-as-is-analysis.md and execute it.
```

**Alternative (resume from specific step)**:

```
Read the prompt file at .ai/example_prompts/launch-legacy-as-is-analysis.md and execute it.
Resume from Step 05 (Component Analysis).
```

---

## Objective

Execute the 9-step legacy analysis workflow to produce comprehensive Arc42 documentation of the existing brownfield system. The workflow is **READ-ONLY** - no code modifications are made.

## Input Documents

Read these documents before starting:

1. **Process Guide**: `docs/ai/legacy_analysis/process-steps/as-is-brownfield/how-to-perform-legacy-analysis.md` - Complete workflow instructions
2. **Legacy Analysis Overview**: `docs/ai/legacy_analysis/README.md` - Process summary and folder structure
3. **Project Context**: `.ai_project_memory/general-overview.md` - Architecture overview; `.ai_project_memory/architecture.md` - System architecture; stack-specific constitutions for build commands

## Output Locations

| Folder | Purpose |
|--------|---------|
| `docs/ai/legacy_analysis/arch-as-is/` | Arc42 12-section documentation (final deliverable) |
| `docs/ai/legacy_analysis/work/` | Analysis artifacts from each step |

## Process Overview

| Step | Name | Gate |
|------|------|------|
| 01 | Codebase & Documentation Reconnaissance | - |
| 02 | Tool & MCP Setup | **Gate 1** |
| 03 | Static Code Analysis | - |
| 04 | Findings & Gap Analysis | **Gate 2** |
| 05 | Component Analysis | **Gate 3** |
| 06 | Human Review & Stakeholder Interviews | **Gate 4** |
| 07 | Requirements & Intent Synthesis | - |
| 08 | Quality Validation | **Gate 5** |
| 09 | Summary Documentation | **Gate 6** |

## Execution Rules

**Autonomous Between Gates**:
- Execute steps continuously until reaching a mandatory gate
- Make reasonable assumptions for minor ambiguities (document in work files)
- Do NOT ask questions between gates

**At Gates (MANDATORY)**:
- STOP execution immediately
- Present gate-specific information
- Use AskUserQuestion tool with specified options
- WAIT for human approval before proceeding

**READ-ONLY Policy**:
- No modifications to source code files
- Document findings and recommendations only
- If code issues block analysis, document as "Known Limitation"

---

## Quick Start

To begin analysis, the AI will:

1. Read `docs/ai/legacy_analysis/process-steps/as-is-brownfield/how-to-perform-legacy-analysis.md`
2. Read `docs/ai/legacy_analysis/README.md`
3. Execute Steps 01-02 autonomously
4. Stop at Gate 1 for human approval
5. Continue through all 9 steps and 6 gates

---

## Notes

- **Duration**: ~3-4 hours for ~200K LOC codebase (machine time, excluding human review)
- **Prerequisite for TO-BE**: Complete AS-IS analysis before starting modernization design
- **Gate Tracking**: Progress tracked in `docs/ai/legacy_analysis/work/gate-tracking.md`
- **Templates**: Available in `docs/ai/legacy_analysis/templates/`
