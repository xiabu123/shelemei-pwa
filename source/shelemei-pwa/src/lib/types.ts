export type EjaculationReason = "撸啊撸" | "干一炮";
export type PostState = "爽" | "一般" | "不太行";

export interface EjaculationRecord {
  id: string;
  occurredAt: string;
  reason: EjaculationReason;
  pleasureScore: number;
  postState: PostState;
  reactionTags: string[];
  triggerTags: string[];
  note: string;
  aiFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordDraft {
  id?: string;
  occurredAt: string;
  reason: EjaculationReason;
  pleasureScore: number;
  postState: PostState;
  reactionTags: string[];
  triggerTags: string[];
  note: string;
}

export interface DayStripItem {
  dateKey: string;
  label: string;
  count: number;
  primaryReason?: EjaculationReason;
  isToday: boolean;
}

export interface DashboardMetrics {
  latestRecord?: EjaculationRecord;
  distanceLabel: string;
  todayCount: number;
  sevenDayStrip: DayStripItem[];
  weekCount: number;
  averagePleasure: number;
  averageIntervalDays: number;
  reasonCounts: Record<EjaculationReason, number>;
  commonReactionTags: Array<{ tag: string; count: number }>;
  commonTriggerTags: Array<{ tag: string; count: number }>;
}

export type PeriodRange = 7 | 30;
