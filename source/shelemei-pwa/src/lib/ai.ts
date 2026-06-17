import { buildDashboardMetrics } from "./metrics";
import type { EjaculationRecord, PeriodRange } from "./types";

export interface PeriodSummary {
  title: string;
  body: string;
  suggestion: string;
}

export interface AiProvider {
  generateSingleFeedback(record: EjaculationRecord, recentRecords: EjaculationRecord[]): Promise<string>;
  generatePeriodSummary(records: EjaculationRecord[], range: PeriodRange): Promise<PeriodSummary>;
}

export class MockAiProvider implements AiProvider {
  async generateSingleFeedback(record: EjaculationRecord): Promise<string> {
    if (record.reactionTags.includes("困")) {
      return "这次射后困意比较明显，今晚别硬撑，早点睡比复盘更重要。";
    }
    if (record.triggerTags.includes("睡前无聊") || record.triggerTags.includes("刷到刺激")) {
      return "这次更像被睡前刺激带跑。下次可以先给自己 20 分钟无屏缓冲。";
    }
    if (record.reason === "干一炮" && record.pleasureScore >= 8) {
      return "这次状态挺正向，释放槽也高。记下来就好，不用过度分析。";
    }
    if (record.postState === "不太行") {
      return "这次体验一般，先看诱因和休息，别把一次状态当成结论。";
    }
    return "本次已记下，状态整体稳定。继续观察频率、诱因和射后反应就行。";
  }

  async generatePeriodSummary(records: EjaculationRecord[], range: PeriodRange): Promise<PeriodSummary> {
    const metrics = buildDashboardMetrics(records, new Date(), range);
    if (records.length === 0) {
      return {
        title: "先记一次，别想太多",
        body: "目前还没有记录，AI 暂时看不出你的节奏。",
        suggestion: "下次点右下角冲/干，10 秒记完就够。",
      };
    }

    const topTrigger = metrics.commonTriggerTags[0]?.tag;
    const topReaction = metrics.commonReactionTags[0]?.tag;
    const moreSolo = metrics.reasonCounts["撸啊撸"] >= metrics.reasonCounts["干一炮"];
    const title = topTrigger ? `${range} 天里，${topTrigger}是主要触发` : `${range} 天节奏整体可观察`;
    const body = `${range} 天内记录 ${records.length} 次，平均释放槽 ${metrics.averagePleasure || 0}/10，常见反应是${topReaction ?? "暂无明显标签"}。`;
    const suggestion = moreSolo
      ? "如果睡前冲动偏多，下周先试 20 分钟无屏缓冲。"
      : "干一炮记录偏正向时，可以重点观察恢复和睡眠。";

    return { title, body, suggestion };
  }
}

export class HttpAiProvider implements AiProvider {
  constructor(private readonly endpoint: string) {}

  async generateSingleFeedback(record: EjaculationRecord, recentRecords: EjaculationRecord[]): Promise<string> {
    const response = await fetch(`${this.endpoint}/single-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record, recentRecords }),
    });
    if (!response.ok) throw new Error("AI feedback request failed");
    const data = (await response.json()) as { feedback: string };
    return data.feedback;
  }

  async generatePeriodSummary(records: EjaculationRecord[], range: PeriodRange): Promise<PeriodSummary> {
    const response = await fetch(`${this.endpoint}/period-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records, range }),
    });
    if (!response.ok) throw new Error("AI summary request failed");
    return (await response.json()) as PeriodSummary;
  }
}
