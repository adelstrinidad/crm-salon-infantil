# PL/SQL Static Analysis Setup

**Purpose**: Set up PLSQLCop and SQL Developer for Oracle PL/SQL analysis

**Tech Stack**: Oracle PL/SQL, Oracle Database 11g-21c

## Prerequisites

- Oracle SQL Developer or SQL*Plus
- Java 8+ (for PLSQLCop)
- Access to PL/SQL source code (.sql, .pls, .pks, .pkb files)

## Installation Steps

### Option 1: Oracle SQL Developer (Built-in)

SQL Developer includes built-in code analysis capabilities.

1. **Download SQL Developer**: https://www.oracle.com/tools/downloads/sqldev-downloads.html
2. **No additional installation needed** - code inspector is built-in

### Option 2: PLSQLCop (tvdtool) - Open Source

```bash
# Download PLSQLCop
mkdir -p C:\tools\plsqlcop
cd C:\tools\plsqlcop

# Download from https://www.salvis.com/blog/plsqlcop/
# Or install via Homebrew (macOS/Linux)
brew install tvdtool/homebrew-salvis/plsqlcop
```

### Option 3: SonarQube PL/SQL Plugin (Commercial)

See [Backend COBOL Setup](backend-cobol.md) for SonarQube installation instructions.

## Configuration

### SQL Developer Code Inspector

**Enable Code Inspector**:
1. Tools → Preferences → Code Editor → PL/SQL Code Insight
2. Enable "Show code insight parameters"
3. Tools → Preferences → Code Editor → Code Rules
4. Enable desired rule sets

**Export Settings**:
```sql
-- Export code inspector settings
-- File → Export → Preferences
```

### PLSQLCop Configuration

Create `.plsqlcop.json` in project root:

```json
{
  "rules": {
    "naming": {
      "package_name": "^[A-Z][A-Z0-9_]*$",
      "procedure_name": "^[a-z][a-z0-9_]*$",
      "function_name": "^[a-z][a-z0-9_]*$",
      "variable_name": "^l_[a-z][a-z0-9_]*$",
      "constant_name": "^c_[A-Z][A-Z0-9_]*$",
      "parameter_name": "^p_[a-z][a-z0-9_]*$"
    },
    "complexity": {
      "max_procedure_lines": 100,
      "max_parameters": 5,
      "max_nesting_depth": 5
    },
    "quality": {
      "require_exception_handling": true,
      "require_package_body": true,
      "avoid_select_star": true
    }
  },
  "excludes": [
    "test/**",
    "migration/**"
  ]
}
```

## Running Analysis

### Using SQL Developer

1. **Open PL/SQL file** in SQL Developer
2. **Right-click in editor** → "Run Code Inspection"
3. **Review results** in "Code Inspector" panel
4. **Export results**: Right-click results → Export

**Command-Line (SQL Developer CLI)**:
```bash
# Using SQL Developer command-line runner
sqldeveloper.exe /noreopen /migrate /inspect <source_directory> /output <report.html>
```

### Using PLSQLCop

```bash
# Analyze single file
plsqlcop check MyPackage.pks

# Analyze directory
plsqlcop check {SOURCE_ROOT}Db/

# Generate JSON report
plsqlcop check {SOURCE_ROOT}Db/ --format json --output artifacts/02-metrics/plsqlcop-report.json
```

### Using SQL*Plus for Basic Syntax Check

```sql
-- Compile and capture errors
SET SERVEROUTPUT ON
SET ECHO ON
SPOOL artifacts/02-metrics/plsql-compile-errors.log

@{SOURCE_ROOT}Db/packages/MY_PACKAGE.pks
SHOW ERRORS

@{SOURCE_ROOT}Db/packages/MY_PACKAGE.pkb
SHOW ERRORS

SPOOL OFF
```

## Key PL/SQL Quality Rules

### Naming Conventions

- **Packages**: UPPER_CASE
- **Procedures/Functions**: lower_case
- **Local variables**: `l_variable_name`
- **Constants**: `c_CONSTANT_NAME`
- **Parameters**: `p_parameter_name`
- **Cursors**: `c_cursor_name`
- **Types**: `t_type_name`

