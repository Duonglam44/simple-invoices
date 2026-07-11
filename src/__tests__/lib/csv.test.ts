import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("joins headers and rows with CRLF and a BOM", () => {
    const csv = toCsv(["a", "b"], [["1", "2"]]);
    expect(csv).toBe("﻿a,b\r\n1,2\r\n");
  });

  it("quotes cells containing commas, quotes, or newlines", () => {
    const csv = toCsv(["v"], [['say "hi", ok'], ["line1\nline2"]]);
    expect(csv).toContain('"say ""hi"", ok"');
    expect(csv).toContain('"line1\nline2"');
  });

  it("serialises null/undefined as empty cells and numbers verbatim", () => {
    const csv = toCsv(["a", "b", "c"], [[null, undefined, 230.1]]);
    expect(csv).toContain(",,230.1");
  });

  it("leaves plain cells unquoted", () => {
    const csv = toCsv(["a"], [["hello"]]);
    expect(csv).toContain("hello");
    expect(csv).not.toContain('"hello"');
  });

  it("neutralises formula-injection prefixes on string cells", () => {
    const csv = toCsv(
      ["a"],
      [["=1+1"], ["+SUM(A1:A9)"], ["-2"], ["@cmd"], ["\tping"]],
    );
    expect(csv).toContain("'=1+1");
    expect(csv).toContain("'+SUM(A1:A9)");
    expect(csv).toContain("'-2");
    expect(csv).toContain("'@cmd");
    expect(csv).toContain("'\tping");
  });

  it("does not prefix numeric cells even when negative", () => {
    const csv = toCsv(["a"], [[-2]]);
    expect(csv).toContain("\r\n-2\r\n");
    expect(csv).not.toContain("'-2");
  });
});
