import { describe, it, expect } from "vitest";
import { parseProveedorSort, DEFAULT_PROVEEDOR_SORT } from "./listFilters";

describe("parseProveedorSort", () => {
  it("parses a valid field:dir pair", () => {
    expect(parseProveedorSort("name:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseProveedorSort("name:desc")).toEqual({ field: "name", dir: "desc" });
    expect(parseProveedorSort("createdAt:desc")).toEqual({ field: "createdAt", dir: "desc" });
  });

  it("defaults to name:asc when value is missing", () => {
    expect(parseProveedorSort(undefined)).toEqual({ field: "name", dir: "asc" });
    expect(parseProveedorSort("")).toEqual({ field: "name", dir: "asc" });
  });

  it("rejects an unknown field and falls back to the default", () => {
    // Guards against using arbitrary user input as a Prisma column name.
    expect(parseProveedorSort("password:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseProveedorSort("createdAt; DROP TABLE:asc")).toEqual({
      field: "name",
      dir: "asc",
    });
  });

  it("treats any non-desc direction as asc", () => {
    expect(parseProveedorSort("name:bogus")).toEqual({ field: "name", dir: "asc" });
    expect(parseProveedorSort("createdAt")).toEqual({ field: "createdAt", dir: "asc" });
  });

  it("DEFAULT_PROVEEDOR_SORT parses to name:asc", () => {
    expect(parseProveedorSort(DEFAULT_PROVEEDOR_SORT)).toEqual({ field: "name", dir: "asc" });
  });
});
