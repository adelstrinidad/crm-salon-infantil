# Template 12: DTO Specification (TO-BE)

**Purpose**: Specify TO-BE TypeScript interfaces bridging from AS-IS Java DTOs
**Used By**: Migration planning, Angular implementation, API contract definition
**Step**: Step 07 (Synthesis), TO-BE design phase

---

## Overview

This template specifies TO-BE TypeScript interfaces for Angular applications, with full traceability to AS-IS Java DTOs and business rules.

**Key Principles** (Context7 Angular Best Practices):
- Use TypeScript **interfaces** (not classes) for DTOs
- Separate **Domain models** (API responses, immutable) from **Form models** (UI input, mutable)
- Use `readonly` for immutable fields
- Align with OpenAPI 3.0 for Spring Boot REST backend

---

## Module Information

| Attribute | Value |
|-----------|-------|
| **Module** | {MODULE_NAME} |
| **AS-IS Source** | {AS_IS_FOLDER}/dto-catalog.md |
| **TO-BE Target** | Angular {VERSION} + Spring Boot REST |
| **Date** | {DATE} |
| **Status** | [DRAFT] |

---

## 1. Common Types

### 1.1 Branded Types (Type Safety)

```typescript
/**
 * Branded type for {CURRENCY} amounts with {DECIMAL_PLACES} decimal precision
 * AS-IS: BigDecimal in Java
 */
export type {Currency}Amount = number & { readonly brand: '{Currency}Amount' };

/**
 * Branded type for Tax Identification Number
 * AS-IS: String with format validation
 */
export type TaxId = string & { readonly brand: 'TaxId' };

/**
 * ISO 8601 date string (YYYY-MM-DD)
 * AS-IS: LocalDate in Java
 */
export type ISODateString = string & { readonly brand: 'ISODateString' };

/**
 * ISO 8601 datetime string
 * AS-IS: LocalDateTime in Java
 */
export type ISODateTimeString = string & { readonly brand: 'ISODateTimeString' };
```

### 1.2 Tax Type Enumeration

```typescript
/**
 * Tax type codes
 * AS-IS: TaxType enum / TaxTypeEnum
 * Source: {SOURCE_FILE}:{LINE}
 */
export type TaxTypeCode =
  | '{TAX_TYPE_1}'  // {TAX_TYPE_1_DESCRIPTION}
  | '{TAX_TYPE_2}'  // {TAX_TYPE_2_DESCRIPTION}
  | '{TAX_TYPE_3}'; // {TAX_TYPE_3_DESCRIPTION}

/**
 * Tax type display information (i18n)
 */
export interface TaxTypeInfo {
  readonly code: TaxTypeCode;
  readonly nameEn: string;
  readonly nameAr: string;
}

export const TAX_TYPES: ReadonlyMap<TaxTypeCode, TaxTypeInfo> = new Map([
  ['{TAX_TYPE_1}', { code: '{TAX_TYPE_1}', nameEn: '{NAME_EN}', nameAr: '{NAME_AR}' }],
  // ... additional tax types
]);
```

### 1.3 Status Enumerations

```typescript
/**
 * {Entity} status values
 * AS-IS: {AS_IS_STATUS_SOURCE}
 * BR: {BUSINESS_RULE_ID}
 */
export type {Entity}Status =
  | '{STATUS_1}'  // {STATUS_1_DESCRIPTION}
  | '{STATUS_2}'  // {STATUS_2_DESCRIPTION}
  | '{STATUS_3}'; // {STATUS_3_DESCRIPTION}
```

---

## 2. Domain Models (API Response DTOs)

Domain models represent data from the API. They are **immutable** (`readonly` fields).

### 2.1 {EntityName}

```typescript
/**
 * {EntityName} domain model
 * AS-IS: {JavaClassName}.java
 * Source: {SOURCE_FILE}:{LINE}
 */
export interface {EntityName} {
  /** Primary identifier */
  readonly {idField}: number;

  /** {FIELD_DESCRIPTION} */
  readonly {fieldName}: {FieldType};

  // ... additional fields
}
```

**Field Mapping**:

| TO-BE Field | Type | AS-IS Field | AS-IS Type | BR |
|-------------|------|-------------|------------|-----|
| {toBeField} | {toBeType} | {asIsField} | {asIsType} | {BR-nnn} |

### 2.2 List Item (Optimized for Tables)

```typescript
/**
 * {EntityName} list item (subset for table display)
 * AS-IS: {JavaListDtoName}.java
 * Source: {SOURCE_FILE}:{LINE}
 */
export interface {EntityName}ListItem {
  readonly {idField}: number;
  // ... fields needed for list display only
}
```

---

