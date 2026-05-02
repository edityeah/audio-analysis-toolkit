import type { AAITranscript } from "@/lib/assemblyai";

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  POSITIVE: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/30" },
  NEUTRAL:  { bg: "bg-white/[0.04]",   text: "text-white/70",    border: "border-white/15" },
  NEGATIVE: { bg: "bg-red-500/10",     text: "text-red-300",     border: "border-red-500/30" },
};

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SentimentTab({ transcript }: { transcript: AAITranscript }) {
  const items = transcript.sentiment_analysis_results ?? [];
  if (items.length === 0) {
    return <p className="text-sm text-white/55">No sentiment data available.</p>;
  }

  const counts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 };
  for (const it of items) counts[it.sentiment] += 1;
  const total = counts.POSITIVE + counts.NEUTRAL + counts.NEGATIVE || 1;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 grid-cols-3">
        {(["POSITIVE", "NEUTRAL", "NEGATIVE"] as const).map((s) => {
          const c = COLORS[s];
          const pct = (counts[s] / total) * 100;
          return (
            <div key={s} className={`rounded-xl border ${c.border} ${c.bg} p-4 text-center`}>
              <p className={`text-2xl font-bold ${c.text}`}>{counts[s]}</p>
              <p className="text-xs uppercase tracking-wider text-white/55">{s.toLowerCase()}</p>
              <p className="mt-1 text-xs text-white/40">{pct.toFixed(0)}%</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        {items.map((it, i) => {
          const c = COLORS[it.sentiment];
          return (
            <div key={i} className={`rounded-xl border ${c.border} ${c.bg} p-3`}>
              <div className="mb-1 flex items-center gap-2 text-xs">
                <span className="font-mono text-white/50">{formatTime(it.start)}</span>
                {it.speaker && (
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/70">{it.speaker}</span>
                )}
                <span className={`ml-auto font-medium ${c.text}`}>{it.sentiment.toLowerCase()}</span>
              </div>
              <p className="text-sm text-white/85">{it.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
