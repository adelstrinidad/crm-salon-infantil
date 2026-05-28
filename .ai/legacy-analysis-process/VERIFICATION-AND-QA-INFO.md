# Verification & Analysis Quality Assurance

**Audience**: AI Developers
**Scope**: End-to-end verification across the legacy modernization workflow
**Related**: [LEGACY-ANALYSIS-CHECKLIST.md](../../tams-docs/LEGACY-ANALYSIS-CHECKLIST.md), [README.md](README.md)

---

## Purpose

This document catalogs all verification methods, quality gates, and validation mechanisms across the legacy modernization workflow (ai1st-arch-legacy-sys-analysis / ai1st-arch-legacy-analysis-lite → ai1st-arch-legacy-to-modern-design / ai1st-arch-legacy-to-modern-design-lite → ai1st-dev-verify → ai1st-po-specify → ai1st-dev-plan → ai1st-dev-implement → ai1st-qa-verify-ui → ai1st-qa-e2e-web-test-plan). It maps each mechanism to a verification category and identifies coverage gaps.

---

## Philosophy: From Generative to Deterministic

AI can make mistakes and may miss important information in long-running analysis work. Validation methods wrap AI output in deterministic checks to make it reliable. The core sequence is a standard for self-correcting coding agents: **Generate → Execute → Validate → Refine**.

Every verification method in this document falls on a spectrum from fully deterministic (compiler says pass/fail) to probabilistic (AI self-critique). Effective agent design layers multiple methods: the deterministic ones catch hard errors, the probabilistic ones catch semantic drift.

In practice, agent workflows combine multiple categories — running linters, tests, and diffs in a loop until the system reaches a stable state. The categories below describe the individual verification methods that such workflows compose.

---

## Verification Categories

These seven categories of verification are used in agentic AI workflows, ordered from most deterministic (tool-based) to most probabilistic (AI-based):

| # | Category | Method | Determinism |
|---|----------|--------|-------------|
| 1 | Tool-Use Feedback Loops | Execute → read output → fix → repeat | High |
| 2 | Static Analysis & Linting | Parse against language/schema rules | High |
| 3 | Search-Before-Document Verification | Lookup before documenting (grep, search) | High |
| 4 | Differential & Regression Analysis | Compare before/after, detect drift | Medium |
| 5 | Chain-of-Thought & Constitutional Reflection | AI self-critique against rules | Low |
| 6 | Structured Output Validation | Enforce format, schema, naming, thresholds | Medium |
| 7 | Authoritative Context Grounding | Pre-load constitutions, glossaries, domain docs | High |

### Iterative Improvement Process

