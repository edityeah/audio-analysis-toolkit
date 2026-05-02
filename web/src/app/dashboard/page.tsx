import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  getRecentTranscripts,
  getUserByClerkId,
} from "@/lib/db/queries";
import { computeQuota, formatMinutes } from "@/lib/quota";

const FEATURES = [
  { icon: "🎯", title: "Accurate transcription", body: "Speech-to-text with timestamps." },
  { icon: "👥", title: "Speaker detection",     body: "Auto diarization — who said what." },
  { icon: "😊", title: "Sentiment analysis",    body: "Per-utterance positive / neutral / negative." },
  { icon: "📋", title: "Auto-summary",          body: "Key points and TL;DR in seconds." },
  { icon: "🏷️", title: "Topic detection",       body: "IAB-categorised themes." },
  { icon: "💬", title: "Ask-anything chat",     body: "Q&A over the transcript." },
];

const STEPS = [
  { n: "1", title: "Upload or record",      body: "Drop an audio file or record up to 10 min live in your browser." },
  { n: "2", title: "We transcribe",         body: "AssemblyAI handles speech-to-text + speakers + sentiment + topics." },
  { n: "3", title: "Explore the results",   body: "Read the transcript, jump by topic, ask questions — all in one place." },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getUserByClerkId(userId);
  if (!profile || !profile.firstName || !profile.purpose) {
    redirect("/onboarding");
  }

  const quota = computeQuota(profile);
  const recent = await getRecentTranscripts(profile.id, 5);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 10% 0%, rgba(124,92,255,0.28), transparent 45%)," +
            "radial-gradient(ellipse at 95% 5%, rgba(0,212,255,0.18), transparent 45%)," +
            "radial-gradient(ellipse at 50% 100%, rgba(255,92,168,0.14), transparent 50%)," +
            "linear-gradient(180deg, #15102b 0%, #0f0b1e 50%, #0c0a17 100%)",
        }}
      />

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" aria-label="Home" className="inline-flex items-center transition hover:opacity-90">
          <Image
            src="/logo.png"
            alt="Adityeah"
            width={200}
            height={94}
            priority
            className="h-12 w-auto rounded-md"
          />
        </Link>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} />
      </nav>

      <section className="mx-auto max-w-5xl px-6 pt-6 pb-24">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#b5a8ff]">
          🎵 Audio Analysis Toolkit
        </p>
        <h1 className="mb-2 bg-gradient-to-r from-white to-[#b5a8ff] bg-clip-text text-4xl font-extrabold text-transparent">
          Hey {profile.firstName} 👋
        </h1>
        <p className="mb-10 max-w-2xl text-white/65">
          Upload an audio file or record live in your browser. We&apos;ll
          transcribe, label speakers, extract sentiment + topics, and let you
          chat with the recording.
        </p>

        {/* Quota cards */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#111215] p-6">
            <p className="mb-2 text-xs uppercase tracking-widest text-white/50">
              Free minutes left
            </p>
            <p className="bg-gradient-to-r from-[#7c5cff] via-[#00d4ff] to-[#ff5ca8] bg-clip-text text-5xl font-extrabold text-transparent">
              {formatMinutes(quota.remainingSeconds)}
            </p>
            <p className="mt-2 text-sm text-white/60">
              of 10 minutes per 30-day window
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#111215] p-6">
            <p className="mb-2 text-xs uppercase tracking-widest text-white/50">
              Window resets
            </p>
            <p className="text-3xl font-bold text-white">
              {quota.windowEnd
                ? quota.windowEnd.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "On first use"}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {quota.windowEnd
                ? "Your minutes refresh on this date."
                : "Your 30-day window starts on your first transcription."}
            </p>
          </div>
        </div>

        {/* Launch CTA */}
        <div className="mt-8 rounded-2xl border border-[#7c5cff]/25 bg-gradient-to-br from-[#1a1438] to-[#14102a] p-7">
          <h2 className="mb-2 text-xl font-bold">Ready to transcribe?</h2>
          <p className="mb-5 text-sm text-white/65">
            All 10 free minutes per month — no credit card.
          </p>
          <Link
            href="/app"
            className="inline-block rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/60"
          >
            Launch app →
          </Link>
        </div>

        {/* Recent activity (only if any) */}
        {recent.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-bold">Recent transcripts</h2>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/55">
                  <tr>
                    <th className="px-4 py-3 font-medium">File</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recent.map((t) => (
                    <tr key={t.id} className="hover:bg-white/[0.03]">
                      <td className="max-w-[18rem] truncate px-4 py-3 text-white/85">
                        {t.fileName ?? "Live recording"}
                      </td>
                      <td className="px-4 py-3 text-white/65">
                        {t.source === "upload" ? "Upload" : "Recording"}
                      </td>
                      <td className="px-4 py-3 text-white/65">
                        {(t.audioDurationSeconds / 60).toFixed(1)} min
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={t.status} />
                      </td>
                      <td className="px-4 py-3 text-white/55">
                        {timeAgo(t.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* What you can do */}
        <div className="mt-12">
          <h2 className="mb-1 text-lg font-bold">What you can do</h2>
          <p className="mb-5 text-sm text-white/55">
            Every transcription gives you all of this, automatically.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#7c5cff]/35 hover:bg-white/[0.05]"
              >
                <div className="mb-2 text-xl">{f.icon}</div>
                <h3 className="mb-1 text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-xs leading-relaxed text-white/60">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-10">
          <h2 className="mb-1 text-lg font-bold">How it works</h2>
          <p className="mb-5 text-sm text-white/55">Three steps. That&apos;s it.</p>
          <div className="grid gap-3 md:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] text-xs font-bold">
                  {s.n}
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">{s.title}</h3>
                <p className="text-xs leading-relaxed text-white/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    processing: { label: "Processing", cls: "border-[#7c5cff]/30 bg-[#7c5cff]/10 text-[#b5a8ff]" },
    completed:  { label: "✓ Done",     cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    failed:     { label: "Failed",     cls: "border-red-500/30 bg-red-500/10 text-red-200" },
  };
  const m = map[status] ?? map.processing;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${m.cls}`}>
      {m.label}
    </span>
  );
}

function timeAgo(d: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
  return `${Math.floor(seconds / 86400)} d ago`;
}
