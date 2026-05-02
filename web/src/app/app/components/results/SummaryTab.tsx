import type { AAITranscript } from "@/lib/assemblyai";

export default function SummaryTab({ transcript }: { transcript: AAITranscript }) {
  if (!transcript.summary) {
    return <p className="text-sm text-white/55">No summary available for this clip.</p>;
  }
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
      {transcript.summary}
    </p>
  );
}
