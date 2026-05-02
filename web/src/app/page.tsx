import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: "🎯",
    title: "Accurate Transcription",
    body: "Speech-to-text with precise timestamps across mp3, wav, mp4, m4a and flac.",
  },
  {
    icon: "👥",
    title: "Speaker Detection",
    body: "Automatic diarization — know who said what, without manually tagging.",
  },
  {
    icon: "😊",
    title: "Sentiment Analysis",
    body: "Per-utterance positive / neutral / negative breakdown of the conversation.",
  },
  {
    icon: "📋",
    title: "Auto-Summary",
    body: "Get the key points and TL;DR of long recordings in seconds.",
  },
  {
    icon: "🏷️",
    title: "Topic Detection",
    body: "IAB-categorised themes so you know what the audio is actually about.",
  },
  {
    icon: "💬",
    title: "Ask-Anything Chat",
    body: "Question-answer over the transcript — pull quotes, find moments, dig deeper.",
  },
];

const useCases = [
  "Podcasters cleaning up show notes",
  "Researchers transcribing interviews",
  "Journalists fact-checking recordings",
  "Students reviewing lecture content",
  "Teams pulling insights from sales calls",
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Ambient gradient backdrop */}
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

      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          aria-label="Adityeah — home"
          className="inline-flex items-center transition hover:opacity-90"
        >
          <Image
            src="/logo.png"
            alt="Adityeah"
            width={120}
            height={56}
            priority
            className="h-10 w-auto rounded-md"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="rounded-lg px-4 py-2 text-sm text-white/80 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/50"
          >
            Get started — free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7c5cff]" />
          Powered by AssemblyAI · 10 free minutes / month
        </div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#b5a8ff]">
          🎵 Audio Analysis Toolkit
        </p>
        <h1 className="bg-gradient-to-r from-[#7c5cff] via-[#00d4ff] to-[#ff5ca8] bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
          Make sense of any audio,
          <br />
          in seconds.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
          Upload a file or record live in your browser. Get a speaker-labeled
          transcript, sentiment, topics, a summary — and chat with the
          recording like it&apos;s a document.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-up"
            className="rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] px-6 py-3 text-base font-semibold shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/60"
          >
            Get started — it&apos;s free
          </Link>
          <Link
            href="#features"
            className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white"
          >
            See what it does ↓
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/50">
          No credit card. Google sign-in or email OTP. 10 free minutes refresh
          every 30 days.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
          Everything you get out of the box
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#111215] p-6 transition hover:-translate-y-1.5 hover:border-[#7c5cff]/45 hover:shadow-xl hover:shadow-purple-900/25"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#7c5cff]/15 to-transparent opacity-0 transition group-hover:opacity-100"
              />
              <div className="relative">
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="mb-2 bg-gradient-to-r from-white to-[#b5a8ff] bg-clip-text text-lg font-semibold text-transparent">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/65">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight">
          Built for anyone working with recordings
        </h2>
        <p className="mb-8 text-white/60">
          A few of the people getting value out of the toolkit.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {useCases.map((u) => (
            <span
              key={u}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur"
            >
              {u}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
          Three steps. That&apos;s it.
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "Sign in",
              body: "Google or email OTP. Tell us your name and what you’ll use it for.",
            },
            {
              n: "2",
              title: "Upload or record",
              body: "Drop an audio file, or record up to 10 minutes live in your browser.",
            },
            {
              n: "3",
              title: "Explore the analysis",
              body: "Read the transcript, scan sentiment, jump by topic, ask questions.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] text-sm font-bold">
                {s.n}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="text-sm leading-relaxed text-white/65">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="rounded-3xl border border-[#7c5cff]/25 bg-gradient-to-br from-[#1a1438] to-[#14102a] p-10 shadow-2xl shadow-purple-950/40">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">
            Ready to listen smarter?
          </h2>
          <p className="mb-7 text-white/70">
            10 minutes of free transcription every month. No card, no catch.
          </p>
          <Link
            href="/sign-up"
            className="inline-block rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] px-7 py-3 text-base font-semibold shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/60"
          >
            Create your account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-sm text-white/50">
        <p>
          © {new Date().getFullYear()} Adityeah ·{" "}
          <a
            href="https://news.adityeah.in/"
            target="_blank"
            rel="noopener"
            className="text-[#b5a8ff] hover:text-white"
          >
            Blog
          </a>{" "}
          ·{" "}
          <a
            href="https://www.linkedin.com/in/adityacbcc/"
            target="_blank"
            rel="noopener"
            className="text-[#b5a8ff] hover:text-white"
          >
            LinkedIn
          </a>
        </p>
      </footer>
    </main>
  );
}
