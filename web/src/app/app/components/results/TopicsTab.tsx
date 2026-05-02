import type { AAITranscript } from "@/lib/assemblyai";

export default function TopicsTab({ transcript }: { transcript: AAITranscript }) {
  const summary = transcript.iab_categories_result?.summary;
  if (!summary || Object.keys(summary).length === 0) {
    return <p className="text-sm text-white/55">No topics detected.</p>;
  }
  const sorted = Object.entries(summary).sort((a, b) => b[1] - a[1]);
  const max = sorted[0][1] || 1;

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map(([topic, score]) => {
        const intensity = score / max; // 0..1
        const opacity = 0.3 + 0.7 * intensity;
        return (
          <span
            key={topic}
            className="rounded-full border border-[#7c5cff]/40 px-3 py-1.5 text-sm text-white"
            style={{ background: `rgba(124, 92, 255, ${0.08 + 0.18 * intensity})`, opacity }}
            title={`Confidence: ${(score * 100).toFixed(1)}%`}
          >
            {topic.replace(/^.*>/, "")}
          </span>
        );
      })}
    </div>
  );
}
