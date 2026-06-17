import { describe, expect, it } from "vitest";
import { buildDashboardMetrics, recordsInLastDays } from "./metrics";
import type { EjaculationRecord } from "./types";

function record(id: string, occurredAt: string, pleasureScore: number, reason: EjaculationRecord["reason"] = "撸啊撸"): EjaculationRecord {
  return {
    id,
    occurredAt,
    reason,
    pleasureScore,
    postState: "爽",
    reactionTags: id === "a" ? ["困"] : ["放松"],
    triggerTags: id === "a" ? ["睡前无聊"] : [],
    note: "",
    createdAt: occurredAt,
    updatedAt: occurredAt,
  };
}

describe("metrics", () => {
  const now = new Date("2026-06-16T12:00:00+08:00");
  const records = [
    record("a", "2026-06-16T08:00:00+08:00", 6),
    record("b", "2026-06-14T21:00:00+08:00", 9, "干一炮"),
    record("c", "2026-06-01T21:00:00+08:00", 4),
  ];

  it("builds dashboard metrics from records", () => {
    const metrics = buildDashboardMetrics(records, now, 7);

    expect(metrics.distanceLabel).toBe("4 小时");
    expect(metrics.todayCount).toBe(1);
    expect(metrics.weekCount).toBe(2);
    expect(metrics.averagePleasure).toBe(7.5);
    expect(metrics.reasonCounts).toEqual({ 撸啊撸: 1, 干一炮: 1 });
    expect(metrics.commonReactionTags[0]).toEqual({ tag: "困", count: 1 });
    expect(metrics.sevenDayStrip).toHaveLength(7);
    expect(metrics.sevenDayStrip[metrics.sevenDayStrip.length - 1]?.count).toBe(1);
  });

  it("filters records by period", () => {
    expect(recordsInLastDays(records, 7, now)).toHaveLength(2);
    expect(recordsInLastDays(records, 30, now)).toHaveLength(3);
  });
});
