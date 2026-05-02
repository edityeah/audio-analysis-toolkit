"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { upsertUserProfile } from "@/lib/db/queries";

export type OnboardingState = { error?: string };

const ALLOWED_PURPOSES = new Set([
  "Researcher / academic",
  "Journalist",
  "Podcaster / content creator",
  "Student",
  "Business / professional",
  "Personal / curious",
  "Other",
]);

export async function saveProfile(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!email) return { error: "We couldn't read your email from your account. Try again." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const purpose = String(formData.get("purpose") ?? "").trim();

  if (!firstName) return { error: "Please enter your first name." };
  if (firstName.length > 60) return { error: "First name is too long." };
  if (lastName.length > 60) return { error: "Last name is too long." };
  if (!ALLOWED_PURPOSES.has(purpose)) return { error: "Please pick a valid purpose." };

  try {
    await upsertUserProfile({ clerkId: userId, email, firstName, lastName, purpose });
  } catch (e) {
    console.error("upsertUserProfile failed:", e);
    return { error: "Couldn't save your profile. Please try again." };
  }

  redirect("/dashboard");
}
