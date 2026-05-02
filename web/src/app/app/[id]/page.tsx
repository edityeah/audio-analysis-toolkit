import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getTranscriptById, getUserByClerkId } from "@/lib/db/queries";
import HistoricResultsClient from "./HistoricResultsClient";

export default async function HistoricTranscriptPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await getUserByClerkId(userId);
  if (!user || !user.firstName || !user.purpose) {
    redirect("/onboarding");
  }

  const { id } = await props.params;
  const t = await getTranscriptById(user.id, id);
  if (!t) notFound();

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
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#b5a8ff]">
          🎵 Past transcript
        </p>
        <h1 className="mb-8 bg-gradient-to-r from-white to-[#b5a8ff] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
          {t.fileName ?? "Live recording"}
        </h1>

        {t.status === "failed" ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
            <p className="font-semibold">This transcription failed.</p>
            <p className="mt-1 text-sm">
              No charges were applied to your quota. Try uploading the file
              again from the{" "}
              <Link href="/app" className="underline">
                app page
              </Link>
              .
            </p>
          </div>
        ) : (
          <HistoricResultsClient
            assemblyaiId={t.assemblyaiId}
            fileName={t.fileName}
            source={t.source as "upload" | "recording"}
            estimatedSeconds={t.audioDurationSeconds}
          />
        )}
      </section>
    </main>
  );
}
