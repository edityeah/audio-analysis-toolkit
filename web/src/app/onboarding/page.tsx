import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/db/queries";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Already onboarded? Skip straight to the dashboard.
  const existing = await getUserByClerkId(userId);
  if (existing && existing.firstName && existing.purpose) {
    redirect("/dashboard");
  }

  // Pre-fill name from Clerk if Google supplied it.
  const user = await currentUser();
  const defaultFirstName = existing?.firstName ?? user?.firstName ?? undefined;
  const defaultLastName = existing?.lastName ?? user?.lastName ?? undefined;

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
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-12">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md sm:p-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#b5a8ff]">
            One last thing
          </p>
          <h1 className="mb-2 bg-gradient-to-r from-white to-[#b5a8ff] bg-clip-text text-3xl font-extrabold text-transparent">
            Set up your profile
          </h1>
          <p className="mb-7 text-sm text-white/60">
            Takes 10 seconds. Helps us understand who&apos;s using the toolkit.
          </p>
          <OnboardingForm
            defaultFirstName={defaultFirstName ?? undefined}
            defaultLastName={defaultLastName ?? undefined}
          />
        </div>
      </div>
    </main>
  );
}
