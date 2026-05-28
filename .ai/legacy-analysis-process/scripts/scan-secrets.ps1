<#
.SYNOPSIS
    Scans codebase for secrets and credentials. Runs entirely locally.

.DESCRIPTION
    Pattern-based detection of connection strings, API keys, passwords, and other
    sensitive content. Results help classify content before AI analysis.

.PARAMETER SourcePath
    Path to source code directory to scan.

.PARAMETER OutputPath
    Path for output JSON file. Defaults to artifacts/02-metrics/secrets-scan.json

.EXAMPLE
    .\scan-secrets.ps1 -SourcePath "..\..\..\..\trunk\{PROJECT}\src"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$SourcePath,

    [string]$OutputPath = "..\artifacts\02-metrics\secrets-scan.json"
)

$ErrorActionPreference = "Stop"

# Ensure output directory exists
$outputDir = Split-Path $OutputPath -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

Write-Host "=== Secret Scanner ===" -ForegroundColor Cyan
Write-Host "Source: $SourcePath"
Write-Host "Output: $OutputPath"
Write-Host ""

# Detection patterns
$patterns = @{
    "ConnectionString" = @{
        Pattern = '(?i)(connectionstring|connection\s*string)[^;]*=\s*[''"][^''"]+[''"]'
        Severity = "CRITICAL"
        Description = "Database connection string"
    }
    "DataSource" = @{
        Pattern = '(?i)(data source|server)\s*=\s*[^;]+'
        Severity = "CRITICAL"
        Description = "Database server reference"
    }
    "Password" = @{
        Pattern = '(?i)(password|passwd|pwd)\s*[=:]\s*[''"][^''"]+[''"]'
        Severity = "CRITICAL"
        Description = "Hardcoded password"
    }
    "APIKey" = @{
        Pattern = '(?i)(api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*[''"][\w\-]+'
        Severity = "CRITICAL"
        Description = "API key or secret"
    }
    "AWSCredential" = @{
        Pattern = '(?i)(aws[_-]?(access|secret)|AKIA[A-Z0-9]{16})'
        Severity = "CRITICAL"
        Description = "AWS credential"
    }
    "AWSArn" = @{
        Pattern = 'arn:aws:[a-z0-9\-]+:[a-z0-9\-]*:[0-9]*:[^\s''"<>]+'
        Severity = "HIGH"
        Description = "AWS ARN (resource identifier)"
    }
    "PrivateKey" = @{
        Pattern = '-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----'
        Severity = "CRITICAL"
        Description = "Private key"
    }
    "InternalURL" = @{
        Pattern = '(?i)https?://[a-z0-9.\-]+\.(internal|local|corp|company|intra)\b[^\s''"<>]*'
        Severity = "HIGH"
        Description = "Internal URL"
    }
    "InternalIP" = @{
        Pattern = '\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3})\b'
        Severity = "HIGH"
        Description = "Internal IP address"
    }
    "ServerName" = @{
        Pattern = '(?i)(server[_-]?name|hostname)\s*[=:]\s*[''"][^''"]+[''"]'
        Severity = "MEDIUM"
        Description = "Server name reference"
    }
    "Email" = @{
        Pattern = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|fi|eu)'
        Severity = "LOW"
        Description = "Email address"
    }
}

$findings = @()
$fileCount = 0
$extensions = @("*.cs", "*.config", "*.json", "*.xml", "*.yml", "*.yaml", "*.sql", "*.ps1", "*.sh")

Write-Host "Scanning for patterns..." -ForegroundColor Yellow

foreach ($ext in $extensions) {
    $files = Get-ChildItem -Path $SourcePath -Recurse -Include $ext -ErrorAction SilentlyContinue

    foreach ($file in $files) {
        $fileCount++

        try {
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ([string]::IsNullOrEmpty($content)) { continue }

            foreach ($patternEntry in $patterns.GetEnumerator()) {
                $matches = [regex]::Matches($content, $patternEntry.Value.Pattern)

                foreach ($match in $matches) {
                    # Get line number
                    $beforeMatch = $content.Substring(0, $match.Index)
                    $lineNumber = ($beforeMatch -split "`n").Count

                    # Redact the actual value for safety
                    $matchText = $match.Value
                    if ($matchText.Length -gt 50) {
                        $matchText = $matchText.Substring(0, 50) + "..."
                    }

                    $findings += [PSCustomObject]@{
                        File = $file.FullName.Replace($SourcePath, "").TrimStart("\", "/")
                        Line = $lineNumber
                        Type = $patternEntry.Key
                        Severity = $patternEntry.Value.Severity
                        Description = $patternEntry.Value.Description
                        Preview = $matchText -replace '(?i)(password|pwd|secret|key)\s*[=:]\s*[''"][^''"]*[''"]', '$1=***REDACTED***'
                    }
                }
            }
        }
        catch {
            Write-Warning "Could not read file: $($file.FullName)"
        }
    }
}

# Summary
$summary = @{
    ScanDate = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    SourcePath = $SourcePath
    FilesScanned = $fileCount
    TotalFindings = $findings.Count
    BySeverity = @{
        CRITICAL = ($findings | Where-Object { $_.Severity -eq "CRITICAL" }).Count
        HIGH = ($findings | Where-Object { $_.Severity -eq "HIGH" }).Count
        MEDIUM = ($findings | Where-Object { $_.Severity -eq "MEDIUM" }).Count
        LOW = ($findings | Where-Object { $_.Severity -eq "LOW" }).Count
    }
    ByType = $findings | Group-Object Type | ForEach-Object { @{ $_.Name = $_.Count } }
    Findings = $findings
}

# Output results
$summary | ConvertTo-Json -Depth 5 | Out-File $OutputPath -Encoding UTF8

Write-Host ""
Write-Host "=== Scan Complete ===" -ForegroundColor Green
Write-Host "Files scanned: $fileCount"
Write-Host "Total findings: $($findings.Count)"
Write-Host ""
Write-Host "By Severity:" -ForegroundColor Yellow
Write-Host "  CRITICAL: $($summary.BySeverity.CRITICAL)" -ForegroundColor Red
Write-Host "  HIGH:     $($summary.BySeverity.HIGH)" -ForegroundColor DarkYellow
Write-Host "  MEDIUM:   $($summary.BySeverity.MEDIUM)" -ForegroundColor Yellow
Write-Host "  LOW:      $($summary.BySeverity.LOW)" -ForegroundColor Gray
Write-Host ""
Write-Host "Results saved to: $OutputPath"

if ($summary.BySeverity.CRITICAL -gt 0) {
    Write-Host ""
    Write-Host "WARNING: CRITICAL findings detected!" -ForegroundColor Red
    Write-Host "Review secrets-scan.json before any AI analysis." -ForegroundColor Red
}
