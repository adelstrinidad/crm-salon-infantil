# Claude Code Configuration - {PROJECT}

<!-- Import shared project guidance -->
@../.ai/0_core_memory/coding-standards.md
<!-- Always loaded: constitution imports general-overview.md + architecture.md -->
@../.ai_project_memory/constitution.md
<!-- Stack-specific (load one per role): -->
@../.ai_project_memory/constitution-frontend.md
@../.ai_project_memory/constitution-backend.md
<!-- Workflow-specific (load when needed): -->
<!-- @../.ai_project_memory/legacy-analysis-constitution.md -->

## Project Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `{PROJECT_ROOT}` | *(set to your project root)* | Source code repository root (where Claude is launched) |
| `{ANALYSIS_ROOT}` | *(per invocation)* | Analysis output location — provided as /ai1st-arch-legacy-analysis-lite or /ai1st-arch-legacy-to-modern-design-lite skill argument |

**Important locations:**
- Project overview: `.ai_project_memory/general-overview.md` - Project context and identity
- System architecture: `.ai_project_memory/architecture.md` - Integration points, data architecture, security
- Core standards: `.ai/0_core_memory/` - Coding standards, security rules
- Template definitions: `.ai/2_templates/` - Templates for files to be used by AI
- Project memory: `.ai_project_memory/` - Project specific context e.g. constitutions and tech stack information
- Project constitutions: `.ai_project_memory/*-constitution.md` - Domain-specific rules (Backend, Frontend, Legacy Analysis)
- Legacy analysis output: `{ANALYSIS_ROOT}/` - Arc42 documentation (AS-IS/TO-BE)
  - `{ANALYSIS_ROOT}/work/` - Analysis artifacts
  - `{ANALYSIS_ROOT}/arch-as-is/` - Current system Arc42 docs

## Boundaries

### Always Do
- Run lint before committing
- Run tests before submitting PRs
- Follow existing code patterns and conventions
- Read `.ai_project_memory/` for project context

### Ask First
- Major architectural changes
- Adding new dependencies
- Modifying shared components
- Database schema changes

### Never Do
- Commit secrets, API keys, or credentials
- Modify `.env.production` or production configs
- Push directly to main/master branch
- Delete or modify vendor directories
- Skip tests or linting

## Claude-Specific Features

### Sub-Agent Delegation (Task Tool)
Agents in `.claude/agents/.ai/*.md`:
- **architecture-agent** (opus) - Plan and write ADRs, diagrams, trade-offs
- **documentation-agent** (haiku) - Write API docs, guides
- **verification-agent** (sonnet) - Post-impl verification, bug reports with fixes

**Orchestration**:
- **PARALLEL** (single message, multiple Tasks): Analysis+Documentation, verify+other (read-only)
- **SEQUENTIAL** (wait): Architecture→Dev→Verify→Docs
- **DIRECT** (no agent): <50 lines, configs, quick fixes, <2min tasks

### TodoWrite
**Purpose**: Runtime orchestration tracking only (NOT planning)

**Use**: Long orchestration >10min, coordinating agents, runtime breakdown when no plan exists
**Skip**: Simple work, planning (markdown first)

### Code References
When referencing code, use `file_path:line_number` format:
```
Example: "Address lookup in {SearchService}.cs:142"
```

## Knowledge Management Strategy

**Source of Truth: Git-Versioned Files** (shared with team)

### Knowledge Base Locations

1. **`{ANALYSIS_ROOT}/`** - Arc42 documentation (see Project Variables above)
   - `arch-as-is/` - Current system documentation (13 sections)
   - `arch-to-be/` - Target system documentation (13 sections)
   - `work/` - Analysis artifacts (numbered by step: 01-reconnaissance/, 03-metrics/, etc.)
   - `work/09-summaries/` - Executive summaries

2. **`.ai/0_core_memory/`** - Core standards
   - `coding-standards.md` - Coding standards
   - `security-rules.md` - Security rules
   - `tech-stack.md` - Technology stack

3. **`.ai_project_memory/`** - Project context and knowledge
   - `general-overview.md` - Project overview and identity
   - `constitution.md` - Universal development principles
   - `architecture.md` - System architecture and integration points
   - `constitution-frontend.md` - FE tech stack, commands, patterns
   - `constitution-backend.md` - BE tech stack, commands, patterns

4. **`docs/ai/agent-work-files/`** - Work logs (append-only)

### Knowledge Graph MCP: Session Helper Only

**Use Knowledge Graph For**:
- Temporary session notes during active work
- Quick lookups within current session
- Brainstorming and exploration

**Do NOT Use Knowledge Graph For**:
- Long-term knowledge (use git files instead)
- Team-shared knowledge (not git-versioned)
- Source of truth (files are source of truth)

---
