import { describe, it, expect } from "vitest";
import { parsePage, buildPaginated, DEFAULT_PAGE_SIZE } from "./pagination";

// Pagination drives every list page. parsePage turns an untrusted `?page=`
// string into safe { skip, take }; buildPaginated derives the page count.
// These cover the messy inputs a URL can carry.

describe("parsePage", () => {
  it("defaults to page 1 when the param is missing", () => {
    expect(parsePage(undefined)).toEqual({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      skip: 0,
      take: DEFAULT_PAGE_SIZE,
    });
  });

  it("computes skip from page and pageSize", () => {
    expect(parsePage("3", 10)).toEqual({ page: 3, pageSize: 10, skip: 20, take: 10 });
  });

  it("falls back to page 1 for zero, negative, or non-numeric input", () => {
    expect(parsePage("0").page).toBe(1);
    expect(parsePage("-5").page).toBe(1);
    expect(parsePage("abc").page).toBe(1);
    expect(parsePage("").page).toBe(1);
  });

  it("truncates a decimal page string", () => {
    // parseInt("2.9", 10) === 2
    expect(parsePage("2.9", 10).page).toBe(2);
  });

  it("uses the default page size when none is given", () => {
    expect(parsePage("2").take).toBe(DEFAULT_PAGE_SIZE);
  });
});

describe("buildPaginated", () => {
  const params = { page: 1, pageSize: 20, skip: 0, take: 20 };

  it("wraps rows with total and derived pageCount", () => {
    const result = buildPaginated([1, 2, 3], 45, params);
    expect(result.rows).toEqual([1, 2, 3]);
    expect(result.total).toBe(45);
    expect(result.pageCount).toBe(3); // ceil(45 / 20)
  });

  it("returns at least one page even with zero rows", () => {
    expect(buildPaginated([], 0, params).pageCount).toBe(1);
  });

  it("returns one page when total fits exactly", () => {
    expect(buildPaginated([], 20, params).pageCount).toBe(1);
    expect(buildPaginated([], 21, params).pageCount).toBe(2);
  });
});
