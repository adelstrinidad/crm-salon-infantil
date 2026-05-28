# Vue.js Static Analysis Setup

**Purpose**: Set up ESLint with Vue and TypeScript support for Vue projects

**Tech Stack**: Vue 2, Vue 3, Nuxt.js, Vite + Vue

## Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- Vue project (JavaScript or TypeScript)

## Installation Steps

```bash
# Install ESLint and Vue plugin
npm install --save-dev eslint eslint-plugin-vue

# For TypeScript projects
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin

# For Vue 3 + TypeScript (recommended)
npm install --save-dev @vue/eslint-config-typescript

# Additional recommended plugins
npm install --save-dev eslint-plugin-import
```

## Configuration

### ESLint Configuration (.eslintrc.json)

**For Vue 3 + TypeScript**:

```json
{
  "root": true,
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "parser": "@typescript-eslint/parser",
    "ecmaVersion": 2022,
    "sourceType": "module",
    "extraFileExtensions": [".vue"]
  },
  "plugins": [
    "vue",
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "vue/multi-word-component-names": "error",
    "vue/no-unused-components": "warn",
    "vue/no-unused-vars": "warn",
    "vue/require-default-prop": "error",
    "vue/require-prop-types": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  }
}
```

**For Vue 2 + JavaScript**:

```json
{
  "root": true,
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "plugins": ["vue"],
  "extends": [
    "eslint:recommended",
    "plugin:vue/recommended"
  ],
  "rules": {
    "vue/multi-word-component-names": "error",
    "vue/no-unused-components": "warn",
    "vue/no-unused-vars": "warn"
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
npx eslint src/ --ext .vue,.ts,.js --format json --output-file artifacts/02-metrics/eslint-vue-report.json

# With TypeScript type checking (if using TypeScript)
npx vue-tsc --noEmit
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint src/ --ext .vue,.ts,.js",
    "lint:fix": "eslint src/ --ext .vue,.ts,.js --fix",
    "type-check": "vue-tsc --noEmit",
    "analyze": "npm run lint && npm run type-check"
  }
}
```

## Key Vue-Specific Rules

### Essential Rules (Vue 3)

```json
{
  "rules": {
    "vue/multi-word-component-names": "error",
    "vue/no-arrow-functions-in-watch": "error",
    "vue/no-async-in-computed-properties": "error",
    "vue/no-dupe-keys": "error",
    "vue/no-duplicate-attributes": "error",
    "vue/no-reserved-keys": "error",
    "vue/no-shared-component-data": "error",
    "vue/no-template-key": "error",
    "vue/no-v-for-template-key": "error",
    "vue/require-component-is": "error",
    "vue/require-v-for-key": "error",
    "vue/return-in-computed-property": "error",
    "vue/valid-v-bind": "error",
    "vue/valid-v-for": "error",
    "vue/valid-v-if": "error",
    "vue/valid-v-model": "error"
  }
}
```

### Strongly Recommended (Style Guide)

```json
{
  "rules": {
    "vue/attribute-hyphenation": ["error", "always"],
    "vue/component-definition-name-casing": ["error", "PascalCase"],
    "vue/first-attribute-linebreak": ["error", {
      "singleline": "ignore",
      "multiline": "below"
    }],
    "vue/html-closing-bracket-newline": ["error", {
      "singleline": "never",
      "multiline": "always"
    }],
    "vue/max-attributes-per-line": ["error", {
      "singleline": 3,
      "multiline": 1
    }],
    "vue/order-in-components": "error",
    "vue/prop-name-casing": ["error", "camelCase"]
  }
}
```

## Verification

```bash
# Verify installations
npx eslint --version

# Test on sample Vue file
cat > Test.vue << EOF
<template>
  <div>{{ message }}</div>
</template>

<script setup lang="ts">
const message = ref('Hello')
</script>
EOF

npx eslint Test.vue
rm Test.vue
```

## Output Format

- **ESLint**: JSON, stylish (console), HTML
- **vue-tsc**: Plain text (TypeScript errors)

## Common Issues

**Issue**: `Parsing error: '>' expected` in .vue files
**Solution**: Ensure `parser: "vue-eslint-parser"` is set, with `parserOptions.parser` set to TypeScript parser for `<script>` blocks

**Issue**: Single-word component names flagged
**Solution**: Use multi-word component names per Vue style guide, or disable `vue/multi-word-component-names` (not recommended)

**Issue**: Template type checking not working
**Solution**: Install and use `vue-tsc` instead of `tsc` for Vue SFC support

## Vue 2 vs Vue 3 Rules

| Rule Set | Vue 2 | Vue 3 |
|----------|-------|-------|
| ESLint Config | `plugin:vue/recommended` | `plugin:vue/vue3-recommended` |
| Composition API | Not default | Default |
| `<script setup>` | Not supported | Supported |
| Multiple root elements | ❌ Error | ✅ Allowed |

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Node.js/TypeScript Setup](backend-nodejs.md) - for backend configuration
- [Verification Scripts](verification-scripts.md)
