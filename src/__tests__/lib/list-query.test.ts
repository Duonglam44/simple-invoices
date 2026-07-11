import { describe, expect, it } from "vitest";
import { parseListQuery } from "@/lib/list-query";

function query(params: Record<string, string>) {
  return parseListQuery(new URLSearchParams(params));
}

describe("parseListQuery", () => {
  it("applies safe defaults when nothing is supplied", () => {
    expect(query({})).toEqual({
      pageNum: 1,
      pageSize: 10,
      sortBy: "CREATED_DATE",
      ordering: "DESCENDING",
      keyword: undefined,
      status: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
  });

  it("passes through valid values", () => {
    const result = query({
      page: "3",
      size: "20",
      sortBy: "DUE_DATE",
      ordering: "ASCENDING",
      status: "Paid",
      keyword: "INV123",
      fromDate: "2026-01-01",
      toDate: "2026-07-10",
    });
    expect(result).toEqual({
      pageNum: 3,
      pageSize: 20,
      sortBy: "DUE_DATE",
      ordering: "ASCENDING",
      status: "Paid",
      keyword: "INV123",
      fromDate: "2026-01-01",
      toDate: "2026-07-10",
    });
  });

  it("rejects unknown sort fields, statuses and page sizes", () => {
    const result = query({ sortBy: "DROP TABLE", status: "Hacked", size: "9999" });
    expect(result.sortBy).toBe("CREATED_DATE");
    expect(result.status).toBeUndefined();
    expect(result.pageSize).toBe(10);
  });

  it("clamps nonsense page numbers to 1", () => {
    expect(query({ page: "-5" }).pageNum).toBe(1);
    expect(query({ page: "abc" }).pageNum).toBe(1);
  });

  it("drops malformed dates", () => {
    const result = query({ fromDate: "20/12/2018", toDate: "not-a-date" });
    expect(result.fromDate).toBeUndefined();
    expect(result.toDate).toBeUndefined();
  });

  it("trims and caps overly long keywords", () => {
    const result = query({ keyword: `  ${"x".repeat(200)}  ` });
    expect(result.keyword).toHaveLength(100);
  });
});
