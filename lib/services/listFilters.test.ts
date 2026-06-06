import { describe, it, expect } from "vitest";
import { parseServiceSort, DEFAULT_SERVICE_SORT } from "./listFilters";

describe("parseServiceSort", () => {
  it("parses a valid field:dir pair", () => {
    expect(parseServiceSort("name:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseServiceSort("price:desc")).toEqual({ field: "price", dir: "desc" });
    expect(parseServiceSort("cost:desc")).toEqual({ field: "cost", dir: "desc" });
    expect(parseServiceSort("createdAt:desc")).toEqual({ field: "createdAt", dir: "desc" });
  });

  it("defaults to name:asc when value is missing", () => {
    expect(parseServiceSort(undefined)).toEqual({ field: "name", dir: "asc" });
    expect(parseServiceSort("")).toEqual({ field: "name", dir: "asc" });
  });

  it("rejects an unknown field and falls back to the default", () => {
    // Guards against using arbitrary user input as a Prisma column name.
    expect(parseServiceSort("password:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseServiceSort("createdAt; DROP TABLE:asc")).toEqual({
      field: "name",
      dir: "asc",
    });
  });

  it("treats any non-desc direction as asc", () => {
    expect(parseServiceSort("price:bogus")).toEqual({ field: "price", dir: "asc" });
    expect(parseServiceSort("name")).toEqual({ field: "name", dir: "asc" });
  });

  it("DEFAULT_SERVICE_SORT parses to name:asc", () => {
    expect(parseServiceSort(DEFAULT_SERVICE_SORT)).toEqual({ field: "name", dir: "asc" });
  });
});
