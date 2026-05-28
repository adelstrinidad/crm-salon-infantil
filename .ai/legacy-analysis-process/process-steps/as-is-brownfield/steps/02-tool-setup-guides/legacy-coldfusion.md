# ColdFusion Static Analysis Setup

**Purpose**: Set up CFLint for Adobe ColdFusion and Lucee CFML projects

**Tech Stack**: Adobe ColdFusion 9-2023, Lucee 5+, CFML

## Prerequisites

- Java 8+ (CFLint is Java-based)
- Access to ColdFusion source code (.cfm, .cfc files)

## Installation Steps

### Option 1: Standalone JAR (Recommended)

```bash
# Download latest CFLint JAR
mkdir -p C:\tools\cflint
cd C:\tools\cflint

# Download from GitHub releases
# https://github.com/cflint/CFLint/releases
Invoke-WebRequest -Uri "https://github.com/cflint/CFLint/releases/download/CFLint-1.5.0/CFLint-1.5.0-all.jar" -OutFile "cflint-1.5.0-all.jar"
```

### Option 2: npm Package (Alternative)

```bash
npm install -g cflint
```

## Configuration

### CFLint Configuration (.cflintrc)

Create `.cflintrc` in project root:

```json
{
  "rule": [],
  "excludes": [
    {
      "code": "CFQUERYPARAM_REQ",
      "pattern": ".*Test\\.cfc"
    }
  ],
  "includes": [
    {
      "code": "SQL_SELECT_STAR"
    }
  ],
  "inheritParent": false,
  "parameters": {
    "TooManyFunctionsChecker.maximum": "10",
    "TooManyArgumentsChecker.maximum": "10"
  },
  "output": [
    {
      "type": "json",
      "file": "artifacts/02-metrics/cflint-report.json"
    }
  ]
}
```

## Running Analysis

### Using JAR

```bash
# Analyze entire directory
java -jar C:\tools\cflint\cflint-1.5.0-all.jar -folder trunk\{PROJECT}\src\WebUI -json -jsonfile artifacts\02-metrics\cflint-report.json

# Analyze single file
java -jar C:\tools\cflint\cflint-1.5.0-all.jar -file MyComponent.cfc -json

# With custom config
java -jar C:\tools\cflint\cflint-1.5.0-all.jar -folder src -configfile .cflintrc
```

### Using npm

```bash
cflint src/ --output json --jsonfile artifacts/02-metrics/cflint-report.json
```

## Key CFLint Rules

### Security Rules

- `SQL_SELECT_STAR` - Detects SELECT * queries
- `CFQUERYPARAM_REQ` - Requires cfqueryparam usage (SQL injection prevention)
- `AVOID_USING_CFABORT` - Flags abrupt flow termination
- `AVOID_USING_ISDEFINED` - Prefers structKeyExists over isDefined

### Code Quality Rules

- `FUNCTION_TOO_COMPLEX` - Cyclomatic complexity threshold
- `EXCESSIVE_FUNCTIONS` - Too many functions in component
- `EXCESSIVE_ARGUMENTS` - Too many function parameters
- `UNUSED_LOCAL_VARIABLE` - Detects unused variables
- `MISSING_VAR` - Variables not properly scoped

### Naming Convention Rules

- `METHOD_INVALID_NAME` - Method naming standards
- `COMPONENT_INVALID_NAME` - Component naming standards
- `ARGUMENT_INVALID_NAME` - Argument naming standards

## Verification

```bash
# Verify installation (JAR)
java -jar C:\tools\cflint\cflint-1.5.0-all.jar -version

# Test on sample CFC file
@"
component {
    function test() {
        var x = 1;
        return x;
    }
}
"@ | Out-File Test.cfc -Encoding UTF8

java -jar C:\tools\cflint\cflint-1.5.0-all.jar -file Test.cfc
Remove-Item Test.cfc
```

## Output Format

- **JSON**: Detailed findings with file, line, severity
- **XML**: Compatible with CI/CD tools
- **HTML**: Human-readable report
- **Text**: Console output

### Sample JSON Output

```json
{
  "version": "1.5.0",
  "timestamp": 1234567890,
  "issues": [
    {
      "severity": "WARNING",
      "id": "SQL_SELECT_STAR",
      "message": "Avoid using select *",
      "category": "CFSQLTYPE_DATATYPE",
      "abbrev": "SSS",
      "locations": [
        {
          "file": "MyComponent.cfc",
          "fileName": "MyComponent.cfc",
          "function": "getUsers",
          "column": 15,
          "line": 42,
          "message": "Avoid using select *",
          "variable": "",
          "expression": "<cfquery>SELECT * FROM users</cfquery>"
        }
      ]
    }
  ],
  "counts": {
    "totalFiles": 145,
    "totalLines": 28340,
    "INFO": 12,
    "WARNING": 45,
    "ERROR": 3,
    "CRITICAL": 0,
    "COSMETIC": 23
  }
}
```

## Common ColdFusion Patterns to Check

### cfqueryparam Usage (SQL Injection Prevention)

**Bad**:
```cfml
<cfquery name="qUsers">
    SELECT * FROM users WHERE id = #url.id#
</cfquery>
```

**Good**:
```cfml
<cfquery name="qUsers">
    SELECT userId, userName FROM users
    WHERE userId = <cfqueryparam value="#url.id#" cfsqltype="cf_sql_integer">
</cfquery>
```

### Variable Scoping

**Bad**:
```cfml
<cffunction name="test">
    x = 1;  <!--- Missing var scope --->
    return x;
</cffunction>
```

**Good**:
```cfml
<cffunction name="test">
    var x = 1;
    return x;
</cffunction>
```

## Common Issues

**Issue**: Java heap space error on large codebases
**Solution**: Increase heap size: `java -Xmx2g -jar cflint-1.5.0-all.jar ...`

**Issue**: Too many false positives
**Solution**: Customize `.cflintrc` to exclude specific rules or patterns

**Issue**: CFLint doesn't recognize custom tags
**Solution**: Add custom tag definitions to configuration

## Integration with CI/CD

### Jenkins Example

```groovy
stage('CFLint') {
    steps {
        sh 'java -jar /opt/cflint/cflint-1.5.0-all.jar -folder src -json -jsonfile cflint-report.json'
        recordIssues tool: junitParser(pattern: 'cflint-report.json')
    }
}
```

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Verification Scripts](verification-scripts.md)

## Additional Resources

- CFLint GitHub: https://github.com/cflint/CFLint
- CFLint Rules Reference: https://github.com/cflint/CFLint/wiki/Rules
