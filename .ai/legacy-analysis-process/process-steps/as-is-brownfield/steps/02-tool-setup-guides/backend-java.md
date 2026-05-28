# Java Static Analysis Setup

**Purpose**: Set up SpotBugs, PMD, and Checkstyle for Java projects

**Tech Stack**: Java 8+, Spring Framework, Jakarta EE, Maven, Gradle

## Prerequisites

- JDK 11+ (for analysis tools, can analyze Java 8+ code)
- Maven 3.6+ or Gradle 6.0+
- IDE: IntelliJ IDEA, Eclipse, or VS Code with Java extensions

## Installation Steps

### Option 1: Maven Plugin

Add to `pom.xml`:

```xml
<build>
  <plugins>
    <!-- SpotBugs -->
    <plugin>
      <groupId>com.github.spotbugs</groupId>
      <artifactId>spotbugs-maven-plugin</artifactId>
      <version>4.8.3.0</version>
      <configuration>
        <effort>Max</effort>
        <threshold>Low</threshold>
        <xmlOutput>true</xmlOutput>
        <outputDirectory>${project.build.directory}/spotbugs</outputDirectory>
      </configuration>
    </plugin>

    <!-- PMD -->
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-pmd-plugin</artifactId>
      <version>3.21.2</version>
      <configuration>
        <rulesets>
          <ruleset>/rulesets/java/quickstart.xml</ruleset>
        </rulesets>
        <outputDirectory>${project.build.directory}/pmd</outputDirectory>
      </configuration>
    </plugin>

    <!-- Checkstyle -->
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-checkstyle-plugin</artifactId>
      <version>3.3.1</version>
      <configuration>
        <configLocation>google_checks.xml</configLocation>
        <outputDirectory>${project.build.directory}/checkstyle</outputDirectory>
      </configuration>
    </plugin>
  </plugins>
</build>
```

### Option 2: Gradle Plugin

Add to `build.gradle`:

```groovy
plugins {
    id 'com.github.spotbugs' version '6.0.7'
    id 'pmd'
    id 'checkstyle'
}

spotbugs {
    effort = 'max'
    reportLevel = 'low'
}

pmd {
    ruleSets = ["category/java/quickstart.xml"]
    ignoreFailures = true
}

checkstyle {
    toolVersion = '10.12.7'
    configFile = file("${rootDir}/config/checkstyle/google_checks.xml")
}
```

## Running Analysis

### Maven

```bash
# Run all analysis tools
mvn spotbugs:check pmd:check checkstyle:check

# Generate reports
mvn spotbugs:spotbugs pmd:pmd checkstyle:checkstyle
```

### Gradle

```bash
# Run all analysis tools
gradle spotbugsMain pmdMain checkstyleMain

# Generate reports
gradle check
```

## Configuration

### SpotBugs Exclusions (spotbugs-exclude.xml)

```xml
<FindBugsFilter>
  <Match>
    <Class name="~.*\.Test.*" />
  </Match>
</FindBugsFilter>
```

### PMD Ruleset (pmd-ruleset.xml)

```xml
<ruleset name="Custom Rules">
  <rule ref="category/java/bestpractices.xml" />
  <rule ref="category/java/errorprone.xml" />
  <rule ref="category/java/performance.xml" />
</ruleset>
```

## Verification

```bash
# Maven
mvn spotbugs:help pmd:help checkstyle:help

# Gradle
gradle tasks --group=verification
```

## Output Format

- **SpotBugs**: XML, SARIF, HTML
- **PMD**: XML, JSON, HTML, text
- **Checkstyle**: XML, plain text

## Common Issues

**Issue**: `OutOfMemoryError` during analysis
**Solution**: Increase heap size: `export MAVEN_OPTS="-Xmx2g"`

**Issue**: False positives
**Solution**: Use exclusion filters and customize rulesets

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Verification Scripts](verification-scripts.md)
