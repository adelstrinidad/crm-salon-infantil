import { describe, it, expect } from "vitest";
import { parseEventTypeSort, DEFAULT_EVENT_TYPE_SORT } from "./listFilters";

describe("parseEventTypeSort", () => {
  it("parses a valid field:dir pair", () => {
    expect(parseEventTypeSort("name:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseEventTypeSort("name:desc")).toEqual({ field: "name", dir: "desc" });
    expect(parseEventTypeSort("createdAt:desc")).toEqual({ field: "createdAt", dir: "desc" });
    expect(parseEventTypeSort("createdAt:asc")).toEqual({ field: "createdAt", dir: "asc" });
  });

  it("defaults to name:asc when value is missing", () => {
    expect(parseEventTypeSort(undefined)).toEqual({ field: "name", dir: "asc" });
    expect(parseEventTypeSort("")).toEqual({ field: "name", dir: "asc" });
  });

  it("rejects an unknown field and falls back to the default", () => {
    // Guards against using arbitrary user input as a Prisma column name.
    expect(parseEventTypeSort("password:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseEventTypeSort("name; DROP TABLE:asc")).toEqual({ field: "name", dir: "asc" });
  });

  it("treats any non-desc direction as asc", () => {
    expect(parseEventTypeSort("name:bogus")).toEqual({ field: "name", dir: "asc" });
    expect(parseEventTypeSort("name")).toEqual({ field: "name", dir: "asc" });
  });

  it("DEFAULT_EVENT_TYPE_SORT parses to name:asc", () => {
    expect(parseEventTypeSort(DEFAULT_EVENT_TYPE_SORT)).toEqual({ field: "name", dir: "asc" });
  });
});
