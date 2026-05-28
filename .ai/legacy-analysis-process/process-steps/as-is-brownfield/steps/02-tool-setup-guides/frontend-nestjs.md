# NestJS Static Analysis Setup

**Purpose**: Set up ESLint with NestJS-specific rules and TypeScript for NestJS projects

**Tech Stack**: NestJS 8+, NestJS 10, Express (underlying), Fastify (optional)

## Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- NestJS CLI (optional but recommended)
- TypeScript 4.7+

## Installation Steps

```bash
# NestJS projects typically come with ESLint pre-configured
# If not, install:

npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-config-prettier \
  eslint-plugin-prettier

# NestJS doesn't have an official ESLint plugin, use TypeScript + Node.js rules
```

## Configuration

### ESLint Configuration (.eslintrc.js)

**NestJS Standard Configuration**:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
    }],
    // NestJS-specific preferences
    '@typescript-eslint/no-empty-function': 'off',
    'prettier/prettier': ['error', {
      singleQuote: true,
      trailingComma: 'all',
    }],
  },
};
```

### TypeScript Configuration (tsconfig.json)

**NestJS Standard Configuration**:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### Prettier Configuration (.prettierrc)

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

## Running Analysis

```bash
# Run ESLint
npx eslint "{src,apps,libs,test}/**/*.ts" --format json --output-file artifacts/02-metrics/eslint-nestjs-report.json

# Run TypeScript compiler checks
npx tsc --noEmit

# Run Prettier check
npx prettier --check "src/**/*.ts"
```

### Package.json Scripts (Standard NestJS)

```json
{
  "scripts": {
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\" \"test/**/*.ts\"",
    "type-check": "tsc --noEmit"
  }
}
```

## NestJS-Specific Code Patterns to Check

### Decorator Usage

```typescript
// Ensure decorators are properly formatted
@Controller('users')
export class UsersController {
  @Get()
  findAll(): Promise<User[]> {
    // ...
  }
}
```

### Dependency Injection

```typescript
// Constructor injection (NestJS pattern)
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
}
```

## Verification

```bash
# Verify installations
npx eslint --version
npx tsc --version

# Test on sample NestJS file
cat > test.controller.ts << EOF
import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  getHello(): string {
    return 'Hello World';
  }
}
EOF

npx eslint test.controller.ts
rm test.controller.ts
```

## Output Format

- **ESLint**: JSON, stylish (console), SARIF
- **TypeScript**: Plain text
- **Prettier**: Plain text (list of unformatted files)

## Common NestJS Patterns

### Module Structure Check

```typescript
// Well-structured NestJS module
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### Guard/Interceptor/Pipe Patterns

```typescript
// Custom guards should implement CanActivate
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // ...
  }
}
```

## Common Issues

**Issue**: `experimentalDecorators` error
**Solution**: Ensure `experimentalDecorators: true` and `emitDecoratorMetadata: true` in tsconfig.json

**Issue**: ESLint can't find TypeScript config
**Solution**: Set `parserOptions.tsconfigRootDir: __dirname` in .eslintrc.js

**Issue**: Prettier conflicts with ESLint
**Solution**: Use `eslint-config-prettier` to disable conflicting rules

## Additional Analysis Tools

### SonarQube (Optional)

For enterprise NestJS projects:

```bash
# Run SonarScanner with TypeScript support
sonar-scanner \
  -Dsonar.projectKey=my-nestjs-project \
  -Dsonar.sources=src \
  -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
```

## See Also

- [Main Environment Setup](../02-environment-setup.md)
- [Node.js/TypeScript Setup](backend-nodejs.md) - for base Node.js configuration
- [Verification Scripts](verification-scripts.md)

## NestJS CLI Integration

```bash
# Generate new resource with consistent patterns
nest generate resource users

# All generated code follows configured ESLint rules
```
