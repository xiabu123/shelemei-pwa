import type { DashboardMetrics, DayStripItem, EjaculationReason, EjaculationRecord, PeriodRange } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function recordsInLastDays(records: EjaculationRecord[], days: PeriodRange | number, now = new Date()): EjaculationRecord[] {
  const end = startOfLocalDay(now).getTime() + DAY_MS;
  const start = end - days * DAY_MS;
  return records.filter((record) => {
    const time = new Date(record.occurredAt).getTime();
    return time >= start && time < end;
  });
}

export function getLatestRecord(records: EjaculationRecord[]): EjaculationRecord | undefined {
  return [...records].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];
}

export function formatDistanceFromLatest(records: EjaculationRecord[], now = new Date()): string {
  const latest = getLatestRecord(records);
  if (!latest) return "还没发射记录";
  const diffMs = Math.max(0, now.getTime() - new Date(latest.occurredAt).getTime());
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 1) return "刚刚";
  if (hours < 24) return `${hours} 小时`;
  return `${Math.floor(hours / 24)} 天`;
}

export function buildDayStrip(records: EjaculationRecord[], days = 7, now = new Date()): DayStripItem[] {
  const today = startOfLocalDay(now);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - 1 - index) * DAY_MS);
    const dateKey = toDateKey(date);
    const dayRecords = records.filter((record) => toDateKey(new Date(record.occurredAt)) === dateKey);
    const latest = getLatestRecord(dayRecords);
    return {
      dateKey,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      count: dayRecords.length,
      primaryReason: latest?.reason,
      isToday: dateKey === toDateKey(today),
    };
  });
}

export function countToday(records: EjaculationRecord[], now = new Date()): number {
  const todayKey = toDateKey(now);
  return records.filter((record) => toDateKey(new Date(record.occurredAt)) === todayKey).length;
}

export function averagePleasure(records: EjaculationRecord[]): number {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, record) => sum + record.pleasureScore, 0);
  return Math.round((total / records.length) * 10) / 10;
}

export function averageIntervalDays(records: EjaculationRecord[]): number {
  const sorted = [...records].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  if (sorted.length < 2) return 0;
  const intervals = sorted.slice(1).map((record, index) => {
    const prev = sorted[index];
    return (new Date(record.occurredAt).getTime() - new Date(prev.occurredAt).getTime()) / DAY_MS;
  });
  const average = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
  return Math.round(average * 10) / 10;
}

export function countReasons(records: EjaculationRecord[]): Record<EjaculationReason, number> {
  return records.reduce<Record<EjaculationReason, number>>(
    (counts, record) => {
      counts[record.reason] += 1;
      return counts;
    },
    { 撸啊撸: 0, 干一炮: 0 },
  );
}

export function countTags(records: EjaculationRecord[], field: "reactionTags" | "triggerTags"): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    record[field].forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, 6);
}

export function buildDashboardMetrics(records: EjaculationRecord[], now = new Date(), range: PeriodRange = 7): DashboardMetrics {
  const periodRecords = recordsInLastDays(records, range, now);
  const weekRecords = recordsInLastDays(records, 7, now);
  return {
    latestRecord: getLatestRecord(records),
    distanceLabel: formatDistanceFromLatest(records, now),
    todayCount: countToday(records, now),
    sevenDayStrip: buildDayStrip(records, 7, now),
    weekCount: weekRecords.length,
    averagePleasure: averagePleasure(periodRecords),
    averageIntervalDays: averageIntervalDays(periodRecords),
    reasonCounts: countReasons(periodRecords),
    commonReactionTags: countTags(periodRecords, "reactionTags"),
    commonTriggerTags: countTags(periodRecords, "triggerTags"),
  };
}
