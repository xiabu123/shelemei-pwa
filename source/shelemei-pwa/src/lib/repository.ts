import { STORAGE_KEY } from "./constants";
import type { EjaculationRecord, RecordDraft } from "./types";

export interface RecordRepository {
  list(): EjaculationRecord[];
  save(draft: RecordDraft): EjaculationRecord;
  update(record: EjaculationRecord): EjaculationRecord;
  remove(id: string): void;
  clear(): void;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortRecords(records: EjaculationRecord[]): EjaculationRecord[] {
  return [...records].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

function parseRecords(raw: string | null): EjaculationRecord[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortRecords(parsed.filter(Boolean));
  } catch {
    return [];
  }
}

export function createRecordRepository(storage: Storage, key = STORAGE_KEY): RecordRepository {
  const read = () => parseRecords(storage.getItem(key));
  const write = (records: EjaculationRecord[]) => storage.setItem(key, JSON.stringify(sortRecords(records)));

  return {
    list() {
      return read();
    },
    save(draft) {
      const now = new Date().toISOString();
      const record: EjaculationRecord = {
        id: draft.id ?? createId(),
        occurredAt: draft.occurredAt,
        reason: draft.reason,
        pleasureScore: Math.max(1, Math.min(10, Math.round(draft.pleasureScore))),
        postState: draft.postState,
        reactionTags: [...draft.reactionTags],
        triggerTags: [...draft.triggerTags],
        note: draft.note.trim(),
        createdAt: now,
        updatedAt: now,
      };
      write([record, ...read().filter((item) => item.id !== record.id)]);
      return record;
    },
    update(record) {
      const updated = { ...record, updatedAt: new Date().toISOString() };
      write(read().map((item) => (item.id === record.id ? updated : item)));
      return updated;
    },
    remove(id) {
      write(read().filter((item) => item.id !== id));
    },
    clear() {
      storage.removeItem(key);
    },
  };
}
