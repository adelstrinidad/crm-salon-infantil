# Analysis Artifacts

**Status**: PLACEHOLDER - Populated during legacy analysis

This folder contains outputs from each step of the legacy analysis process.

## Folder Structure

| Folder | Process Step | Contents |
|--------|--------------|----------|
| `01-reconnaissance/` | Step 01 | Technology inventory, codebase overview |
| `02-environment/` | Step 02 | Environment reports, tool setup status |
| `03-metrics/` | Step 03 | Code metrics, static analysis reports, inventories |
| `04-findings/` | Step 04 | AI findings analysis, documentation gaps |
| `05-analysis/` | Step 05 | Component analysis (organized by tier) |
| `06-review/` | Step 06 | Human review gates, validation checkpoints |
| `07-synthesis/` | Step 07 | Requirements synthesis, user stories |
| `08-validation/` | Step 08 | Quality validation reports |
| `09-summaries/` | Step 09 | Executive summaries, final reports |

## Component Analysis Structure (05-analysis/)

```
05-analysis/
├── csharp/          # C#/.NET component analysis (SA-01 to SA-07)
├── database/        # Database analysis (SA-11 to SA-16)
└── integration/     # Integration analysis (SA-21 to SA-23)
```

## Naming Conventions

- **SA-XX** - System Analysis document (e.g., SA-01-common-libraries.md)
- **UPPERCASE.md** - Summary documents (e.g., METRICS-SUMMARY.md)
- **.json** - Machine-readable inventories (e.g., csharp-inventory.json)
- **.SA-XX-complete** - Completion marker files

## How to Populate

Follow the process in `../process/as-is-brownfield/` to generate these artifacts.
