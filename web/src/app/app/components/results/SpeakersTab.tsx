import type { AAITranscript } from "@/lib/assemblyai";

export default function SpeakersTab({ transcript }: { transcript: AAITranscript }) {
  const utterances = transcript.utterances ?? [];
  if (utterances.length === 0) {
    return <p className="text-sm text-white/55">No speaker data available.</p>;
  }

  const stats: Record<string, { utterances: number; words: number; ms: number }> = {};
  for (const u of utterances) {
    const s = stats[u.speaker] ?? { utterances: 0, words: 0, ms: 0 };
    s.utterances += 1;
    s.words += u.text.split(/\s+/).filter(Boolean).length;
    s.ms += u.end - u.start;
    stats[u.speaker] = s;
  }

  const totalMs = Object.values(stats).reduce((acc, s) => acc + s.ms, 0);
  const speakers = Object.entries(stats).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {speakers.map(([name, s]) => {
          const pct = totalMs > 0 ? (s.ms / totalMs) * 100 : 0;
          return (
            <div key={name} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-white">{name}</span>
                <span className="text-xs text-white/50">{pct.toFixed(0)}% of talk time</span>
              </div>
              <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#7c5cff] to-[#00d4ff]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/55">
                <span>{s.utterances} turns</span>
                <span>{s.words.toLocaleString()} words</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
