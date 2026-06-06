import { describe, it, expect } from "vitest";
import { parseProviderSort, DEFAULT_PROVIDER_SORT } from "./listFilters";

describe("parseProviderSort", () => {
  it("parses a valid field:dir pair", () => {
    expect(parseProviderSort("name:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseProviderSort("name:desc")).toEqual({ field: "name", dir: "desc" });
    expect(parseProviderSort("cost:desc")).toEqual({ field: "cost", dir: "desc" });
    expect(parseProviderSort("createdAt:desc")).toEqual({ field: "createdAt", dir: "desc" });
  });

  it("defaults to name:asc when value is missing", () => {
    expect(parseProviderSort(undefined)).toEqual({ field: "name", dir: "asc" });
    expect(parseProviderSort("")).toEqual({ field: "name", dir: "asc" });
  });

  it("rejects an unknown field and falls back to the default", () => {
    // Guards against using arbitrary user input as a Prisma column name.
    expect(parseProviderSort("password:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseProviderSort("createdAt; DROP TABLE:asc")).toEqual({
      field: "name",
      dir: "asc",
    });
  });

  it("treats any non-desc direction as asc", () => {
    expect(parseProviderSort("cost:bogus")).toEqual({ field: "cost", dir: "asc" });
    expect(parseProviderSort("cost")).toEqual({ field: "cost", dir: "asc" });
  });

  it("DEFAULT_PROVIDER_SORT parses to name:asc", () => {
    expect(parseProviderSort(DEFAULT_PROVIDER_SORT)).toEqual({ field: "name", dir: "asc" });
  });
});