## 3. Form Models (UI Input DTOs)

Form models represent user input. They are **mutable** and support `null` for optional fields.

### 3.1 Search Form

```typescript
/**
 * {EntityName} search form
 * AS-IS: Search parameters in controller
 * Source: {SOURCE_FILE}:{LINE}
 */
export interface {EntityName}SearchForm {
  /** {FIELD_DESCRIPTION} */
  {fieldName}: {FieldType} | null;

  // ... additional search fields
}

/**
 * Default search form values
 */
export const DEFAULT_{ENTITY}_SEARCH: {EntityName}SearchForm = {
  {fieldName}: null,
  // ... defaults
};
```

### 3.2 Create/Edit Form

```typescript
/**
 * {EntityName} create/edit form
 * AS-IS: {JavaRequestDtoName}.java
 * Source: {SOURCE_FILE}:{LINE}
 */
export interface {EntityName}Form {
  /** {FIELD_DESCRIPTION} - Required */
  {requiredField}: {FieldType};

  /** {FIELD_DESCRIPTION} - Optional */
  {optionalField}?: {FieldType};
}
```

---

## 4. API Request/Response Models

### 4.1 API Request

```typescript
/**
 * {Operation} request
 * AS-IS: {JavaRequestClassName}.java
 * Endpoint: {HTTP_METHOD} {API_PATH}
 */
export interface {Operation}Request {
  {fieldName}: {FieldType};
}
```

### 4.2 API Response

```typescript
/**
 * {Operation} response
 * AS-IS: {JavaResponseClassName}.java
 * Endpoint: {HTTP_METHOD} {API_PATH}
 */
export interface {Operation}Response {
  readonly {fieldName}: {FieldType};
}
```

### 4.3 Paginated Response

```typescript
/**
 * Paginated list response
 * AS-IS: Page<T> / PaginatedResult
 */
export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly totalCount: number;
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export type {EntityName}ListResponse = PaginatedResponse<{EntityName}ListItem>;
```

---

## 5. Validation Rules

### 5.1 Field Validation

| Field | Validation | BR | Error Message (EN) | Error Message (AR) |
|-------|------------|-----|--------------------|--------------------|
| {fieldName} | {VALIDATION_RULE} | {BR-nnn} | {ERROR_EN} | {ERROR_AR} |

### 5.2 Cross-Field Validation

| Validation | Fields | BR | Condition |
|------------|--------|-----|-----------|
| {VALIDATION_NAME} | {field1}, {field2} | {BR-nnn} | {CONDITION} |

### 5.3 Business Rule Validation

| BR | Rule | Fields | TO-BE Implementation |
|----|------|--------|---------------------|
| {BR-nnn} | {RULE_DESCRIPTION} | {fields} | Validator service / Form validator |

---

## 6. Type Guards

```typescript
/**
 * Type guard for {EntityName}
 */
export function is{EntityName}(obj: unknown): obj is {EntityName} {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '{idField}' in obj &&
    typeof (obj as {EntityName}).{idField} === 'number'
  );
}
```

---

## 7. Traceability Matrix

### 7.1 AS-IS to TO-BE DTO Mapping

| AS-IS DTO | AS-IS Location | TO-BE Interface | Category | Status |
|-----------|----------------|-----------------|----------|--------|
| {JavaDtoName} | {file:line} | {TypeScriptInterface} | Domain/Form/API | MAPPED |

### 7.2 Business Rule Coverage

| BR | Description | AS-IS Location | TO-BE Implementation | Status |
|----|-------------|----------------|---------------------|--------|
| {BR-nnn} | {description} | {file:line} | {component/service} | MAPPED |

---

## 8. Implementation Notes

### 8.1 Angular Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class {EntityName}Service {
  private readonly http = inject(HttpClient);

  get{EntityName}List(params: {EntityName}SearchForm): Observable<{EntityName}ListResponse> {
    return this.http.get<{EntityName}ListResponse>('/api/v1/{entities}', { params });
  }
}
```

### 8.2 Form Builder Pattern

```typescript
private readonly fb = inject(FormBuilder);

readonly form = this.fb.group<{EntityName}Form>({
  {fieldName}: [null, [Validators.required]],
});
```

---

## 9. Verification Checklist

- [ ] All AS-IS DTOs mapped to TO-BE interfaces
- [ ] All business rules have TO-BE implementation reference
- [ ] Type guards created for runtime validation
- [ ] i18n error messages documented (EN/AR)
- [ ] OpenAPI 3.0 alignment verified

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | {DATE} | {AUTHOR} | Initial specification |

---

*Template Version: 1.0*
*Created: 2026-02-05*
*Source: Context7 Angular 21 best practices*
