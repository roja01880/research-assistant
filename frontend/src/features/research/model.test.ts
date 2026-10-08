import { describe, expect, it } from "vitest";
import { filterSources, sources, validateUpload } from "./model";
describe("Research fixtures", () => {
  it("filters by topic, type, and year", () => {
    const rows = filterSources(sources, "knowledge graphs", "Paper", "2024", "relevance");
    expect(rows.map((s) => s.id)).toEqual(["s3"]);
  });
  it("sorts newest and oldest without mutating fixtures", () => {
    expect(filterSources(sources, "", "all", "all", "newest")[0]?.year).toBe(2025);
    expect(filterSources(sources, "", "all", "all", "oldest")[0]?.year).toBe(2022);
    expect(sources[0]?.id).toBe("s1");
  });
  it("returns no rows for unrelated query", () =>
    expect(filterSources(sources, "zzzzzz", "all", "all", "relevance")).toEqual([]));
  it("validates file size, type, and empty content", () => {
    expect(validateUpload({ name: "demo.pdf", size: 200 })).toBeNull();
    expect(validateUpload({ name: "demo.exe", size: 200 })).toMatch(/PDF/);
    expect(validateUpload({ name: "demo.pdf", size: 11000000 })).toMatch(/10 MB/);
    expect(validateUpload({ name: "demo.txt", size: 0 })).toMatch(/empty/);
  });
});
