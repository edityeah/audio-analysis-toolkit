"use client";

import { useState } from "react";
import UploadMode from "./components/UploadMode";
import RecordMode from "./components/RecordMode";
import Results from "./components/Results";

type Mode = "upload" | "record";

export type SubmissionInfo = {
  assemblyaiId: string;
  fileName: string | null;
  source: "upload" | "recording";
  estimatedSeconds: number;
};

export default function AppClient({
  remainingSeconds,
}: {
  remainingSeconds: number;
  firstName: string;
}) {
  const [mode, setMode] = useState<Mode>("upload");
  const [submission, setSubmission] = useState<SubmissionInfo | null>(null);

  if (remainingSeconds <= 0) {
    return (
      <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-8 text-center">
        <p className="mb-2 text-3xl">🪫</p>
        <h2 className="mb-2 text-xl font-bold text-white">
          You&apos;re out of free minutes
        </h2>
        <p className="mx-auto max-w-md text-sm text-white/60">
          Your 10-minute window will refresh 30 days after your first
          transcription. Check the dashboard for the exact reset date.
        </p>
      </div>
    );
  }

  if (submission) {
    return (
      <Results
        submission={submission}
        onReset={() => setSubmission(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur">
        {(["upload", "record"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === m
                ? "bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] text-white shadow-lg shadow-purple-900/30"
                : "text-white/65 hover:text-white"
            }`}
          >
            {m === "upload" ? "📁 Upload a file" : "🎙️ Record live"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <UploadMode
          remainingSeconds={remainingSeconds}
          onSubmitted={setSubmission}
        />
      ) : (
        <RecordMode
          remainingSeconds={remainingSeconds}
          onSubmitted={setSubmission}
        />
      )}
    </div>
  );
}
