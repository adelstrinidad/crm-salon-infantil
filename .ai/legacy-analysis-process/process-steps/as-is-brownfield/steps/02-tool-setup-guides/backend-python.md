# Python Static Analysis Setup

**Purpose**: Set up pylint, bandit, mypy, and ruff for Python projects

**Tech Stack**: Python 2.x, Python 3.x, Django, Flask, FastAPI

## Prerequisites

- Python 3.8+ (for analysis tools, can analyze older Python code)
- pip or conda package manager
- Virtual environment (recommended)

## Installation Steps

### Install Analysis Tools

```bash
# Create virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install all analysis tools
pip install pylint bandit mypy ruff
```

## Configuration

### pylint Configuration (.pylintrc)

```ini
[MASTER]
# Add custom plugins if needed
load-plugins=

[MESSAGES CONTROL]
# Disable specific messages if needed
disable=C0111,C0103

[REPORTS]
output-format=json
```

### bandit Configuration (.bandit)

```yaml
exclude_dirs:
  - /test/
  - /venv/
  - /.venv/
```

### mypy Configuration (mypy.ini)

```ini
[mypy]
python_version = 3.8
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
```

### ruff Configuration (pyproject.toml)

```toml
[tool.ruff]
line-length = 88
select = ["E", "F", "W", "C90", "I", "N", "UP"]
```

## Running Analysis

```bash
# Code quality
pylint src/ --output-format=json > artifacts/02-metrics/pylint-report.json

# Security scanning
bandit -r src/ -f json -o artifacts/02-metrics/bandit-report.json

# Type checking
mypy src/ --json-report artifacts/02-metrics/mypy-report

# Fast linting
ruff check src/ --output-format=json > artifacts/02-metrics/ruff-report.json
```

## Verification

```bash
# Verify installations
pylint --version
bandit --version
mypy --version
ruff --version

# Test on sample file
echo "print('Hello')" > test.py
pylint test.py
rm test.py
```

## Output Format

- **pylint**: JSON with issues, scores, statistics
- **bandit**: JSON with security findings, confidence levels
- **mypy**: JSON with type errors, warnings
- **ruff**: JSON with lint violations

## Common Issues

**Issue**: `ModuleNotFoundError` when analyzing project
**Solution**: Install project dependencies in the same virtual environment

**Issue**: Too many warnings
**Solution**: Start with default config, gradually tighten rules

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Verification Scripts](verification-scripts.md)
