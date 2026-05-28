# crm-salon-infantil Project Constitution

<!-- Always loaded by this constitution -->
@./general-overview.md
@./architecture.md

**Purpose**: Universal development principles that apply to ALL developers regardless of stack (frontend, backend, full-stack).
**Loaded by**: CLAUDE.md (always active)

**Stack-Specific Rules** (loaded separately per role):
- [Frontend Constitution](./constitution-frontend.md) - FE tech stack, commands, patterns
- [Backend Constitution](./constitution-backend.md) - BE tech stack, commands, patterns

---

## 1. Code Quality Standards

### 1.1 Code Organization
- **Modular feature/domain structure**: Organize code by feature/domain (events, clients, accounting, inventory, staff, sales, reports). NestJS modules on the backend; feature folders on the frontend.
- **Single Responsibility Principle**: Each module, component, or function has one clear purpose
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into shared libraries (`packages/`)
  - But prefer duplication over wrong abstraction
- **Root directory discipline**: **MUST NOT** create files in project root unless specifically requested
  - Root reserved for: `CLAUDE.md`, `README.md`, standard configs
  - Code files belong in appropriate source directories
  - Documentation belongs in `docs/` or designated doc folders

### 1.2 Code Style
- **Consistent formatting**: Follow existing conventions; enforce with ESLint + Prettier
- **Naming conventions**:
  - Files: `kebab-case` for general files; React components in `PascalCase.tsx`; NestJS files use dotted suffixes (`*.controller.ts`, `*.service.ts`, `*.module.ts`)
  - Types/interfaces/classes/React components: `PascalCase`
  - Functions, methods, variables: `camelCase`; constants `UPPER_SNAKE_CASE`
  - Descriptive names: Avoid abbreviations except standard ones (ID, URL, API)

### 1.3 Error Handling Philosophy
- **No silent failures**: All errors must be caught and handled explicitly
- **User-friendly error messages**: Display actionable messages to users
- **Structured logging**: Log errors with context (operation, timestamp, relevant data)
  - Include enough context for debugging but exclude sensitive data

### 1.4 Documentation Philosophy
- **Self-documenting code**: Code should be readable without comments
- **Comments for "why", not "what"**: Explain reasoning, not mechanics
- **Arc42 for architecture**: Use Arc42 template for system documentation
- **No personal information**: **MUST NOT** include person names in generated documentation

## 2. Security and Compliance

- **NEVER** store connection strings in code
- **NEVER** commit credentials to git
- Use configuration files / environment variables for credentials (environment-specific)
- Handle PII (client/guest contact data) with care
- API keys and payment-gateway secrets use environment variables
- Public invitation links must use unguessable tokens

## 3. Git Workflow Standards

### 3.1 Tracking Requirements
- **Tracking IDs**: Reference an issue/ticket ID in commits where one exists
- **Git Configuration**: Configure appropriate user.email and user.name
- **Work Logging**: Document tasks in `docs/ai/agent-work-files/`

### 3.2 Commit Messages
- **Conventional Commits** format: `type: description`
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- **NEVER** use `--no-verify` when committing

### 3.3 Branch Strategy
- **Feature branches**: Create branches for features and fixes
- **Main branch protection**: Never force push to `main` or `master`

## 4. Testing Requirements

- Tests MUST cover the functionality being implemented
- NEVER ignore test output - logs contain CRITICAL information
- TEST OUTPUT MUST BE PRISTINE TO PASS

---

**See Also**: general-overview.md and architecture.md (loaded via `@` above)
