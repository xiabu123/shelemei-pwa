import { BarChart3, History, Home, Info, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MockAiProvider, type AiProvider, type PeriodSummary } from "./lib/ai";
import {
  DETAIL_REACTION_TAGS,
  POST_STATES,
  QUICK_REACTION_TAGS,
  REASONS,
  TRIGGER_TAGS,
  createDefaultDraft,
} from "./lib/constants";
import { buildDashboardMetrics, recordsInLastDays } from "./lib/metrics";
import { createRecordRepository } from "./lib/repository";
import type { EjaculationRecord, PeriodRange, RecordDraft } from "./lib/types";

type Tab = "home" | "data" | "history";

const aiProvider: AiProvider = new MockAiProvider();

function getRepository() {
  return createRecordRepository(window.localStorage);
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function toInputDateTime(iso: string): string {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromInputDateTime(value: string): string {
  return new Date(value).toISOString();
}

function hasRecentDuplicate(records: EjaculationRecord[], now = new Date()): boolean {
  return records.some((record) => Math.abs(now.getTime() - new Date(record.occurredAt).getTime()) < 3 * 60 * 1000);
}

function recordToDraft(record: EjaculationRecord): RecordDraft {
  return {
    id: record.id,
    occurredAt: record.occurredAt,
    reason: record.reason,
    pleasureScore: record.pleasureScore,
    postState: record.postState,
    reactionTags: [...record.reactionTags],
    triggerTags: [...record.triggerTags],
    note: record.note,
  };
}

export function App() {
  const repository = useMemo(() => getRepository(), []);
  const [records, setRecords] = useState<EjaculationRecord[]>(() => repository.list());
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [range, setRange] = useState<PeriodRange>(7);
  const [draft, setDraft] = useState<RecordDraft | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const metrics = useMemo(() => buildDashboardMetrics(records, new Date(), range), [records, range]);
  const periodRecords = useMemo(() => recordsInLastDays(records, range), [records, range]);

  useEffect(() => {
    let alive = true;
    setSummaryLoading(true);
    aiProvider
      .generatePeriodSummary(periodRecords, range)
      .then((result) => alive && setSummary(result))
      .catch(() => alive && setSummary({ title: "本次先记下", body: "AI 暂时不可用，数据仍然保存在本机。", suggestion: "稍后再回来看看趋势。" }))
      .finally(() => alive && setSummaryLoading(false));
    return () => {
      alive = false;
    };
  }, [periodRecords, range]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const openQuickRecord = () => {
    setDraft(createDefaultDraft("撸啊撸"));
  };

  const saveDraft = async (nextDraft: RecordDraft) => {
    const editing = Boolean(nextDraft.id);
    const existing = nextDraft.id ? records.find((record) => record.id === nextDraft.id) : undefined;
    if (!editing && hasRecentDuplicate(records)) {
      showToast("刚刚已经记过一发，已保存；重复了可以去记录里删。");
    }

    const saved = existing
      ? repository.update({
          ...existing,
          occurredAt: nextDraft.occurredAt,
          reason: nextDraft.reason,
          pleasureScore: nextDraft.pleasureScore,
          postState: nextDraft.postState,
          reactionTags: [...nextDraft.reactionTags],
          triggerTags: [...nextDraft.triggerTags],
          note: nextDraft.note.trim(),
        })
      : repository.save(nextDraft);

    setRecords(repository.list());
    setDraft(null);

    if (!editing) {
      try {
        const feedback = await aiProvider.generateSingleFeedback(saved, repository.list());
        const updated = repository.update({ ...saved, aiFeedback: feedback });
        setRecords((current) => [updated, ...current.filter((record) => record.id !== updated.id)].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()));
      } catch {
        showToast("本次先记下，AI 稍后再分析。");
      }
    }
  };

  const removeRecord = (id: string) => {
    const ok = window.confirm("删除这条记录？删除后首页和数据会重新计算。");
    if (!ok) return;
    repository.remove(id);
    setRecords(repository.list());
    showToast("已删除，数据重新算过了。");
  };

  return (
    <div className="app-shell">
      <main className="phone-frame">
        {activeTab === "home" && <HomeTab metrics={metrics} records={records} onQuickRecord={openQuickRecord} onOpenInfo={() => setInfoOpen(true)} />}
        {activeTab === "data" && (
          <DataTab
            metrics={metrics}
            periodRecords={periodRecords}
            range={range}
            onRangeChange={setRange}
            summary={summary}
            summaryLoading={summaryLoading}
          />
        )}
        {activeTab === "history" && <HistoryTab records={records} onEdit={(record) => setDraft(recordToDraft(record))} onDelete={removeRecord} />}

        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
        {draft && <RecordModal draft={draft} onClose={() => setDraft(null)} onSave={saveDraft} />}
        {infoOpen && <HomeInfoModal metrics={metrics} records={records} onClose={() => setInfoOpen(false)} />}
        {toast && <div className="toast" role="status">{toast}</div>}
      </main>
    </div>
  );
}

function BottomNav({ activeTab, onChange }: { activeTab: Tab; onChange: (tab: Tab) => void }) {
  const items: Array<{ tab: Tab; label: string; icon: typeof Home }> = [
    { tab: "home", label: "首页", icon: Home },
    { tab: "data", label: "AI射", icon: BarChart3 },
    { tab: "history", label: "记录", icon: History },
  ];
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {items.map(({ tab, label, icon: Icon }) => (
        <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => onChange(tab)} aria-label={label} title={label}>
          <Icon size={18} aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}

function HomeTab({
  metrics,
  records,
  onQuickRecord,
  onOpenInfo,
}: {
  metrics: ReturnType<typeof buildDashboardMetrics>;
  records: EjaculationRecord[];
  onQuickRecord: () => void;
  onOpenInfo: () => void;
}) {
  const latestFeedback = records.find((record) => record.aiFeedback)?.aiFeedback;
  return (
    <section className="screen home-screen">
      <button className="home-insight-trigger" onClick={onOpenInfo} aria-label="查看射了没简介和首页数据">
        <span className="trigger-corner">
          <Info size={15} aria-hidden="true" />
        </span>
        <section className="distance-card">
          <p>距离上次发射</p>
          <strong>{metrics.distanceLabel}</strong>
          <span>{metrics.latestRecord ? "节奏健康，别被算法带跑" : "先记一发，别想太多"}</span>
        </section>

        <DayStrip items={metrics.sevenDayStrip} />

        <div className="metric-grid">
          <MetricCard label="本周次数" value={`${metrics.weekCount}`} />
          <MetricCard label="平均释放槽" value={metrics.averagePleasure ? `${metrics.averagePleasure}/10` : "-"} tone="green" />
        </div>
      </button>

      <section className="panel">
        <div className="section-title">
          <h2>最近记录</h2>
          <span>{records.length ? "看全部在记录页" : "还空着"}</span>
        </div>
        <div className="record-stack">
          {records.slice(0, 3).map((record) => (
            <RecordRow key={record.id} record={record} compact />
          ))}
          {records.length === 0 && <EmptyNote title="还没发射记录" body="右下角点冲，10 秒记完第一条。" />}
        </div>
      </section>

      <section className="ai-card">
        <p>AI 教练</p>
        <h2>{metrics.latestRecord ? "最近状态挺稳" : "先攒一点样本"}</h2>
        <span>{latestFeedback ?? (metrics.latestRecord ? "记录已保存，继续观察频率、诱因和射后反应。" : "记一条之后，我再帮你看模式。")}</span>
      </section>

      <div className="quick-actions" aria-label="快捷记录">
        <button className="fab solo" onClick={onQuickRecord} aria-label="冲，打开快捷记录">
          冲
        </button>
      </div>
    </section>
  );
}

function DataTab({
  metrics,
  periodRecords,
  range,
  onRangeChange,
  summary,
  summaryLoading,
}: {
  metrics: ReturnType<typeof buildDashboardMetrics>;
  periodRecords: EjaculationRecord[];
  range: PeriodRange;
  onRangeChange: (range: PeriodRange) => void;
  summary: PeriodSummary | null;
  summaryLoading: boolean;
}) {
  const maxPleasure = Math.max(1, ...periodRecords.map((record) => record.pleasureScore));
  return (
    <section className="screen data-screen">
      <section className="ai-card data-summary ai-lead">
        <p>AI射分析</p>
        <h2>{summaryLoading ? "正在复盘..." : summary?.title ?? "暂无总结"}</h2>
        <span>{summary ? `${summary.body} ${summary.suggestion}` : "先多记几次，AI 才能看出你的节奏。"}</span>
      </section>

      <section className="distance-card data-hero">
        <p>{range} 天节奏</p>
        <strong>{periodRecords.length} 次</strong>
        <span>平均间隔 {metrics.averageIntervalDays ? `${metrics.averageIntervalDays} 天` : "样本不够"}</span>
      </section>
      <DayStrip items={metrics.sevenDayStrip} />

      <div className="metric-grid">
        <MetricCard label="撸啊撸" value={`${metrics.reasonCounts["撸啊撸"]}`} />
        <MetricCard label="干一炮" value={`${metrics.reasonCounts["干一炮"]}`} tone="gold" />
      </div>

      <section className="panel">
        <div className="section-title">
          <h2>释放槽趋势</h2>
          <span>{metrics.averagePleasure ? `${metrics.averagePleasure}/10` : "暂无"}</span>
        </div>
        <div className="bar-chart" aria-label="释放槽趋势">
          {periodRecords.slice(0, 8).reverse().map((record) => (
            <div key={record.id} className="bar-wrap" title={`${record.reason} ${record.pleasureScore}/10`}>
              <div className="bar" style={{ height: `${Math.max(18, (record.pleasureScore / maxPleasure) * 76)}%` }} />
            </div>
          ))}
          {periodRecords.length === 0 && <EmptyNote title="还没有趋势" body="记录越轻，趋势越容易长出来。" />}
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>常见后续反应</h2>
          <span>Top {metrics.commonReactionTags.length}</span>
        </div>
        <TagCloud tags={metrics.commonReactionTags} emptyText="还没有反应标签" />
      </section>

      <div className="range-switch" aria-label="时间范围">
        {[7, 30].map((item) => (
          <button key={item} className={range === item ? "active" : ""} onClick={() => onRangeChange(item as PeriodRange)} aria-label={`${item}天`}>
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}

function HistoryTab({
  records,
  onEdit,
  onDelete,
}: {
  records: EjaculationRecord[];
  onEdit: (record: EjaculationRecord) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="screen history-screen">
      <div className="history-list">
        {records.map((record) => (
          <article className="history-item" key={record.id}>
            <RecordRow record={record} />
            <div className="history-actions">
              <button onClick={() => onEdit(record)} aria-label={`编辑 ${record.reason} 记录`}>
                <Pencil size={16} />
                编辑
              </button>
              <button className="danger" onClick={() => onDelete(record.id)} aria-label={`删除 ${record.reason} 记录`}>
                <Trash2 size={16} />
                删除
              </button>
            </div>
          </article>
        ))}
        {records.length === 0 && <EmptyNote title="还没有历史" body="首页右下角点一下，就会出现在这里。" />}
      </div>
    </section>
  );
}

function HomeInfoModal({
  metrics,
  records,
  onClose,
}: {
  metrics: ReturnType<typeof buildDashboardMetrics>;
  records: EjaculationRecord[];
  onClose: () => void;
}) {
  const latest = records[0];
  const commonReaction = metrics.commonReactionTags[0];

  return (
    <div className="modal-backdrop info-backdrop" role="dialog" aria-modal="true" aria-label="射了没简介和数据">
      <div className="info-card">
        <button className="sheet-close" onClick={onClose} aria-label="关闭简介浮窗">
          <X size={20} />
        </button>
        <p className="info-kicker">射了没</p>
        <h2>一个不装正经的身体节奏表</h2>
        <span className="info-copy">每次只记原因、释放槽和射后状态。它不替你羞耻，也不替你诊断，只帮你把冲动、频率和状态看清楚。</span>

        <div className="info-stats" aria-label="当前首页数据">
          <MetricCard label="距离上次" value={metrics.distanceLabel} />
          <MetricCard label="今日" value={`${metrics.todayCount} 次`} tone="gold" />
          <MetricCard label="本周" value={`${metrics.weekCount} 次`} tone="green" />
          <MetricCard label="平均释放槽" value={metrics.averagePleasure ? `${metrics.averagePleasure}/10` : "-"} />
        </div>

        <div className="info-list">
          <div>
            <strong>7 天节奏条</strong>
            <span>深色是今天，有记录会填色；黄色代表干一炮，紫色代表撸啊撸。</span>
          </div>
          <div>
            <strong>最近模式</strong>
            <span>{latest ? `最近一次是${latest.reason}，释放槽 ${latest.pleasureScore}/10。` : "还没有样本，先从右下角冲或干开始。"}</span>
          </div>
          <div>
            <strong>常见反应</strong>
            <span>{commonReaction ? `${commonReaction.tag} 出现 ${commonReaction.count} 次。` : "多记几次后，这里会显示你的射后反应模式。"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordModal({ draft, onClose, onSave }: { draft: RecordDraft; onClose: () => void; onSave: (draft: RecordDraft) => void }) {
  const [value, setValue] = useState<RecordDraft>(draft);
  const [expanded, setExpanded] = useState(Boolean(draft.id && (draft.triggerTags.length || draft.note)));

  const toggleTag = (field: "reactionTags" | "triggerTags", tag: string) => {
    setValue((current) => {
      const tags = current[field];
      return {
        ...current,
        [field]: tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag],
      };
    });
  };

  const submit = () => onSave(value);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="快捷记录">
      <div className={`record-sheet ${expanded ? "expanded" : ""}`}>
        <button className="sheet-close" onClick={onClose} aria-label="关闭记录弹层">
          <X size={20} />
        </button>
        <div className="drag-handle" />
        <div className="sheet-heading">
          <div>
            <span>这次冲哪种</span>
            <h2>快捷记录</h2>
          </div>
          <span className="reason-badge">{value.reason}</span>
        </div>

        <div className="reason-choice" aria-label="发射原因">
          {REASONS.map((reason) => (
            <button key={reason} className={value.reason === reason ? "selected" : ""} onClick={() => setValue((current) => ({ ...current, reason }))}>
              {reason}
            </button>
          ))}
        </div>

        <label className="field-label" htmlFor="occurredAt">发生时间</label>
        <input
          id="occurredAt"
          className="datetime-input"
          type="datetime-local"
          value={toInputDateTime(value.occurredAt)}
          onChange={(event) => setValue((current) => ({ ...current, occurredAt: fromInputDateTime(event.target.value) }))}
        />

        <PleasureMeter value={value.pleasureScore} onChange={(pleasureScore) => setValue((current) => ({ ...current, pleasureScore }))} />

        <div className="field-group">
          <span className="field-label">事后感觉</span>
          <div className="state-grid">
            {POST_STATES.map((state) => (
              <button key={state} className={value.postState === state ? "selected" : ""} onClick={() => setValue((current) => ({ ...current, postState: state }))}>
                {state}
              </button>
            ))}
          </div>
        </div>

        <TagPicker label="事后反应" tags={QUICK_REACTION_TAGS} selected={value.reactionTags} onToggle={(tag) => toggleTag("reactionTags", tag)} />

        {expanded && (
          <div className="detail-fields">
            <TagPicker label="为什么会射" tags={TRIGGER_TAGS} selected={value.triggerTags} onToggle={(tag) => toggleTag("triggerTags", tag)} />
            <TagPicker label="更多反应" tags={DETAIL_REACTION_TAGS} selected={value.reactionTags} onToggle={(tag) => toggleTag("reactionTags", tag)} />
            <label className="field-label" htmlFor="note">随手补一句</label>
            <textarea
              id="note"
              className="note-input"
              placeholder="比如：本来想睡，结果刷到太刺激..."
              value={value.note}
              onChange={(event) => setValue((current) => ({ ...current, note: event.target.value }))}
            />
            <div className="privacy-note">AI 只看频率、诱因、释放槽和射后状态，不分析伴侣或对象。</div>
          </div>
        )}

        <div className="sheet-actions">
          <button className="secondary-action" onClick={() => setExpanded((current) => !current)}>
            {expanded ? "收起详情" : "展开补充"}
          </button>
          <button className="primary-action" onClick={submit}>
            保存记录
          </button>
        </div>
      </div>
    </div>
  );
}

function PleasureMeter({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="field-group">
      <div className="meter-title">
        <span className="field-label">释放槽</span>
        <strong>{value}/10</strong>
      </div>
      <div className="pleasure-meter" role="slider" aria-label="释放槽" aria-valuemin={1} aria-valuemax={10} aria-valuenow={value}>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
          <button key={score} className={score <= value ? "filled" : ""} onClick={() => onChange(score)} aria-label={`释放槽 ${score}`} />
        ))}
      </div>
    </div>
  );
}

function TagPicker({ label, tags, selected, onToggle }: { label: string; tags: string[]; selected: string[]; onToggle: (tag: string) => void }) {
  return (
    <div className="field-group">
      <span className="field-label">{label}</span>
      <div className="tag-picker">
        {tags.map((tag) => (
          <button key={tag} className={selected.includes(tag) ? "selected" : ""} onClick={() => onToggle(tag)}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

function DayStrip({ items }: { items: ReturnType<typeof buildDashboardMetrics>["sevenDayStrip"] }) {
  return (
    <div className="day-strip" aria-label="最近七天节奏">
      {items.map((item) => (
        <span
          key={item.dateKey}
          className={`day-cell ${item.count ? "has-record" : ""} ${item.primaryReason === "干一炮" ? "sex" : ""} ${item.isToday ? "today" : ""}`}
          title={`${item.label} ${item.count ? `${item.count} 次` : "没射"}`}
        />
      ))}
    </div>
  );
}

function MetricCard({ label, value, tone = "purple" }: { label: string; value: string; tone?: "purple" | "green" | "gold" }) {
  return (
    <div className={`metric-card ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function RecordRow({ record, compact = false }: { record: EjaculationRecord; compact?: boolean }) {
  return (
    <div className={`record-row ${compact ? "compact" : ""}`}>
      <div>
        <strong>{record.reason}</strong>
        <span>{formatDateTime(record.occurredAt)}</span>
      </div>
      <div className="record-score">
        <b>释放槽 {record.pleasureScore}/10</b>
        {!compact && <span>{[record.postState, ...record.reactionTags.slice(0, 2)].join(" · ")}</span>}
      </div>
    </div>
  );
}

function EmptyNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-note">
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function TagCloud({ tags, emptyText }: { tags: Array<{ tag: string; count: number }>; emptyText: string }) {
  if (tags.length === 0) return <EmptyNote title={emptyText} body="多记几次，模式就会冒出来。" />;
  return (
    <div className="tag-cloud">
      {tags.map(({ tag, count }) => (
        <span key={tag}>
          {tag} {count}
        </span>
      ))}
    </div>
  );
}
