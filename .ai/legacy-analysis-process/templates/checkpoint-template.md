# Checkpoint: Step {STEP_NUMBER}

**Created**: {TIMESTAMP}
**Session ID**: {SESSION_ID}
**Process**: ai1st-arch-legacy-sys-analysis / ai1st-arch-legacy-analysis-lite / ai1st-arch-code-quality-analysis

---

## Variables (COPY EXACTLY ON RESUME)

```
{PROJECT_ROOT}: {VALUE}
{ANALYSIS_ROOT}: {VALUE}
Current Step: {STEP_NUMBER}
Last Gate Passed: Gate {N}
Next Gate: Gate {N+1}
```

---

## Artifacts Produced This Session

| File | Status | Lines | Description |
|------|--------|-------|-------------|
| `{path/to/file1.md}` | ✅ Complete | {N} | {brief description} |
| `{path/to/file2.md}` | ✅ Complete | {N} | {brief description} |
| `{path/to/file3.md}` | ⚠️ Partial | {N} | {what's missing} |

---

## Context Reload Instructions (CRITICAL FOR RESUME)

**BEFORE resuming, read these files in order:**

1. **Constitution** (Non-negotiable rules):
   ```
   @{PROJECT_ROOT}/.ai_project_memory/legacy-analysis-constitution.md
   ```

2. **Process Guide** (Step-by-step instructions):
   ```
   @{PROJECT_ROOT}/.ai/legacy-analysis-process/process-steps/as-is-brownfield/how-to-perform-legacy-analysis.md
   ```

3. **Gate Status** (Progress tracking):
   ```
   @{ANALYSIS_ROOT}/work/gate-tracking.md
   ```

4. **This Checkpoint** (Session state):
   ```
   @{ANALYSIS_ROOT}/work/CHECKPOINT-{STEP_NUMBER}.md
   ```

---

## Key Findings Summary (For Next Session Context)

### Technology Stack Discovered
- {technology-1}: {version/details}
- {technology-2}: {version/details}

### Critical Issues Found
1. **{Issue Category}**: {brief description} - Severity: {HIGH/MEDIUM/LOW}
2. **{Issue Category}**: {brief description} - Severity: {HIGH/MEDIUM/LOW}

### Patterns Identified
- {pattern-1}: Found in {N} files
- {pattern-2}: {description}

### Dependencies Mapped
- {component-1} → {component-2}: {relationship}
- {component-1} → {external-system}: {integration type}

---

## Pending Work (Next Session)

### Immediate Next Actions
- [ ] Start Step {NEXT_STEP}: {step name}
- [ ] {specific action 1}
- [ ] {specific action 2}

### Artifacts Still Needed
- [ ] `{path/to/missing-file.md}` - {description}
- [ ] `{path/to/incomplete-file.md}` - Section {X} incomplete

### Blockers (If Any)
- {blocker-1}: {resolution needed}
- {blocker-2}: {resolution needed}

---

## Gate Status Summary

| Gate | Status | Decision | Timestamp |
|------|--------|----------|-----------|
| Gate 0 | ✅ PASSED | APPROVED | {timestamp} |
| Gate 1 | ✅ PASSED | APPROVED | {timestamp} |
| Gate 2 | ⏸️ PENDING | - | - |
| ... | ... | ... | ... |

---

## Resume Confirmation Script

When resuming, the AI should:

1. **Announce resume**:
   ```
   Resuming Legacy Analysis from Checkpoint {STEP_NUMBER}
   Last completed: Step {LAST_STEP}
   Next: Step {NEXT_STEP}
   ```

2. **Verify paths exist**:
   ```
   Check: {PROJECT_ROOT} exists
   Check: {ANALYSIS_ROOT}/work/ exists
   Check: gate-tracking.md exists
   ```

3. **Ask user to confirm**:
   ```
   Use AskUserQuestion:
   - Confirm checkpoint is correct
   - Ready to proceed with Step {NEXT_STEP}?
   - Or restart from earlier step?
   ```

---

## Session Metrics

| Metric | Value |
|--------|-------|
| Session Duration | {HH:MM} |
| Files Created | {N} |
| Files Modified | {N} |
| Lines Written | {N} |
| Context Used (estimate) | {N}K tokens |

---

*Checkpoint created by Legacy Analysis Orchestrator*
*Resume with: `/ai1st-arch-legacy-sys-analysis resume from Step {NEXT_STEP}`*
