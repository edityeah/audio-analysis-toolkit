"use client";

import { useEffect, useRef, useState } from "react";
import type { AAITranscript } from "@/lib/assemblyai";
import type { SubmissionInfo } from "../AppClient";
import TranscriptTab from "./results/TranscriptTab";
import SummaryTab from "./results/SummaryTab";
import SpeakersTab from "./results/SpeakersTab";
import SentimentTab from "./results/SentimentTab";
import TopicsTab from "./results/TopicsTab";
import ChatTab from "./results/ChatTab";

const TABS = [
  { id: "transcript", label: "📝 Transcript" },
  { id: "summary", label: "📋 Summary" },
  { id: "speakers", label: "👥 Speakers" },
  { id: "sentiment", label: "😊 Sentiment" },
  { id: "topics", label: "🏷️ Topics" },
  { id: "chat", label: "💬 Chat" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Results({
  submission,
  onReset,
}: {
  submission: SubmissionInfo;
  onReset: () => void;
}) {
  const [transcript, setTranscript] = useState<AAITranscript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("transcript");
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/transcribe/${submission.assemblyaiId}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as AAITranscript & { error?: string };
        if (!res.ok) throw new Error(json.error ?? "Polling failed");
        setTranscript(json);

        if (json.status === "completed" || json.status === "error") {
          stoppedRef.current = true;
          if (json.status === "error") setError(json.error ?? "Transcription failed.");
          return;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Polling failed");
        stoppedRef.current = true;
        return;
      }
      timer = setTimeout(poll, 2500);
    }

    void poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [submission.assemblyaiId]);

  const status = transcript?.status ?? "queued";
  const isLoading = status === "queued" || status === "processing";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 backdrop-blur">
        <div>
          <p className="text-sm font-semibold text-white">
            {submission.fileName ?? "Live recording"}
          </p>
          <p className="text-xs text-white/55">
            ~{(submission.estimatedSeconds / 60).toFixed(1)} min · {submission.source === "upload" ? "Uploaded file" : "Browser recording"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={status} />
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10"
          >
            ↺ New
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {isLoading && !transcript?.text && (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#111215] p-10 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#7c5cff]" />
          <p className="font-semibold text-white">Transcribing your audio…</p>
          <p className="mt-1 text-sm text-white/55">
            Usually 30s–60s for short clips. Stay on this page.
          </p>
        </div>
      )}

      {transcript && transcript.status === "completed" && (
        <>
          <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] text-white shadow-md shadow-purple-900/30"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#111215] p-6">
            {tab === "transcript" && <TranscriptTab transcript={transcript} />}
            {tab === "summary" && <SummaryTab transcript={transcript} />}
            {tab === "speakers" && <SpeakersTab transcript={transcript} />}
            {tab === "sentiment" && <SentimentTab transcript={transcript} />}
            {tab === "topics" && <TopicsTab transcript={transcript} />}
            {tab === "chat" && <ChatTab assemblyaiId={submission.assemblyaiId} />}
          </div>
        </>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    queued: { label: "Queued", cls: "border-white/15 bg-white/5 text-white/70" },
    processing: { label: "Processing", cls: "border-[#7c5cff]/30 bg-[#7c5cff]/10 text-[#b5a8ff]" },
    completed: { label: "✓ Done", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    error: { label: "Failed", cls: "border-red-500/30 bg-red-500/10 text-red-200" },
  };
  const m = map[status] ?? map.queued;
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  );
}