### Code Quality Checks

- **Exception Handling**: All procedures should have exception blocks
- **SELECT INTO**: Must have exception handler for NO_DATA_FOUND and TOO_MANY_ROWS
- **Avoid SELECT ***: Specify columns explicitly
- **Use Bulk Collect**: For processing multiple rows
- **Limit Cursor Loop**: Avoid infinite loops
- **Close Cursors**: Always close explicitly opened cursors

### Performance Checks

- **Avoid COMMIT in loops**: Batch commits
- **Use BULK COLLECT**: Instead of row-by-row processing
- **Avoid Dynamic SQL**: When static SQL is possible
- **Index usage**: Ensure queries use appropriate indexes

## Verification

### Test PLSQLCop Installation

```bash
# Check version
plsqlcop --version

# Test on sample package spec
@"
CREATE OR REPLACE PACKAGE test_pkg AS
  PROCEDURE test_proc(p_id IN NUMBER);
END test_pkg;
/" | Out-File test.pks -Encoding UTF8

plsqlcop check test.pks
Remove-Item test.pks
```

### Test SQL Developer

```sql
-- Test code inspector
-- Open SQL Developer → Tools → Code Inspector
-- Should show available rule sets
```

## Output Format

### SQL Developer
- HTML report
- XML export
- Excel export

### PLSQLCop
- JSON (recommended for parsing)
- Text (console output)
- HTML report

### Sample PLSQLCop JSON Output

```json
{
  "files": [
    {
      "path": "{SOURCE_ROOT}Db/packages/DAR_PKG.pks",
      "violations": [
        {
          "rule": "naming.procedure_name",
          "severity": "WARNING",
          "line": 42,
          "column": 15,
          "message": "Procedure name 'GET_ADDRESS' should be lowercase 'get_address'"
        },
        {
          "rule": "complexity.max_parameters",
          "severity": "WARNING",
          "line": 58,
          "message": "Procedure has 8 parameters, exceeds maximum of 5"
        }
      ]
    }
  ],
  "summary": {
    "total_files": 145,
    "total_violations": 234,
    "by_severity": {
      "ERROR": 12,
      "WARNING": 187,
      "INFO": 35
    }
  }
}
```

## Custom SQL Developer Rules

### Create Custom Rule (example)

```xml
<!-- SQLDeveloper/extensions/rules/custom_plsql_rules.xml -->
<rules>
  <rule>
    <name>Require Package Comments</name>
    <category>Documentation</category>
    <severity>Warning</severity>
    <pattern>
      <![CDATA[
      CREATE OR REPLACE PACKAGE\s+\w+\s+AS
      (?!.*--\s*Purpose:)
      ]]>
    </pattern>
    <message>Package should have a Purpose comment</message>
  </rule>
</rules>
```

## Common Issues

**Issue**: SQL Developer out of memory on large codebase
**Solution**: Increase heap in `sqldeveloper.conf`: `AddVMOption -Xmx4096M`

**Issue**: PLSQLCop doesn't recognize Oracle-specific syntax
**Solution**: Update to latest version or create custom parser configuration

**Issue**: False positives on generated code
**Solution**: Add generated code paths to `excludes` in configuration

## Integration with Build Process

### PowerShell Script for Automated Analysis

```powershell
# Analyze all PL/SQL files
$plsqlFiles = Get-ChildItem -Path "{SOURCE_ROOT}Db" -Recurse -Include "*.pks","*.pkb","*.sql"

foreach ($file in $plsqlFiles) {
    plsqlcop check $file.FullName --format json --output "artifacts\02-metrics\plsql\$($file.BaseName).json"
}

# Combine results
# ... merge JSON files logic ...
```

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Backend .NET Setup](backend-dotnet.md) - for C# code that calls PL/SQL
- [Verification Scripts](verification-scripts.md)

## Additional Resources

- Oracle SQL Developer: https://www.oracle.com/tools/sql-developer/
- PLSQLCop: https://www.salvis.com/blog/plsqlcop/
- Oracle PL/SQL Best Practices: https://oracle.readthedocs.io/
