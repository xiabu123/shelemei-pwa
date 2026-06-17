import { describe, expect, it } from "vitest";
import { createDefaultDraft } from "./constants";
import { createRecordRepository } from "./repository";

describe("record repository", () => {
  it("saves, updates, lists, and removes records", () => {
    const repo = createRecordRepository(window.localStorage, "test.records");
    const saved = repo.save(createDefaultDraft("撸啊撸", new Date("2026-06-16T10:00:00+08:00")));

    expect(repo.list()).toHaveLength(1);
    expect(saved.reason).toBe("撸啊撸");

    const updated = repo.update({ ...saved, reason: "干一炮", pleasureScore: 9 });
    expect(updated.reason).toBe("干一炮");
    expect(repo.list()[0].pleasureScore).toBe(9);

    repo.remove(saved.id);
    expect(repo.list()).toHaveLength(0);
  });

  it("recovers from invalid storage content", () => {
    window.localStorage.setItem("broken.records", "not-json");
    const repo = createRecordRepository(window.localStorage, "broken.records");
    expect(repo.list()).toEqual([]);
  });
});
