"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import type { SubmissionInfo } from "../AppClient";

const ACCEPTED = ".mp3,.wav,.m4a,.mp4,.flac,audio/*";

export default function UploadMode({
  remainingSeconds,
  onSubmitted,
}: {
  remainingSeconds: number;
  onSubmitted: (s: SubmissionInfo) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "uploading" | "submitting">("idle");
  const [progress, setProgress] = useState(0);

  const remainingMin = (remainingSeconds / 60).toFixed(1);

  async function handleFile(f: File) {
    setError(null);
    setFile(f);
    setDuration(null);
    try {
      const d = await measureDuration(f);
      setDuration(d);
      if (d > remainingSeconds) {
        setError(
          `This file is ${(d / 60).toFixed(1)} min, but you only have ${remainingMin} min left this window.`,
        );
      } else if (d > 600) {
        setError("File exceeds the 10 minute per-file cap.");
      }
    } catch {
      setError(
        "Couldn't read the file's duration. Pick a different file (mp3 / wav / m4a / flac).",
      );
    }
  }

  async function handleSubmit() {
    if (!file || duration == null || error) return;
    setError(null);
    setPhase("uploading");
    setProgress(0);

    let blobUrl: string;
    try {
      const result = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        onUploadProgress: (p) => setProgress(p.percentage),
      });
      blobUrl = result.url;
    } catch (e) {
      setPhase("idle");
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
          fileName: file.name,
          source: "upload",
          estimatedDurationSeconds: Math.round(duration),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");
      onSubmitted({
        assemblyaiId: json.assemblyaiId,
        fileName: file.name,
        source: "upload",
        estimatedSeconds: Math.round(duration),
      });
    } catch (e) {
      setPhase("idle");
      setError(e instanceof Error ? e.message : "Submission failed");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#111215] p-6">
      <label
        htmlFor="audio-file"
        className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center transition hover:border-[#7c5cff]/45 hover:bg-white/[0.04]"
      >
        <span className="mb-2 text-4xl">🎵</span>
        <span className="font-semibold text-white">
          {file ? file.name : "Click to choose an audio file"}
        </span>
        <span className="mt-1 text-xs text-white/50">
          mp3 · wav · m4a · mp4 · flac · max 10 minutes
        </span>
        <input
          id="audio-file"
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </label>

      {file && duration != null && !error && (
        <p className="mb-3 text-sm text-white/60">
          Duration: <span className="font-semibold text-white">{(duration / 60).toFixed(1)} min</span>
          {" · "}
          Cost: <span className="font-semibold text-white">{(duration / 60).toFixed(1)} min</span> of your quota
        </p>
      )}

      {phase === "uploading" && (
        <div className="mb-3">
          <p className="mb-1 text-sm text-white/70">Uploading audio… {progress.toFixed(0)}%</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#7c5cff] to-[#00d4ff] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {phase === "submitting" && (
        <p className="mb-3 text-sm text-white/70">
          Submitting to AssemblyAI…
        </p>
      )}

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || duration == null || !!error || phase !== "idle"}
        className="w-full rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {phase === "idle" ? "Transcribe →" : "Working…"}
      </button>
    </div>
  );
}

function measureDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.onloadedmetadata = () => {
      const d = audio.duration;
      URL.revokeObjectURL(url);
      if (!Number.isFinite(d) || d <= 0) reject(new Error("Bad duration"));
      else resolve(d);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read file"));
    };
  });
}
