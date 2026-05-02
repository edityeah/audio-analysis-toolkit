import type { AAITranscript } from "@/lib/assemblyai";

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TranscriptTab({ transcript }: { transcript: AAITranscript }) {
  const utterances = transcript.utterances;
  if (utterances && utterances.length > 0) {
    return (
      <div className="space-y-3">
        {utterances.map((u, i) => (
          <div key={i} className="flex gap-3">
            <span className="shrink-0 font-mono text-xs text-white/50 pt-0.5 w-14">
              {formatTime(u.start)}
            </span>
            <span className="shrink-0 inline-flex h-fit items-center rounded-md bg-[#7c5cff]/15 px-2 py-0.5 text-xs font-medium text-[#b5a8ff]">
              {u.speaker}
            </span>
            <p className="text-sm leading-relaxed text-white/85">{u.text}</p>
          </div>
        ))}
      </div>
    );
  }

  if (transcript.text) {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">{transcript.text}</p>;
  }

  return <p className="text-sm text-white/55">No transcript available.</p>;
}
