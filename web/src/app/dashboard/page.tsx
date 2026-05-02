import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { getUserByClerkId } from "@/lib/db/queries";

const FREE_SECONDS_PER_WINDOW = 600; // 10 minutes
const WINDOW_DAYS = 30;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getUserByClerkId(userId);
  if (!profile || !profile.firstName || !profile.purpose) {
    redirect("/onboarding");
  }

  const now = Date.now();
  const windowEnd = profile.windowStartedAt
    ? new Date(profile.windowStartedAt).getTime() + WINDOW_DAYS * 24 * 60 * 60 * 1000
    : null;
  const windowExpired = windowEnd ? now > windowEnd : false;
  const effectiveSecondsUsed = windowExpired ? 0 : profile.secondsUsed;
  const secondsRemaining = Math.max(0, FREE_SECONDS_PER_WINDOW - effectiveSecondsUsed);
  const minutesRemaining = (secondsRemaining / 60).toFixed(1);

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

      <section className="mx-auto max-w-3xl px-6 pt-10 pb-24">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#b5a8ff]">
          🎵 Audio Analysis Toolkit
        </p>
        <h1 className="mb-2 bg-gradient-to-r from-white to-[#b5a8ff] bg-clip-text text-4xl font-extrabold text-transparent">
          Hey {profile.firstName} 👋
        </h1>
        <p className="mb-10 text-white/60">
          Welcome to your dashboard. The Streamlit app is coming next — for now,
          here&apos;s what your account looks like.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d24] to-[#111215] p-6">
            <p className="mb-2 text-xs uppercase tracking-widest text-white/50">
              Free minutes left
            </p>
            <p className="bg-gradient-to-r from-[#7c5cff] via-[#00d4ff] to-[#ff5ca8] bg-clip-text text-5xl font-extrabold text-transparent">
              {minutesRemaining}
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
              {windowEnd && !windowExpired
                ? new Date(windowEnd).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "On first use"}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {windowEnd && !windowExpired
                ? "Your minutes refresh on this date."
                : "Your 30-day window starts on your first transcription."}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#7c5cff]/25 bg-gradient-to-br from-[#1a1438] to-[#14102a] p-7">
          <h2 className="mb-2 text-xl font-bold">🚧 Streamlit app launch button — coming next</h2>
          <p className="text-sm text-white/65">
            In the next phase we&apos;ll wire up the &ldquo;Launch app&rdquo; button
            so you can jump straight into recording or uploading audio. For now,
            sign-up + profile + quota tracking are all working end-to-end.
          </p>
        </div>
      </section>
    </main>
  );
}
