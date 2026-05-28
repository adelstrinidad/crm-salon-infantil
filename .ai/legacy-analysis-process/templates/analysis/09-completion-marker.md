# Completion Marker Template

When done, each sub-agent creates a marker file:

```powershell
# Create completion marker
$markerContent = @{
    agentId = "SA-{XX}"
    completedAt = (Get-Date).ToString("o")
    outputFile = "path/to/output.md"
    status = "complete"
}

$markerContent | ConvertTo-Json | Out-File "{ANALYSIS_ROOT}/{phase}/.SA-{XX}-complete"
```
