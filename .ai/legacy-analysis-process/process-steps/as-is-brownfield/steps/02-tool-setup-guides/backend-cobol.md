# COBOL Static Analysis Setup

**Purpose**: Set up SonarQube COBOL (commercial) or GnuCOBOL for legacy COBOL projects

**Tech Stack**: COBOL 85, COBOL 2002, Mainframe COBOL, Micro Focus COBOL

## Prerequisites

- COBOL source code access
- Java 11+ (for SonarQube)
- Docker (optional, for containerized SonarQube)

## Analysis Options

### Option 1: SonarQube COBOL (Commercial)

**License**: Commercial license required from SonarSource
**Capabilities**: Full quality analysis, code smells, complexity, security

#### Installation (Docker)

```bash
# Run SonarQube with COBOL plugin
docker run -d --name sonarqube \
  -p 9000:9000 \
  sonarqube:latest

# Install COBOL plugin through SonarQube UI
# Administration > Marketplace > Search "COBOL"
```

#### Configuration (sonar-project.properties)

```properties
sonar.projectKey=my-cobol-project
sonar.projectName=My COBOL Project
sonar.sources=src
sonar.sourceEncoding=UTF-8
sonar.language=cobol

# COBOL-specific settings
sonar.cobol.compilationErrorsLevel=warn
sonar.cobol.compiler.format=fixed
sonar.cobol.compiler.copyBookDirectories=copybooks
```

#### Running Analysis

```bash
# Download SonarScanner
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.zip
unzip sonar-scanner-cli-5.0.1.zip

# Run scan
./sonar-scanner-5.0.1/bin/sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=<token>
```

### Option 2: GnuCOBOL (Free, Limited)

**License**: GNU GPL (free)
**Capabilities**: Syntax checking only, no quality analysis

#### Installation

**Linux**:
```bash
sudo apt-get install gnucobol
```

**Windows**:
```powershell
# Download from https://sourceforge.net/projects/gnucobol/
# Install using installer
```

#### Running Syntax Check

```bash
# Check syntax only
cobc -fsyntax-only program.cbl

# Compile to check for errors
cobc -x program.cbl -o program
```

## Analysis Output

### SonarQube Output

- Web dashboard with metrics
- API endpoints for JSON/XML export
- Integration with CI/CD pipelines

```bash
# Export metrics via API
curl -u admin:admin \
  "http://localhost:9000/api/measures/component?component=my-cobol-project&metricKeys=ncloc,complexity,violations" \
  > artifacts/02-metrics/sonarqube-cobol.json
```

### GnuCOBOL Output

- Console output only (warnings and errors)
- Exit code indicates success/failure

```bash
cobc -fsyntax-only src/*.cbl 2> artifacts/02-metrics/gnucobol-syntax.txt
```

## Limitations

**COBOL Static Analysis Challenges**:
- Most quality tools are commercial
- Limited open-source options
- Mainframe COBOL may require specific dialects
- COPYBOOK dependencies need proper configuration

**Recommendation**: For comprehensive analysis, budget for SonarQube COBOL license. For basic syntax validation, use GnuCOBOL.

## Verification

### SonarQube
```bash
# Check SonarQube is running
curl http://localhost:9000/api/system/status

# Verify COBOL plugin
curl http://localhost:9000/api/languages/list | grep -i cobol
```

### GnuCOBOL
```bash
# Verify installation
cobc --version

# Test on sample file
echo "       IDENTIFICATION DIVISION." > test.cbl
echo "       PROGRAM-ID. HELLO." >> test.cbl
cobc -fsyntax-only test.cbl
rm test.cbl
```

## Output Format

- **SonarQube**: JSON/XML via API, Web UI
- **GnuCOBOL**: Plain text (stderr)

## Common Issues

**Issue**: COPYBOOK not found errors
**Solution**: Configure `sonar.cobol.compiler.copyBookDirectories` properly

**Issue**: Dialect mismatch (IBM vs Micro Focus)
**Solution**: Adjust COBOL dialect settings in SonarQube

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Verification Scripts](verification-scripts.md)

## Cost Considerations

**SonarQube COBOL Plugin**: Contact SonarSource for pricing
**Alternative**: Manual code review + GnuCOBOL syntax checking (free but limited)
