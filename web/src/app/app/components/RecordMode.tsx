"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { SubmissionInfo } from "../AppClient";

const MAX_RECORD_SECONDS = 600; // 10 minutes hard cap

type Phase = "idle" | "recording" | "recorded" | "uploading" | "submitting";

export default function RecordMode({
  remainingSeconds,
  onSubmitted,
}: {
  remainingSeconds: number;
  onSubmitted: (s: SubmissionInfo) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [recorded, setRecorded] = useState<{ blob: Blob; url: string; duration: number } | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopAtRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number>(0);

  // Cap recording length at min(MAX_RECORD_SECONDS, remainingSeconds).
  const maxSeconds = Math.min(MAX_RECORD_SECONDS, remainingSeconds);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopRecorder();
      if (tickRef.current) clearInterval(tickRef.current);
      if (stopAtRef.current) clearTimeout(stopAtRef.current);
      if (recorded) URL.revokeObjectURL(recorded.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopRecorder() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  }

  async function startRecording() {
    setError(null);
    setRecorded(null);
    chunksRef.current = [];
    setElapsed(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setError(
        e instanceof Error
          ? `Mic permission denied: ${e.message}`
          : "Could not access your microphone.",
      );
      return;
    }

    const mr = new MediaRecorder(stream);
    recorderRef.current = mr;
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
      const url = URL.createObjectURL(blob);
      const seconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      setRecorded({ blob, url, duration: seconds });
      setPhase("recorded");
      mr.stream.getTracks().forEach((t) => t.stop());
    };

    startedAtRef.current = Date.now();
    mr.start();
    setPhase("recording");

    tickRef.current = setInterval(() => {
      const e = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setElapsed(e);
    }, 250);

    stopAtRef.current = setTimeout(() => {
      stopRecording();
    }, maxSeconds * 1000);
  }

  function stopRecording() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (stopAtRef.current) {
      clearTimeout(stopAtRef.current);
      stopAtRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function discard() {
    if (recorded) URL.revokeObjectURL(recorded.url);
    setRecorded(null);
    setPhase("idle");
    setElapsed(0);
  }

  async function handleSubmit() {
    if (!recorded) return;
    setError(null);
    setPhase("uploading");
    setProgress(0);

    const filename = `recording-${Date.now()}.webm`;
    const file = new File([recorded.blob], filename, { type: recorded.blob.type });

    let blobUrl: string;
    try {
      const result = await upload(filename, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        onUploadProgress: (p) => setProgress(p.percentage),
      });
      blobUrl = result.url;
    } catch (e) {
      setPhase("recorded");
      setError(e instanceof Error ? e.message : "Upload failed");
      return;
    }

    setPhase("submitting");
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          audioUrl: blobUrl,
          fileName: filename,
          source: "recording",
          estimatedDurationSeconds: recorded.duration,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");
      onSubmitted({
        assemblyaiId: json.assemblyaiId,
        fileName: filename,
        source: "recording",
        estimatedSeconds: recorded.duration,
      });
    } catch (e) {
      setPhase("recorded");
      setError(e instanceof Error ? e.message : "Submission failed");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#111215] p-6">
      {phase === "idle" && (
        <div className="text-center">
          <p className="mb-1 text-4xl">🎙️</p>
          <p className="mb-4 text-sm text-white/65">
            Record up to <span className="font-semibold text-white">{(maxSeconds / 60).toFixed(1)} min</span>.
            Counts against your quota.
          </p>
          <button
            type="button"
            onClick={startRecording}
            className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/60"
          >
            ● Start recording
          </button>
        </div>
      )}

      {phase === "recording" && (
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
            Recording…
          </div>
          <p className="mb-1 font-mono text-4xl font-bold text-white">
            {formatTime(elapsed)}
          </p>
          <p className="mb-5 text-xs text-white/50">
            Auto-stop at {formatTime(maxSeconds)}
          </p>
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
          >
            ■ Stop
          </button>
        </div>
      )}

      {phase === "recorded" && recorded && (
        <div>
          <p className="mb-3 text-sm text-white/70">
            Recorded <span className="font-semibold text-white">{(recorded.duration / 60).toFixed(1)} min</span>.
            Listen back, then transcribe or discard.
          </p>
          <audio src={recorded.url} controls className="mb-4 w-full" />
          {error && (
            <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={discard}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] px-6 py-2.5 text-base font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/60"
            >
              Transcribe →
            </button>
          </div>
        </div>
      )}

      {(phase === "uploading" || phase === "submitting") && (
        <div className="text-center">
          <p className="mb-3 text-sm text-white/70">
            {phase === "uploading" ? `Uploading… ${progress.toFixed(0)}%` : "Submitting to AssemblyAI…"}
          </p>
          {phase === "uploading" && (
            <div className="mx-auto h-1.5 max-w-md overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#7c5cff] to-[#00d4ff] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
