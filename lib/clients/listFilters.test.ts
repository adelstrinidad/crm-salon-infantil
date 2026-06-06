import { describe, it, expect } from "vitest";
import { parseClientSort, DEFAULT_CLIENT_SORT } from "./listFilters";

describe("parseClientSort", () => {
  it("parses a valid field:dir pair", () => {
    expect(parseClientSort("name:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseClientSort("name:desc")).toEqual({ field: "name", dir: "desc" });
    expect(parseClientSort("createdAt:desc")).toEqual({ field: "createdAt", dir: "desc" });
  });

  it("defaults to name:asc when value is missing", () => {
    expect(parseClientSort(undefined)).toEqual({ field: "name", dir: "asc" });
    expect(parseClientSort("")).toEqual({ field: "name", dir: "asc" });
  });

  it("rejects an unknown field and falls back to the default", () => {
    // Guards against using arbitrary user input as a Prisma column name.
    expect(parseClientSort("password:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseClientSort("createdAt; DROP TABLE:asc")).toEqual({
      field: "name",
      dir: "asc",
    });
  });

  it("treats any non-desc direction as asc", () => {
    expect(parseClientSort("name:bogus")).toEqual({ field: "name", dir: "asc" });
    expect(parseClientSort("name")).toEqual({ field: "name", dir: "asc" });
  });

  it("DEFAULT_CLIENT_SORT parses to name:asc", () => {
    expect(parseClientSort(DEFAULT_CLIENT_SORT)).toEqual({ field: "name", dir: "asc" });
  });
});
