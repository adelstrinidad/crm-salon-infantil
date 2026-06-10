import { describe, it, expect } from "vitest";
import { parseCompraSort, DEFAULT_COMPRA_SORT } from "./listFilters";

describe("parseCompraSort", () => {
  it("parses a valid field:dir pair", () => {
    expect(parseCompraSort("date:asc")).toEqual({ field: "date", dir: "asc" });
    expect(parseCompraSort("total:asc")).toEqual({ field: "total", dir: "asc" });
    expect(parseCompraSort("createdAt:desc")).toEqual({ field: "createdAt", dir: "desc" });
  });

  it("defaults to date:desc when value is missing", () => {
    expect(parseCompraSort(undefined)).toEqual({ field: "date", dir: "desc" });
    expect(parseCompraSort("")).toEqual({ field: "date", dir: "desc" });
  });

  it("rejects an unknown field and falls back to the default", () => {
    expect(parseCompraSort("password:asc")).toEqual({ field: "date", dir: "desc" });
  });

  it("treats any non-asc direction as desc", () => {
    expect(parseCompraSort("total:bogus")).toEqual({ field: "total", dir: "desc" });
  });

  it("DEFAULT_COMPRA_SORT parses to date:desc", () => {
    expect(parseCompraSort(DEFAULT_COMPRA_SORT)).toEqual({ field: "date", dir: "desc" });
  });
});
