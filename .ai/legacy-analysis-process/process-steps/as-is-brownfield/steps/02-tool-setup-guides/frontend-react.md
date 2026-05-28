# React Static Analysis Setup

**Purpose**: Set up ESLint with React and TypeScript support for React projects

**Tech Stack**: React 16+, React 18, Next.js, Create React App, Vite

## Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- React project (JavaScript or TypeScript)

## Installation Steps

```bash
# Install ESLint and React plugins
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks

# For TypeScript projects
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Additional recommended plugins
npm install --save-dev eslint-plugin-jsx-a11y eslint-plugin-import
```

## Configuration

### ESLint Configuration (.eslintrc.json)

**For TypeScript React**:

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "project": "./tsconfig.json"
  },
  "plugins": [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "jsx-a11y",
    "import"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/typescript"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  }
}
```

**For JavaScript React**:

```json
{
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["react", "react-hooks", "jsx-a11y"],
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "env": {
    "browser": true,
    "es2022": true
  }
}
```

## Running Analysis

```bash
# Run ESLint on src directory
npx eslint src/ --ext .tsx,.ts,.jsx,.js --format json --output-file artifacts/02-metrics/eslint-react-report.json

# With TypeScript type checking
npx tsc --noEmit
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint src/ --ext .tsx,.ts,.jsx,.js",
    "lint:fix": "eslint src/ --ext .tsx,.ts,.jsx,.js --fix",
    "type-check": "tsc --noEmit",
    "analyze": "npm run lint && npm run type-check"
  }
}
```

## Key React-Specific Rules

```json
{
  "rules": {
    "react/jsx-key": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/no-danger": "warn",
    "react/no-deprecated": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-unescaped-entities": "warn",
    "react/require-render-return": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Accessibility Checks (jsx-a11y)

```json
{
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/click-events-have-key-events": "warn",
    "jsx-a11y/interactive-supports-focus": "warn"
  }
}
```

## Verification

```bash
# Verify installations
npx eslint --version

# Test on sample React file
echo 'import React from "react"; export const Test = () => <div>Test</div>;' > Test.tsx
npx eslint Test.tsx
rm Test.tsx
```

## Output Format

- **ESLint**: JSON, SARIF, stylish (console), HTML

## Common Issues

**Issue**: `'React' must be in scope when using JSX`
**Solution**: For React 17+, use `plugin:react/jsx-runtime` preset and turn off `react/react-in-jsx-scope`

**Issue**: False positives for React Hooks dependencies
**Solution**: Review `react-hooks/exhaustive-deps` warnings carefully, use inline `// eslint-disable-next-line` only when necessary

**Issue**: Accessibility warnings overwhelming
**Solution**: Start with `jsx-a11y/recommended`, gradually address issues

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Node.js/TypeScript Setup](backend-nodejs.md) - for backend Node.js configuration
- [Verification Scripts](verification-scripts.md)
