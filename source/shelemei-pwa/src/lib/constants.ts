import type { EjaculationReason, PostState, RecordDraft } from "./types";

export const STORAGE_KEY = "shelemei.records.v1";

export const REASONS: EjaculationReason[] = ["撸啊撸", "干一炮"];
export const POST_STATES: PostState[] = ["爽", "一般", "不太行"];

export const QUICK_REACTION_TAGS = ["放松", "困", "空虚", "精神好"];
export const DETAIL_REACTION_TAGS = ["腰酸", "后悔", "想再来", "疲惫", "焦虑", "满足"];
export const TRIGGER_TAGS = ["睡前无聊", "压力大", "刷到刺激", "想睡觉", "氛围到了", "对方主动"];

export function createDefaultDraft(reason: EjaculationReason, now = new Date()): RecordDraft {
  return {
    occurredAt: now.toISOString(),
    reason,
    pleasureScore: reason === "干一炮" ? 8 : 6,
    postState: "爽",
    reactionTags: ["放松"],
    triggerTags: [],
    note: "",
  };
}
