import { describe, expect, it } from "vitest";
import { MockAiProvider } from "./ai";
import type { EjaculationRecord } from "./types";

const baseRecord: EjaculationRecord = {
  id: "1",
  occurredAt: "2026-06-16T10:00:00+08:00",
  reason: "撸啊撸",
  pleasureScore: 6,
  postState: "爽",
  reactionTags: [],
  triggerTags: [],
  note: "",
  createdAt: "2026-06-16T10:00:00+08:00",
  updatedAt: "2026-06-16T10:00:00+08:00",
};

describe("MockAiProvider", () => {
  it("returns stable single feedback for tired reactions", async () => {
    const provider = new MockAiProvider();
    await expect(provider.generateSingleFeedback({ ...baseRecord, reactionTags: ["困"] })).resolves.toContain("困意");
  });

  it("returns a period summary", async () => {
    const provider = new MockAiProvider();
    const summary = await provider.generatePeriodSummary([baseRecord], 7);

    expect(summary.title).toBeTruthy();
    expect(summary.body).toContain("7 天内记录");
    expect(summary.suggestion).toBeTruthy();
  });
});
