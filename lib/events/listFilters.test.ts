import { describe, it, expect } from "vitest";
import { parseEventSort, DEFAULT_EVENT_SORT } from "./listFilters";

describe("parseEventSort", () => {
  it("parses a valid field:dir pair", () => {
    expect(parseEventSort("name:asc")).toEqual({ field: "name", dir: "asc" });
    expect(parseEventSort("totalPrice:desc")).toEqual({ field: "totalPrice", dir: "desc" });
    expect(parseEventSort("createdAt:desc")).toEqual({ field: "createdAt", dir: "desc" });
  });

  it("defaults to startAt:desc when value is missing", () => {
    expect(parseEventSort(undefined)).toEqual({ field: "startAt", dir: "desc" });
    expect(parseEventSort("")).toEqual({ field: "startAt", dir: "desc" });
  });

  it("rejects an unknown field and falls back to the default", () => {
    // Guards against using arbitrary user input as a Prisma column name.
    expect(parseEventSort("password:asc")).toEqual({ field: "startAt", dir: "desc" });
    expect(parseEventSort("createdAt; DROP TABLE:asc")).toEqual({
      field: "startAt",
      dir: "desc",
    });
  });

  it("treats any non-asc direction as desc", () => {
    expect(parseEventSort("name:bogus")).toEqual({ field: "name", dir: "desc" });
    expect(parseEventSort("name")).toEqual({ field: "name", dir: "desc" });
  });

  it("DEFAULT_EVENT_SORT parses to startAt:desc", () => {
    expect(parseEventSort(DEFAULT_EVENT_SORT)).toEqual({ field: "startAt", dir: "desc" });
  });
});
