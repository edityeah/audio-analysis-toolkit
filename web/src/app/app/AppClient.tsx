"use client";

export default function AppClient({
  remainingSeconds,
}: {
  remainingSeconds: number;
  firstName: string;
}) {
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

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#111215] p-8 text-center">
      <p className="mb-3 text-3xl">🚧</p>
      <h2 className="mb-2 text-xl font-bold text-white">
        Upload + record UI lands next
      </h2>
      <p className="mx-auto max-w-md text-sm text-white/60">
        Auth, quota check, and Vercel Blob plumbing are wired up. The actual
        upload widget, recorder, and tabbed results come in the next push.
      </p>
    </div>
  );
}
