import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getUserByClerkId } from "@/lib/db/queries";
import { computeQuota, formatMinutes } from "@/lib/quota";
import AppClient from "./AppClient";

export default async function AppPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserByClerkId(userId);
  if (!user || !user.firstName || !user.purpose) {
    redirect("/onboarding");
  }

  const quota = computeQuota(user);

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
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="inline-flex items-center transition hover:opacity-90"
        >
          <Image
            src="/logo.png"
            alt="Adityeah"
            width={200}
            height={94}
            priority
            className="h-12 w-auto rounded-md"
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-1.5 text-sm text-white/70 transition hover:text-white"
          >
            ← Dashboard
          </Link>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }} />
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1 text-sm font-semibold uppercase tracking-[0.28em] text-[#b5a8ff]">
              🎵 Audio Analysis
            </p>
            <h1 className="bg-gradient-to-r from-white to-[#b5a8ff] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
              Upload or record audio
            </h1>
          </div>
          <QuotaBadge
            remainingSeconds={quota.remainingSeconds}
            isExpired={quota.isExpired}
          />
        </div>

        <AppClient
          remainingSeconds={quota.remainingSeconds}
          firstName={user.firstName ?? ""}
        />
      </section>
    </main>
  );
}

function QuotaBadge({
  remainingSeconds,
  isExpired,
}: {
  remainingSeconds: number;
  isExpired: boolean;
}) {
  const out = remainingSeconds <= 0;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm backdrop-blur ${
        out
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-white/10 bg-white/5 text-white/80"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          out ? "bg-red-400" : "animate-pulse bg-[#7c5cff]"
        }`}
      />
      {out ? (
        "0 minutes left"
      ) : (
        <>
          <span className="font-semibold text-white">
            {formatMinutes(remainingSeconds)}
          </span>{" "}
          of 10 min left
          {isExpired ? " · window refreshed" : ""}
        </>
      )}
    </div>
  );
}
