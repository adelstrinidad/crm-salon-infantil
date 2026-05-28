# MCP Servers Setup

**Purpose**: Configure Model Context Protocol (MCP) servers for Claude Code integration

**MCP Servers Used**:
- **Knowledge Graph** - Session knowledge management
- **Context7** - Documentation lookup (Arc42, libraries)
- **Godot** - Game engine integration (if applicable)
- **Playwright** - Browser automation (for testing generated diagrams)

## Prerequisites

- Node.js 18+ and npm
- Claude Code CLI installed
- Access to `.claude/settings.json` for configuration

## Installation Steps

### 1. Knowledge Graph MCP Server

**Purpose**: Temporary session knowledge storage and retrieval

```bash
# Install globally
npm install -g @modelcontextprotocol/server-knowledge-graph

# Or install locally in project
cd {PROJECT_ROOT}
npm install --save-dev @modelcontextprotocol/server-knowledge-graph
```

**Configuration** (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "knowledge-graph": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-knowledge-graph"],
      "env": {
        "KNOWLEDGE_GRAPH_PATH": "{PROJECT_ROOT}\\.tmp\\knowledge-graph.json"
      }
    }
  }
}
```

### 2. Context7 MCP Server

**Purpose**: Query documentation for Arc42, libraries, frameworks

```bash
# Install Context7 MCP server
npm install -g @context7/mcp-server
```

**Configuration** (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
      }
    }
  }
}
```

**Set API Key** (Windows):
```powershell
# Set environment variable (user-level)
[System.Environment]::SetEnvironmentVariable("CONTEXT7_API_KEY", "your-api-key", "User")

# Or set in current session
$env:CONTEXT7_API_KEY = "your-api-key"
```

### 3. Playwright MCP Server (Optional)

**Purpose**: Browser automation for diagram testing

```bash
# Install Playwright MCP server
npm install -g @playwright/mcp-server

# Install browsers
npx playwright install
```

**Configuration** (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "C:\\tools\\playwright-browsers"
      }
    }
  }
}
```

### 4. Godot MCP Server (Optional - Only for Game Projects)

**Purpose**: Godot game engine integration

**Skip this** if not working with Godot game engine projects.

```bash
# Install Godot MCP server
npm install -g @godot/mcp-server
```

## Complete Configuration File

**Full `.claude/settings.json` example**:

```json
{
  "mcpServers": {
    "knowledge-graph": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-knowledge-graph"],
      "env": {
        "KNOWLEDGE_GRAPH_PATH": "{PROJECT_ROOT}\\.tmp\\knowledge-graph.json"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "C:\\tools\\playwright-browsers"
      }
    }
  },
  "allowedTools": [
    "mcp__knowledge-graph__*",
    "mcp__context7__*",
    "mcp__playwright__*"
  ]
}
```

## Verification

### Test Knowledge Graph MCP

```bash
# Start Claude Code and test
claude code

# In Claude Code session, verify MCP tools are available
# Should see: mcp__knowledge-graph__create_entities, mcp__knowledge-graph__read_graph, etc.
```

### Test Context7 MCP

```javascript
// Query Arc42 documentation
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "Arc42 Section 01 Introduction and Goals"
})
```

### Test Playwright MCP

```javascript
// Test browser automation
mcp__playwright__browser_navigate({
  url: "https://example.com"
})

mcp__playwright__browser_snapshot()
```

## Common MCP Server Commands

### Knowledge Graph

```javascript
// Create entities
mcp__knowledge-graph__create_entities({
  entities: [{
    name: "Address Module",
    entityType: "component",
    observations: ["Handles address validation"]
  }]
})

// Search nodes
mcp__knowledge-graph__search_nodes({
  query: "address"
})

// Read entire graph
mcp__knowledge-graph__read_graph()
```

### Context7

```javascript
// Resolve library ID
mcp__context7__resolve-library-id({
  libraryName: "arc42",
  query: "architecture documentation template"
})

// Query docs
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "How to document solution strategy?"
})
```

## Troubleshooting

### Issue: MCP server not starting

**Check**:
```bash
# Verify Node.js version
node --version  # Should be 18+

# Test MCP server directly
npx -y @modelcontextprotocol/server-knowledge-graph
```

**Solution**: Ensure Node.js 18+ is installed and in PATH

### Issue: Context7 API key not working

**Check**:
```powershell
# Verify environment variable is set
$env:CONTEXT7_API_KEY
```

**Solution**: Set API key correctly, restart Claude Code session

### Issue: Playwright browsers not found

**Solution**:
```bash
# Reinstall browsers
npx playwright install --with-deps
```

### Issue: MCP tools not showing in Claude Code

**Check** `.claude/settings.json`:
1. Valid JSON syntax
2. Correct paths (use double backslashes `\\` on Windows)
3. `allowedTools` includes MCP patterns

**Solution**: Restart Claude Code after editing settings

## MCP Server Logs

### Enable Debug Logging

**Windows** (`.claude/settings.json`):
```json
{
  "mcpServers": {
    "knowledge-graph": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-knowledge-graph"],
      "env": {
        "DEBUG": "mcp:*",
        "KNOWLEDGE_GRAPH_PATH": "{PROJECT_ROOT}\\.tmp\\knowledge-graph.json"
      }
    }
  }
}
```

**Log Location**: Check Claude Code console output for MCP server logs

## Usage Guidelines

### Knowledge Graph Usage

**DO**:
- âœ… Use for temporary session notes
- âœ… Quick lookups within current session
- âœ… Brainstorming and exploration

**DON'T**:
- âŒ Use for long-term knowledge (use git files instead)
- âŒ Store team-shared knowledge (not git-versioned)
- âŒ Treat as source of truth (files are source of truth)

### Context7 Usage

**DO**:
- âœ… Query Arc42 template guidance
- âœ… Look up library documentation (React, Vue, NestJS, etc.)
- âœ… Find code examples from official docs

**DON'T**:
- âŒ Query more than 3 times per question (per Context7 guidelines)

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Diagram Tools Setup](diagram-tools.md) - for Playwright browser testing
- [Verification Scripts](verification-scripts.md)

## Additional Resources

- MCP Documentation: https://modelcontextprotocol.io/
- Context7 Docs: https://context7.ai/docs
- Playwright Docs: https://playwright.dev/
