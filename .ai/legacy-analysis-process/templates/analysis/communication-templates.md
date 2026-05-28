# Communication Templates

**Usage**: Use these templates for communicating status, errors, or limitations during the analysis process.

---

## 1. Human Intervention Required

**Use when**: A tool fails due to environment issues, missing dependencies, or permissions that the agent cannot resolve.

```markdown
## ⚠️ HUMAN INTERVENTION REQUIRED

**Error**: {exact error message}

**You need to**:
1. {action} - {download link if applicable}
2. Verify with: `{verification command}`

Reply "continue" when done, or "skip" to use AI-only analysis.
```

---

## 2. Known Limitation (Read-Only Enforcement)

**Use when**: Code issues block tool-based analysis, but you cannot modify the code (Read-Only rule).

```markdown
## Known Limitation: {Issue}

**Affected**: {project/file names}
**Cause**: {e.g., WSE 3.0 references prevent .NET 9 compilation}
**Impact**: Cannot run {tool name} on this component

**Workaround Applied**: Proceeding with AI-only analysis for this component.

**Recommendation for Future**: {what would need to change - documented only, not implemented}
```
