import { describe, expect, it } from "vitest";
import { nextSort, sortStateFromParams } from "@/lib/sort";

describe("nextSort", () => {
  it("sorts a newly clicked column descending first", () => {
    expect(
      nextSort({ sortBy: "CREATED_DATE", ordering: "DESCENDING" }, "DUE_DATE"),
    ).toEqual({ sortBy: "DUE_DATE", ordering: "DESCENDING" });
  });

  it("toggles direction when the active column is clicked again", () => {
    expect(
      nextSort({ sortBy: "DUE_DATE", ordering: "DESCENDING" }, "DUE_DATE"),
    ).toEqual({ sortBy: "DUE_DATE", ordering: "ASCENDING" });
    expect(
      nextSort({ sortBy: "DUE_DATE", ordering: "ASCENDING" }, "DUE_DATE"),
    ).toEqual({ sortBy: "DUE_DATE", ordering: "DESCENDING" });
  });

  it("resets to descending when switching from another sorted column", () => {
    expect(
      nextSort({ sortBy: "DUE_DATE", ordering: "ASCENDING" }, "INVOICE_DATE"),
    ).toEqual({ sortBy: "INVOICE_DATE", ordering: "DESCENDING" });
  });
});

describe("sortStateFromParams", () => {
  it("falls back to the default sort", () => {
    expect(sortStateFromParams(new URLSearchParams())).toEqual({
      sortBy: "CREATED_DATE",
      ordering: "DESCENDING",
    });
  });

  it("reads explicit values", () => {
    expect(
      sortStateFromParams(new URLSearchParams({ sortBy: "DUE_DATE", ordering: "ASCENDING" })),
    ).toEqual({ sortBy: "DUE_DATE", ordering: "ASCENDING" });
  });

  it("normalises unknown ordering values to descending", () => {
    expect(sortStateFromParams(new URLSearchParams({ ordering: "SIDEWAYS" })).ordering).toBe(
      "DESCENDING",
    );
  });
});