Categories verify a single run. To improve results across runs, the [Iterative Improvement Process](#iterative-improvement-process) defines a 5-step loop:

1. **Identify** — run the process, compare output against expected deliverables
2. **Fix one thing** — isolate a single change, create a new iteration folder
3. **Compare** — measure outputs quantitatively across iterations
4. **Validate** — run quality checks (QC-01..07, RG-1..4)
5. **Document** — update process docs, archive the previous iteration

Core principle: iteration without measurement is just guessing.

---

## Category 1: Tool-Use Feedback Loops (The "Interpreter" Pattern)

**Pattern**: The agent validates its own output by executing it in the environment and analyzing the result (stdout/stderr/exit code). If execution fails or produces unexpected output, the agent uses the error message to self-correct.

**Method**:
1. **Generate** — construct the command or code
2. **Execute** — invoke the tool in the environment
3. **Analyze** — inspect stdout, stderr, exit code
4. **Refine** — iterate on failure until the output is correct

**AI Developer's Checklist**:
- [ ] Does the agent execute its own output and check the result before proceeding?
- [ ] On failure, does the agent use the error message to retry with a corrected version?
- [ ] Is there a retry limit to prevent infinite correction loops?

**Standard Tools**:
- **Compilers/Interpreters**: `javac`, `python`, `node`, `go build`
- **Test Runners**: `pytest`, `junit`, `jest`
- **Terminal Output Analysis**: Reading stdout/stderr to verify the command did what was expected

### Present Implementation

| Command | Mechanism | Feedback Signal |
|---------|-----------|-----------------|
| ai1st-dev-implement | Implementation cycle: write code → run tests → read stderr → fix | Test pass/fail, coverage % |
| ai1st-dev-test | Execute test suite → read coverage report | Coverage ≥80% threshold |
| ai1st-qa-e2e-web-test-debug-and-fix | Run Selenium → capture failures → fix selectors → re-run | Test pass/fail, execution report |
| ai1st-arch-legacy-analysis-lite Guardrail 3 | `Select-String` (grep) → verify file exists → verify line ±5 | Match found / not found |
| ai1st-arch-legacy-analysis-lite Rule Extraction | Run 16 grep patterns → count matches → compare to thresholds | Pattern count vs minimum |
| ai1st-arch-legacy-sys-analysis Tool Setup (Step 02) | Install tools → run `cloc --version`, `pandoc --version` → verify output | Version string / command not found |
| ai1st-arch-legacy-sys-analysis Static Scan (Step 03) | Run SARIF (Static Analysis Results Interchange Format) scan → capture output → verify JSON schema compliance | Valid SARIF / parse error |
| ai1st-arch-legacy-sys-analysis Fix Verify (Step 06) | `dotnet build` → `dotnet test` → verify pass before accepting fix | Build success + tests pass |
| ai1st-arch-legacy-sys-analysis Prereq Chain (Step 08) | Check file exists → parse status marker → count BR-* IDs → verify ≥50 | Prerequisite met / EXIT with error |

### Missing & Opportunities

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| ai1st-arch-legacy-analysis-lite document generation has no execution feedback (markdown isn't "run") | Malformed tables, broken mermaid diagrams go undetected | Add `markdownlint` or mermaid parser |
| ai1st-arch-legacy-to-modern-design-lite markdown output not validated by any parser | Same as above | Same |
| ai1st-dev-plan API contracts not validated by OpenAPI linter | Invalid schemas pass through | Add `spectral lint` |

---

## Category 2: Static Analysis & Linting (Syntax Grounding)

**Pattern**: Before running code, the agent uses formalized rules to validate structure. This prevents "hallucinated syntax" — inventing methods that don't exist or using APIs incorrectly.

**Method**:
1. **Parse** — submit code to the analyzer
2. **Report** — collect violations with location and severity
3. **Fix** — correct issues before execution

**AI Developer's Checklist**:
- [ ] Is every output validated against formal rules before it is accepted?
- [ ] Do validation failures block the workflow, not just log a warning?
- [ ] Are the validation rules specific to this project, not generic defaults?

**Standard Tools**:
- **Linters**: `ESLint`, `Pylint`, `RuboCop`
- **Language Servers (LSP)**: VS Code `get_errors` — see exactly what the IDE sees
- **Security Scanners**: `SonarQube` for vulnerabilities and anti-patterns

### Present Implementation

| Command | Mechanism |
|---------|-----------|
| ai1st-arch-legacy-sys-analysis SARIF Validation (Step 03) | Validate scan output against SARIF 2.1.0 schema: ruleId, level, message, locations fields |
| ai1st-arch-legacy-sys-analysis Build Validation (Step 06) | `dotnet build` compile check before accepting AI-generated fixes |
| ai1st-arch-legacy-sys-analysis Unit Test (Step 06) | `dotnet test` regression check — no new failures introduced |
| ai1st-arch-legacy-sys-analysis JSON Validation (Step 08) | Verify `csharp-inventory.json` and `database-inventory.json` parse without errors |
| ai1st-arch-legacy-to-modern-design BRD Checklist (Step 03) | 45-point embedded validation: doc completeness, content quality, requirements quality, diagrams |
| ai1st-arch-legacy-to-modern-design Spec Conflict Detection (Step 06) | Compare new requirements against all existing specs; detect logical/behavioral/constraint conflicts |

### Missing & Opportunities

| Gap | Recommendation | Priority |
|-----|----------------|----------|
| No ESLint/TypeScript compiler check during ai1st-dev-implement | Add `tsc --noEmit` + `eslint` before ai1st-dev-verify | HIGH |
| No OpenAPI linter for ai1st-dev-plan contracts | Add `spectral lint` for contracts/ output | MEDIUM |
| No markdown linter for documentation | Add `markdownlint` for doc artifacts | MEDIUM |
| No SonarQube integration during ai1st-dev-verify | Add SonarQube scanner | MEDIUM |
| ai1st-arch-legacy-analysis-lite has no static analysis — LITE process skips Steps 03/06 | Use ai1st-arch-legacy-sys-analysis (full) for static analysis | INFO |

---

## Category 3: Search-Before-Document Verification (Fact Grounding)

**Pattern**: To prevent data hallucination (inventing libraries, versions, or filenames), the agent must look up facts rather than recall them. Every factual claim must be backed by a deterministic search result.

**Method**:
1. **Query** — search the filesystem or documentation
2. **Verify** — confirm the result exists
3. **Reference** — cite with file:line
4. **Document** — record only verified facts

**AI Developer's Checklist**:
- [ ] Is every factual claim (file path, version, term) backed by a search result?
- [ ] Does the agent look up facts with tools (grep, search) rather than recall them from memory?
- [ ] When a lookup finds no result, is the claim marked as unverified?

**Standard Tools**:
- **File System Search**: `grep_search`, `file_search`, `ls`
- **Documentation Lookups**: Fetching external docs or reading local `.md` context files
- **Import Analysis**: Tools scanning the workspace to see what libraries actually exist

### Present Implementation

| Command | Mechanism | What It Prevents |
|---------|-----------|-----------------|
| ai1st-arch-legacy-analysis-lite Code Reference Accuracy | Every `file#method():line` must be grep-verified before documentation. Format: `File#method():line → pattern date` | Hallucinated file paths, wrong line numbers |
| ai1st-arch-legacy-analysis-lite Guardrail 3 | Verify file exists, verify line ±5, verify method exists — all via `Select-String` | Fabricated code references |
| ai1st-arch-legacy-analysis-lite Gate 0.5 | Verify abbreviations against code (search for class/enum names) | Invented terminology |
| ai1st-arch-legacy-analysis-lite Rule Extraction Checklist | 16 grep patterns systematically scanning source | Missed business rules |
| ai1st-arch-legacy-analysis-lite UI Layer Scan | 4 mandatory JSP/HTML scan commands for eligibility patterns | Missed UI-layer rules |
| Constitution VIII-A | Code Reference Verification: grep-verified line numbers | Drifted line references |
| Constitution VIII-B | Semantic Status Mapping: verify business terms against Java enums | Conflated status types |
| QC-07 Endpoint Reconciliation | Cross-reference DEPENDENCIES.md endpoints against UC flow steps via grep | Missing prerequisite endpoints (implicit data flow dependencies) |
| CONTEXT.md | Index file linking to all relevant documents | AI inventing non-existent documents |
| ai1st-qa-verify-ui Verify UI | Extract live DOM styles/icons via Playwright capture scripts, compare against reference design artifacts | Visual drift, missed style/icon mismatches |
| ai1st-arch-legacy-sys-analysis Doc Lookup (Step 04) | Compare code findings against BRDs/design docs to distinguish bugs from documented trade-offs | Misclassifying intentional behavior as bugs |
| ai1st-arch-legacy-sys-analysis File Inventory (Step 05) | Cross-check sub-agent analyzed all files from `csharp-inventory.json` | Unanalyzed source files |
| ai1st-arch-legacy-sys-analysis Interview Cross-ref (Step 06) | Grep for business rules mentioned in stakeholder interviews against code | Undocumented tribal knowledge |
| ai1st-arch-legacy-to-modern-design KG-First Lookups | `search_nodes("FR-")`, `open_nodes(["BR-{id}"])`, `search_nodes("DTO-")` before defining specs | Duplicate/conflicting spec definitions |

### Missing & Opportunities

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| ai1st-arch-legacy-to-modern-design-lite INHERITED sections reference AS-IS section numbers but don't grep to confirm those sections exist | Broken cross-references | Grep-verify INHERITED section references against AS-IS docs |
| ai1st-po-specify spec.md FR/BR references not verified against LBR/BRS entries | Orphan requirement IDs | Grep-verify all FR-xxx/BR-xxx IDs against LBR/BRS |
| ai1st-dev-plan plan.md references to spec.md requirements not verified | Plan may reference non-existent FRs | Grep-verify plan references resolve |
| CONTEXT.md relative paths not validated | Broken cross-document links | Script to verify all relative paths resolve |

---

## Category 4: Differential & Regression Analysis

**Pattern**: When modifying existing systems, the "truth" is the current behavior. The agent validates that deviation is intentional (improvement) rather than accidental (regression) by comparing before and after states.

**Method**:
1. **Snapshot** — capture the current state
2. **Transform** — apply the changes
3. **Diff** — compare before and after
4. **Classify** — determine if each deviation is intentional or accidental

**AI Developer's Checklist**:
- [ ] Is the original state captured before the agent applies any changes?
- [ ] Is every difference between old and new explicitly reviewed or justified?
- [ ] Can the workflow detect behavioral changes even when the output looks the same?

**Standard Tools**:
- **Git Diffs**: Analyzing changes line-by-line
- **Behavioral Validators**: Run same inputs against old and new code, ensure outputs match

### Present Implementation

| Command | Mechanism | What It Detects |
|---------|-----------|-----------------|
| ai1st-arch-legacy-to-modern-design-lite Delta UC | INHERITED/DELTA/CHANGED/EXTENDED status per UC section | Explicit diff between AS-IS and TO-BE |
| ai1st-arch-legacy-to-modern-design-lite Delta Summary table | Mandatory comparison showing what changed and what didn't | Scope creep or missed changes |
| ai1st-qa-e2e-web-test-sync E2E Sync | Compare test implementation against test spec, identify drift | Test-spec divergence |
| RTM lifecycle | Traces AS-IS → TO-BE mapping across ai1st-arch-legacy-analysis-lite → ai1st-arch-legacy-to-modern-design-lite → ai1st-po-specify → QA | Coverage gaps in traceability |
| Appendix A.9 | Deterministic grep verifying in-scope files have ≥1 LBR reference | Unanalyzed source files |
| ai1st-qa-verify-ui Verify UI | Reference design (description.md, styles.json) vs live implementation — element-by-element comparison | Visual regressions, layout drift, style mismatches |
| ai1st-arch-legacy-sys-analysis Three-Source Synthesis (Steps 04-07) | Compare code reality vs. business docs vs. stakeholder interviews | Intent-reality gaps, undocumented features, tribal knowledge |
| ai1st-arch-legacy-sys-analysis Fix Regression (Step 06) | Scan before fix → count issues → scan after → verify count ≤ original | New issues introduced by AI fix |
| ai1st-arch-legacy-to-modern-design AS-IS → TO-BE Transform | Trace each AS-IS requirement to TO-BE design decision with rationale | Requirements lost in transformation |

### Missing & Opportunities

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No expected output saved for comparison: re-running ai1st-arch-legacy-analysis-lite on the same input cannot detect changes | AI drift between sessions undetected | Save output hash for comparison across re-runs |
| No version diff when updating documents (A.6 Iterative Refinement) | Changes not tracked systematically | Track changes via git diff on docs |
| No behavioral equivalence testing (legacy JSP and new Angular produce the same output). ai1st-qa-verify-ui covers visual parity but not functional parity. | Functional regressions in migration | Compare legacy output vs Angular for same inputs |
| ai1st-qa-e2e-web-test-debug-and-fix tests new code but doesn't compare behavior to legacy | Missing parity verification | Add parity verification step |

---

## Category 5: Chain-of-Thought & Constitutional Reflection

**Pattern**: The agent reviews its own reasoning against explicit rules before producing the final output. It self-critiques against the constitution and implicit quality standards.

**Method**:
1. **Plan** — outline the approach
2. **Draft** — generate the output
3. **Critique** — review the draft against explicit rules
4. **Finalize** — commit only if the critique passes

**AI Developer's Checklist**:
- [ ] Does the agent review its own output against explicit rules before finalizing?
- [ ] When the review finds a problem, does the agent revise and re-check?
- [ ] Is there an escalation path (e.g., human gate) when self-review keeps failing?

**Techniques**:
- **Self-Correction**: "Check the code you just wrote. Does it handle edge case X?"
- **Constitutional Checks**: Validate output against a constitution or ruleset

### Present Implementation

| Command | Mechanism | What It Enforces |
|---------|-----------|-----------------|
| Constitution (11 principles) | Behavioral guardrails — AI must self-check against principles before every response | READ-ONLY, privacy, gates, extraction accuracy |
| QC-01 to QC-05 | Five parallel validation sub-agents critique AI's own output after Step 1 | Completeness, accuracy, terminology, traceability, ID consistency |
| ai1st-dev-verify Verify | Code review against spec AND constitution | Implementation matches spec |
| ai1st-po-specify Socratic method | AI asks clarifying questions to reduce ambiguity in specs | Underspecified requirements |
| ai1st-arch-legacy-to-modern-design-lite Document hierarchy | Levels 1-4 (SRS → UC → spec → plan) force progressive refinement | Information at correct abstraction level |
| Constitution Principle Precedence | Tier 1-4 hierarchy for conflict resolution | Consistent behavior when principles conflict |
| Sub-Agent Context Propagation | Forces sub-agents to re-read constitution + glossary + directives before generating output | Context loss prevention |
| Constitution retry protocol | Max 2 retries per QC agent, then escalate to human | Prevents infinite AI loops |
| ai1st-arch-legacy-sys-analysis Data Privacy Strategy (Step 05) | User selects AI analysis mode (Full AI / Hybrid / Local Only); documented in ANALYSIS-STRATEGY-DECISION.md | Code not sent to AI without explicit consent |
| ai1st-arch-legacy-sys-analysis Three-Source Synthesis (Step 07) | Merge code analysis + docs + interviews; AI critiques own findings against all three | Prevents single-source bias |
| ai1st-arch-legacy-to-modern-design Autonomous ADR Docs | Between Gate 1 and Gate 2, uncertain decisions documented as ADRs (not asked) | Decisions recorded even without human review |

### Limitations

| Limitation | Description |
|------------|-------------|
| Probabilistic | AI self-critique can miss the same error it made (blind spots) |
| Not reproducible | Same prompt may produce different critique results |
| Constitution compliance is voluntary | The AI follows the constitution because it's prompted to, not because it's enforced by tooling |

---

## Category 6: Structured Output Validation

**Pattern**: The agent must produce machine-parseable output, not free-form text. Every output must conform to a predefined structure with required fields, naming conventions, and size thresholds.

**Method**:
1. **Define** — specify the schema, template, or naming convention
2. **Generate** — produce the output
3. **Validate** — check the output against the schema
4. **Accept or Reject** — gate decision based on pass/fail

**AI Developer's Checklist**:
- [ ] Is every expected output defined by a schema, template, or naming convention?
- [ ] Are pass/fail decisions made by code, not by AI judgment?
- [ ] Does every threshold have a numeric target (e.g., ≥80%, >1KB)?

**Standard Tools**:
- **Schema Validators**: `zod`, `pydantic` — ensure JSON has all required fields
- **Gate Checks**: Programmatic checks that verify artifacts exist (e.g., "File X must exist and be > 1KB")

### Present Implementation

| Command | Mechanism | Threshold |
|---------|-----------|-----------|
| ai1st-arch-legacy-analysis-lite File Naming | MANDATORY `{DOCTYPE}-{module}.md` pattern | Reject if non-compliant |
| ai1st-arch-legacy-analysis-lite Output Checklist | 11 specific files must exist (Section 3.6) | All items checked |
| ai1st-arch-legacy-to-modern-design-lite Output Structure | Specific folder hierarchy: `arch-to-be-lite/specs/{story}/` | Structure validated |
| QC-06 Rule Coverage | `documented rules / actual reject() calls` | ≥80% |
| QC-06 Line Ref Accuracy | All file:line references grep-verified | 100% |
| QC-06 ID Consistency | BR-IDs match across BRS/RTM/LBR | 100% |
| QC-06 test.md Exists | test.md is mandatory output | File must exist |
| Guardrail 1 Source Coverage | `scanned paths / in-scope paths` | ≥90% |
| Guardrail 2 Rule Count | Min/max rules per module size | Within range |
| Guardrail 4 UI Coverage | `UI rules documented / UI patterns found` | ≥70% |
| Constitution Output Checklist | File exists, >100 lines, no TBD/TODO, file:line present, template compliance | All criteria met |
| Appendix A.5 Validation Commands | 5 PowerShell scripts for scope, counts, formats, sizes | Run post-analysis |
| ai1st-arch-legacy-sys-analysis Sub-Agent Output Checklist | File exists, >100 lines, no TBD/TODO, file:line present, template compliance | All criteria met |
| ai1st-arch-legacy-sys-analysis BR Catalog Structure | BR-ID format, coverage metrics, status ✅ COMPLETE marker | ≥50 rules extracted |
| ai1st-arch-legacy-sys-analysis Gate 6 Pre-Flight | 6 summary docs + 13 Arc42 sections + .docx >1MB + no duplicates | All items present |
| ai1st-arch-legacy-sys-analysis Prerequisite Chains | Step N outputs must exist before Step N+1 starts; EXIT with error if missing | File exists + status parsed |
| ai1st-arch-legacy-to-modern-design Step Success Criteria | 10 step-level checklists with specific deliverable requirements | All steps pass |
| ai1st-arch-legacy-to-modern-design Arc42 Completeness | 12 Arc42 TO-BE sections must be populated before Gate 2 | All 12 sections present |
| ai1st-arch-legacy-to-modern-design BRD 45-Point Checklist | Embedded validation: doc completeness, content quality, requirements, diagrams, review status | All 45 points checked |
| ai1st-arch-legacy-to-modern-design UC 11-Point Checklist | Folder, naming, sections, traceability, IDs, NFRs, acceptance criteria, no placeholders | All 11 points checked |

### Missing & Opportunities

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No JSON schema validation for structured outputs (RTM tables, DTO interfaces) | Format inconsistencies | Define RTM table schema, validate programmatically |
| No machine-parseable output format — all validation is markdown + PowerShell | Cannot integrate into CI pipeline | Create pipeline running Appendix A.5 scripts on PR |

---

## Category 7: Authoritative Context Grounding

**Pattern**: The agent loads verified, domain-specific knowledge into its context before generation begins. Instead of relying on training data (which may be outdated or wrong for the domain), it is given authoritative source documents that define the boundaries of correct output.

**Method**:
1. **Load** — read context files (constitution, glossary, scope)
2. **Ground** — establish terminology and constraints
3. **Generate** — produce output within those boundaries
4. **Verify** — check that output references match the loaded context

**AI Developer's Checklist**:
- [ ] Is authoritative context (constitution, glossary, scope) loaded before the agent starts generating?
- [ ] Is there a check that the agent actually read the context, not just received it?
- [ ] Are domain terms used consistently across all agents and sessions?

**Standard Tools**:
- **Constitution Files**: MUST/MUST NOT constraint rulesets
- **Glossaries**: Single source of truth for domain terminology
- **Business Context Documents**: Project scope, stakeholder requirements, domain models
- **Technical Context Documents**: Architecture decisions, technology stack constraints
- **Knowledge Graph Bootstrap**: Ground-truth terms in session memory for runtime lookup

### Present Implementation

| Command | Mechanism | What It Grounds |
|---------|-----------|-----------------|
| CLAUDE.md imports | Loads constitution, general-overview, architecture at session start | Technology stack, coding standards, project principles |
| ai1st-arch-legacy-analysis-lite Constitution loading | 11 principles loaded before any analysis step | READ-ONLY, privacy, gates, extraction accuracy |
| ai1st-arch-legacy-analysis-lite Glossary.md | Mandatory read before terminology extraction; Gate 0.5 verifies alignment | Domain terminology (prevents term drift) |
| ai1st-arch-legacy-analysis-lite PROJECT-SCOPE.md §3-§5 | Module scope, in-scope files, business context | Analysis boundaries and domain knowledge |
| ai1st-arch-legacy-analysis-lite KG Bootstrap | Load glossary and PROJECT-SCOPE terms into Knowledge Graph at session start | Runtime terminology resolution against verified definitions |
| ai1st-arch-legacy-analysis-lite Sub-agent context propagation | Forces sub-agents to re-read constitution + glossary before generating output | Prevents context loss across agent boundaries |
| ai1st-arch-legacy-to-modern-design-lite CONTEXT.md | Index file linking to all relevant AS-IS documents and design decisions | Prevents AI inventing non-existent source documents |
| ai1st-qa-verify-ui Verify UI | Loads reference design artifacts (description.md, styles.json, design-system.md) before comparison | Visual and structural ground truth for implementation review |
| ai1st-dev-verify Verify | Loads spec.md + constitution as review criteria before code review | Ensures review against authoritative requirements, not model memory |
| ai1st-po-specify Specify | Loads constitution and existing project context before spec generation | Feature specs aligned with project standards |
| ai1st-arch-legacy-sys-analysis Gate 0 Business Context | Collect usage statistics, BRDs, architecture docs BEFORE any code analysis | Business priority drives analysis focus |
| ai1st-arch-legacy-sys-analysis Session Management | 5 mandatory `/clear` points with KG resume protocol; restore variables via `open_nodes` | Context preservation across 11-16 hour process |
| ai1st-arch-legacy-sys-analysis Step File Loading | Each of 9 steps reads its instruction file from `.ai/legacy-analysis-process/` before executing | Step-specific methodology grounding |
| ai1st-arch-legacy-to-modern-design Phase 1 Context Loading | Reads SRS, MODERNIZATION-STRATEGY, PROJECT-SCOPE, angular-frontend-constitution before design | Technology decisions, standards, business context |
| ai1st-arch-legacy-to-modern-design Gate 1 Modernization Options | Approve technology stack and strategy before detailed design (Steps 02-09) | Architecture decisions anchored in approved strategy |

### Missing & Opportunities

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| No verification that agents actually READ context files (compliance is voluntary) | Agent may skip context loading without detection | Add read-receipt check (grep for loaded file references) |
| No staleness check on context documents (constitution, glossary may be outdated) | Using outdated context documents propagates errors | Add last-modified date validation |
| ai1st-arch-legacy-to-modern-design-lite does not verify consistency between AS-IS context docs and TO-BE outputs | Inherited assumptions may contradict updated decisions | Cross-check inherited assumptions |
| ai1st-dev-implement implementation has no mandatory context loading step | Developer agent may generate code without reading constitution | Add constitution read to ai1st-dev-implement preamble |

---

## Human Verification Gates

Strategic decisions that require explicit human judgment. Gates are BLOCKING — the process stops until approved.

| Gate | Location | What Is Verified | Approver |
|------|----------|-----------------|----------|
| Gate 0 | ai1st-arch-legacy-sys-analysis Step 01 | Business context availability (usage stats, BRDs, arch docs) | PO/BA + Stakeholder |
| Gate 0.5 | ai1st-arch-legacy-analysis-lite | Terminology matches source code | PO/BA + Stakeholder |
| Gate 1 | ai1st-arch-legacy-sys-analysis Step 02 | Tool setup verification, analysis scope confirmed | PO/BA |
| Gate 1 | ai1st-arch-legacy-analysis-lite | QC agent results, findings counts, coverage | PO/BA |
| Gate 2 | ai1st-arch-legacy-sys-analysis Step 04 | AI findings + documentation gap analysis + component strategy | PO/BA + Architect |
| Gate 3 | ai1st-arch-legacy-sys-analysis Step 05 | Component analysis prioritization, data privacy strategy | PO/BA |
| Gate 4 | ai1st-arch-legacy-sys-analysis Step 06 | Stakeholder interview validation, human review accuracy | PO/BA |
| Gate 5 | ai1st-arch-legacy-sys-analysis Step 08 | Quality validation — all prerequisites, BR catalog, file checks | PO/BA |
| Gate 6 | ai1st-arch-legacy-sys-analysis Step 09 | Summary documentation — 6 summaries, 13 Arc42 sections, .docx | PO/BA + Stakeholder |
| Gate 1 | ai1st-arch-legacy-to-modern-design Step 01 | Modernization options — technology stack, strategy, risks | Architect + PO |
| Gate 2 | ai1st-arch-legacy-to-modern-design Step 10 | Final TO-BE architecture — all Arc42, BRD, specs, test plans | Exec Sponsor + PO + Architect |
| Architect Review | Checklist 3.7 | MODERNIZATION-STRATEGY technical decisions | Solution Architect |
| QA Review | Checklist 4.8 | TEST-MIGRATION locator mappings, data-testid conventions | QA Lead |
| ai1st-dev-verify Verify | Checklist 5.3 | Code review vs spec + constitution | Developer |
| ai1st-qa-verify-ui Verify UI | Post-impl | Visual + structural comparison of implementation vs reference design | Developer + UI/UX |

### Gate Enforcement

| Rule | Description |
|------|-------------|
| No self-approval | AI cannot approve its own work at gates |
| No skipping | Gate skip requests must be declined (Constitution Principle III) |
| Audit trail | All approvals recorded with timestamp and channel |
| Blocking | Downstream commands cannot start without gate approval |

### Gate Dependencies

**ai1st-arch-legacy-sys-analysis (Full) flow:**
```
Gate 0 → Gate 1 → Gate 2 → Gate 3 → Gate 4 → Gate 5 → Gate 6 → ai1st-arch-legacy-to-modern-design
```

**ai1st-arch-legacy-analysis-lite (LITE) flow:**
```
Gate 0.5 → Gate 1 → Architect Review → ai1st-arch-legacy-to-modern-design-lite → QA Review → ai1st-dev-implement → ai1st-dev-verify → ai1st-qa-verify-ui → ai1st-qa-e2e-web-test-plan
```

**ai1st-arch-legacy-to-modern-design (Full) flow:**
```
Gate 1 (Modernization Options) → Steps 02-09 (autonomous) → Gate 2 (Final Architecture)
```

---

## Quality Checks & Guardrails (ai1st-arch-legacy-analysis-lite)

Automated validation mechanisms for ai1st-arch-legacy-analysis-lite LITE analysis. Quality Checks (QC) are sub-agents; Guardrails (RG) are threshold checks.

### Quality Checks

QC-01 to QC-05 run in parallel after Step 1, before Gate 1. QC-06 and QC-07 run post-generation.

| Agent | Purpose | Method | Threshold |
|-------|---------|--------|-----------|
| QC-01 | Completeness check | Compare outputs vs expected document list | All documents present |
| QC-02 | Accuracy (10% sample) | Sample code references, grep-verify | 100% sample accuracy |
| QC-03 | Terminology match | Compare terms against Glossary.md | Zero mismatches |
| QC-04 | Traceability chains | Verify BR → SR → UC → test chains | No broken chains |
| QC-05 | ID Consistency | Cross-document BR-ID/SR-ID matching (PowerShell script) | Zero orphan IDs |
| QC-06 | Coverage Audit | Rule coverage, line ref accuracy, test.md exists (post-generation) | ≥80% rules, 100% refs |
| QC-07 | Endpoint Reconciliation | Cross-reference DEPENDENCIES endpoints vs UC flow steps (post-generation) | 0 missing endpoints |

### Guardrails

Automated threshold checks that run during analysis, not at gates.

| Guardrail | Check | Trigger | Action |
|-----------|-------|---------|--------|
| RG-1 | Source Coverage | `scanned / in-scope < 90%` | ERROR — stop and rescan |
| RG-2 | Rule Count Sanity | Outside min/max range for module size | WARN — rescan or review for duplicates |
| RG-3 | Hallucination Prevention | File/line/method not found by grep | ERROR — do not document reference |
| RG-4 | UI Layer Coverage | `UI rules documented / UI patterns < 70%` | WARN — rescan UI layer |

### Retry Protocol

- Maximum 2 retries per QC agent
- After 2nd failure with TBD/TODO: escalate to human at current gate
- Mark partial results as INCOMPLETE and proceed to gate review

---

## Verification Completeness Matrix

How each workflow command is covered across the 7 categories:

| Command | Cat 1 (Exec) | Cat 2 (Lint) | Cat 3 (Lookup) | Cat 4 (Diff) | Cat 5 (CoT) | Cat 6 (Schema) | Cat 7 (Context) |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| ai1st-arch-legacy-sys-analysis AS-IS (Full) | Tool loops, SARIF, build/test | SARIF, build, JSON | Doc lookup, inventory, interview cross-ref | Three-source synthesis, fix regression | Privacy strategy, three-source critique | Sub-agent checklist, BR catalog, Gate 6 Pre-Flight | Gate 0 biz context, session mgmt, step file loading |
| ai1st-arch-legacy-analysis-lite AS-IS (LITE) | Grep loops | — | Grep-verify all refs, QC-07 | A.9 coverage check | QC-01..05, Constitution | File naming, thresholds, QC-07 | Constitution, Glossary, PROJECT-SCOPE, KG bootstrap |
| ai1st-arch-legacy-to-modern-design TO-BE (Full) | — | BRD checklist, spec conflict | KG-First lookups | AS-IS → TO-BE transform | Autonomous ADR docs | Step criteria, Arc42, BRD 45pt, UC 11pt | Phase 1 context, Gate 1 strategy |
| ai1st-arch-legacy-to-modern-design-lite TO-BE (LITE) | — | — | CONTEXT.md index | Delta UC tracking | Constitution, Socratic | Output structure, checklists | CONTEXT.md, AS-IS docs, Constitution |
| ai1st-po-specify Specify | — | — | — | — | Socratic dialogue | spec-template compliance | Constitution, project context |
| ai1st-po-capture-ui Capture | Screenshot capture | — | Live DOM extraction | — | Observation-based rules | Folder structure, naming | — |
| ai1st-dev-plan Plan | — | — | — | — | Constitution check | plan-template compliance | Constitution, spec.md |
| ai1st-dev-tasks Tasks | — | — | — | — | Dependency ordering | tasks-template format | — |
| ai1st-dev-implement Implement | Implementation loop | — | — | — | — | Coverage ≥80% | — |
| ai1st-dev-test Test | Test execution | — | — | — | — | Coverage report | — |
| ai1st-dev-verify Verify | — | — | — | — | Review vs spec + const | Verification report format | Constitution, spec.md |
| ai1st-qa-verify-ui Verify UI | Playwright capture | — | Live DOM extraction | Ref design vs impl diff | Describe-compare-classify | Severity, report template | Design artifacts, design-system.md |
| ai1st-qa-e2e-web-test-plan E2E Plan | — | — | — | — | Black-box from ACs | Test plan format | — |
| ai1st-qa-e2e-web-test-generate E2E Gen | — | — | data-testid lookup | — | — | Spec reference headers | — |
| ai1st-qa-e2e-web-test-debug-and-fix E2E Fix | Selenium execution | — | — | — | — | Execution report | — |
| ai1st-qa-e2e-web-test-sync E2E Sync | — | — | — | Spec vs impl drift | — | Updated spec format | — |

**Legend**: Filled cells = verification present. `—` = not present.

---

## Iterative Improvement Process

**Core principle**: Iteration without measurement is just guessing. A successful run does not mean correct output — quantitative comparison across iterations makes problems visible.

### The 5-Step Loop

1. **Identify** — Run the process on a known module, compare output against expected deliverables. Look for missing sections, conflicting instructions, incomplete extractions, template issues.
2. **Fix one thing** — Isolate a single change (one instruction, template, or step). Create a new iteration folder (e.g., `module-v25/`). Run the same source code against the new output folder.
3. **Compare quantitatively** — Measure outputs across iterations using the comparison table below. If a metric drops, the change broke something.
4. **Validate** — Run quality checks (QC-01 to QC-07, Guardrails RG-1 to RG-4). Validation catches what iteration alone misses — one test showed 57% rule extraction without validation vs 100% with it.
5. **Document** — Update process docs, sync templates, add changelog entries, archive the previous iteration as a baseline.

### Key Metrics

| Metric | Description |
|--------|-------------|
| Business rules count | Number of BR-IDs extracted |
| Functional requirements count | Number of FR-IDs extracted |
| System requirements count | Number of SR-IDs extracted |
| File count | Number of deliverable files generated |
| Total size | Combined output size in KB |
| Validation status | QC/Guardrail pass or fail |
| Coverage percentage | Rules documented / rules found in code |

### Comparison Table Template

Use this template to track iterations of process improvement:

| Metric | Baseline | v1 | v2 | v3 | Notes |
|--------|----------|----|----|----|----- |
| **AS-IS Output** |
| Files generated | | | | | |
| Total size | | | | | |
| Business rules | | | | | |
| Functional reqs | | | | | |
| System reqs | | | | | |
| **TO-BE Output** |
| Files generated | | | | | |
| Delta UCs | | | | | |
| **Validation** |
| QC/Guardrail status | | | | | |
| Issues found | | | | | |

### Insights

- **Small changes, frequent runs** — do not batch multiple fixes into one iteration
- **Numbers don't lie** — if BR count drops, something broke
- **Validation is mandatory** — "runs successfully" does not mean correct output
- **Keep baselines** — archive every iteration for comparison
- **Path robustness** — test with different output paths to catch hardcoded assumptions

For the full standalone process guide with examples, see [ITERATIVE-IMPROVEMENT-PROCESS.md](./ITERATIVE-IMPROVEMENT-PROCESS.md).

---

*Version: 1.3 | Created: 2026-02-10 | Updated: 2026-02-18*
*Changes v1.3: Added "Iterative Improvement Process" chapter with 5-step loop, key metrics, comparison table template, and insights. Cross-references full standalone guide.*
*Changes v1.2: Restructured for prompt engineers building agents. Added Philosophy section. Standardized all 7 categories with Pattern/Method/Checklist/Tools framing. Renamed table headings to "Present Implementation" and "Missing & Opportunities" with Recommendation columns. Removed Phase column from all tables. Merged standalone "Coverage Gaps" section into category tables. Merged "AI Guardrails" into "Quality Checks & Guardrails" section. Removed "Verification by Workflow Phase" section (redundant with Completeness Matrix). Removed "Deterministic Scripts" section (belongs in command runbooks). Fixed terminology: Railguard → Guardrail, expanded SARIF, renamed "Retrieval Augmented Verification" → "Search-Before-Document Verification". Fixed sentence structure across Pattern descriptions and table cells.*
*Changes v1.1: Added ai1st-arch-legacy-sys-analysis/ai1st-arch-legacy-to-modern-design full-process coverage across all 7 categories. Added Human Gates (15 gates), QC agents, Guardrails, Completeness Matrix. Added Category 7 (Authoritative Context Grounding). Added ai1st-qa-verify-ui Verify UI and QC-07 Endpoint Reconciliation.*
*Changes v1.0: Initial document with 6 verification categories, ai1st-arch-legacy-analysis-lite/ai1st-arch-legacy-to-modern-design-lite coverage, and gap analysis.*
