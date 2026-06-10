import { describe, it, expect } from "vitest";
import { parseInsumoSort, DEFAULT_INSUMO_SORT } from "./listFilters";

describe("parseInsumoSort", () => {
  it("parses a valid field:dir pair", () => {
    expect(parseInsumoSort("name:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseInsumoSort("stockQty:desc")).toEqual({ field: "stockQty", dir: "desc" });
    expect(parseInsumoSort("createdAt:desc")).toEqual({ field: "createdAt", dir: "desc" });
  });

  it("defaults to name:asc when value is missing", () => {
    expect(parseInsumoSort(undefined)).toEqual({ field: "name", dir: "asc" });
    expect(parseInsumoSort("")).toEqual({ field: "name", dir: "asc" });
  });

  it("rejects an unknown field and falls back to the default", () => {
    expect(parseInsumoSort("password:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseInsumoSort("stockQty; DROP TABLE:asc")).toEqual({ field: "name", dir: "asc" });
  });

  it("treats any non-desc direction as asc", () => {
    expect(parseInsumoSort("stockQty:bogus")).toEqual({ field: "stockQty", dir: "asc" });
    expect(parseInsumoSort("createdAt")).toEqual({ field: "createdAt", dir: "asc" });
  });

  it("DEFAULT_INSUMO_SORT parses to name:asc", () => {
    expect(parseInsumoSort(DEFAULT_INSUMO_SORT)).toEqual({ field: "name", dir: "asc" });
  });
});
