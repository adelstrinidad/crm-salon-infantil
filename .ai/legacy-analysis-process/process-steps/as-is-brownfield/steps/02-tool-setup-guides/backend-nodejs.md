# Node.js/TypeScript Static Analysis Setup

**Purpose**: Set up ESLint with TypeScript support for Node.js projects

**Tech Stack**: Node.js 16+, TypeScript 4.x+, Express, NestJS, Fastify

## Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- TypeScript project (or JavaScript with type checking)

## Installation Steps

```bash
# Install ESLint and TypeScript parser
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Install additional plugins
npm install --save-dev eslint-plugin-node eslint-plugin-import eslint-plugin-security

# TypeScript (if not already installed)
npm install --save-dev typescript
```

## Configuration

### ESLint Configuration (.eslintrc.json)

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint",
    "node",
    "import",
    "security"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:node/recommended",
    "plugin:import/typescript",
    "plugin:security/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "node/no-unsupported-features/es-syntax": ["error", {
      "ignores": ["modules"]
    }]
  },
  "env": {
    "node": true,
    "es2022": true
  }
}
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Running Analysis

```bash
# Run ESLint
npx eslint src/ --ext .ts,.js --format json --output-file artifacts/02-metrics/eslint-report.json

# Run TypeScript compiler checks
npx tsc --noEmit --pretty false > artifacts/02-metrics/tsc-report.txt

# Combined analysis
npm run lint
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint src/ --ext .ts,.js",
    "lint:fix": "eslint src/ --ext .ts,.js --fix",
    "type-check": "tsc --noEmit",
    "analyze": "npm run lint && npm run type-check"
  }
}
```

## Verification

```bash
# Verify installations
npx eslint --version
npx tsc --version

# Test on sample file
echo 'const x: string = "test"; console.log(x);' > test.ts
npx eslint test.ts
rm test.ts
```

## Output Format

- **ESLint**: JSON, SARIF, stylish (console), HTML
- **TypeScript**: Plain text, JSON (via third-party formatters)

## Common Issues

**Issue**: `Parsing error: Cannot read file 'tsconfig.json'`
**Solution**: Ensure `parserOptions.project` points to correct tsconfig.json

**Issue**: Node.js built-in modules flagged as missing
**Solution**: Add `node/no-missing-import: off` or install `@types/node`

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Frontend React Setup](frontend-react.md) - for React-specific rules
- [Frontend NestJS Setup](frontend-nestjs.md) - for NestJS-specific rules
- [Verification Scripts](verification-scripts.md)
