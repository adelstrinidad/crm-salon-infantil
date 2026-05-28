# Kotlin Static Analysis Setup

**Purpose**: Set up detekt and ktlint for Kotlin projects

**Tech Stack**: Kotlin 1.5+, Spring Boot, Ktor, Android

## Prerequisites

- JDK 11+
- Gradle 6.0+ (recommended) or Maven 3.6+
- Kotlin 1.5+

## Installation Steps

### Gradle Plugin (Recommended)

Add to `build.gradle.kts`:

```kotlin
plugins {
    id("io.gitlab.arturbosch.detekt") version "1.23.5"
    id("org.jlleitschuh.gradle.ktlint") version "12.1.0"
}

detekt {
    buildUponDefaultConfig = true
    config.setFrom(files("$projectDir/config/detekt.yml"))
    baseline = file("$projectDir/config/baseline.xml")
}

ktlint {
    version.set("1.1.1")
    android.set(false)
    outputToConsole.set(true)
    outputColorName.set("RED")
}

dependencies {
    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:1.23.5")
}
```

### Maven Plugin

Add to `pom.xml`:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>com.github.ozsie</groupId>
      <artifactId>detekt-maven-plugin</artifactId>
      <version>1.23.5</version>
      <configuration>
        <config>detekt.yml</config>
      </configuration>
    </plugin>
  </plugins>
</build>
```

## Running Analysis

### Gradle

```bash
# Run detekt
gradle detekt

# Run ktlint
gradle ktlintCheck

# Auto-format with ktlint
gradle ktlintFormat

# Generate SARIF report
gradle detekt --sarif
```

### Maven

```bash
mvn detekt:check
```

## Configuration

### detekt Configuration (detekt.yml)

```yaml
build:
  maxIssues: 0
  excludeCorrectable: false

complexity:
  active: true
  ComplexMethod:
    threshold: 15
  LongMethod:
    threshold: 60

formatting:
  active: true
  android: false
  autoCorrect: true

naming:
  active: true
  FunctionNaming:
    functionPattern: '[a-z][a-zA-Z0-9]*'

style:
  active: true
  MaxLineLength:
    maxLineLength: 120
```

### ktlint Configuration (.editorconfig)

```ini
[*.{kt,kts}]
indent_size = 4
continuation_indent_size = 4
max_line_length = 120
insert_final_newline = true
```

## Verification

```bash
# Gradle
gradle tasks --group=verification

# Test on sample file
echo 'fun main() { println("Hello") }' > Test.kt
gradle ktlintCheck
rm Test.kt
```

## Output Format

- **detekt**: XML, SARIF, HTML, MD, TXT
- **ktlint**: Plain text, checkstyle XML

## Common Issues

**Issue**: detekt rules conflict with ktlint formatting
**Solution**: Use `detekt-formatting` plugin for consistency

**Issue**: Android-specific rules failing on non-Android projects
**Solution**: Set `android: false` in configurations

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Verification Scripts](verification-scripts.md)
