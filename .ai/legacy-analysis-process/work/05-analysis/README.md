# Step 05: Component Analysis Artifacts

**Process Step**: [05-component-analysis.md](../../process/as-is-brownfield/steps/05-component-analysis.md)

## Structure

```
05-analysis/
├── csharp/          # C#/.NET component analysis
│   ├── SA-01-*.md   # Common libraries
│   ├── SA-02-*.md   # Search services
│   ├── SA-03-*.md   # Update services
│   ├── SA-04-*.md   # Sync components
│   ├── SA-05-*.md   # SNS integration
│   ├── SA-06-*.md   # Tools and utilities
│   └── SA-07-*.md   # UI layer
│
├── database/        # Database analysis
│   ├── SA-11-*.md   # Functions
│   ├── SA-12-*.md   # Packages
│   ├── SA-13-*.md   # Procedures
│   ├── SA-14-*.md   # Tables
│   ├── SA-15-*.md   # Trunk DB code
│   └── SA-16-*.md   # Trunk procedures
│
└── integration/     # Integration analysis
    ├── SA-21-*.md   # Database integration
    ├── SA-22-*.md   # Web services
    └── SA-23-*.md   # File/queue integration
```

## Naming Convention

- **SA-XX-component-name.md** - System Analysis document
- **.SA-XX-complete** - Completion marker (hidden file)

## Status

- [ ] C# components analyzed (SA-01 to SA-07)
- [ ] Database objects analyzed (SA-11 to SA-16)
- [ ] Integrations analyzed (SA-21 to SA-23)
