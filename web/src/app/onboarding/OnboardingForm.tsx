"use client";

import { useActionState } from "react";
import { saveProfile, type OnboardingState } from "./actions";

const PURPOSES = [
  "Researcher / academic",
  "Journalist",
  "Podcaster / content creator",
  "Student",
  "Business / professional",
  "Personal / curious",
  "Other",
];

const initialState: OnboardingState = {};

export default function OnboardingForm({
  defaultFirstName,
  defaultLastName,
}: {
  defaultFirstName?: string;
  defaultLastName?: string;
}) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-white/80">First name</span>
          <input
            name="firstName"
            type="text"
            required
            maxLength={60}
            defaultValue={defaultFirstName}
            placeholder="Aditya"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/30"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-white/80">Last name <span className="text-white/40">(optional)</span></span>
          <input
            name="lastName"
            type="text"
            maxLength={60}
            defaultValue={defaultLastName}
            placeholder="Chaudhari"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/30"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-white/80">What will you use this for?</span>
        <select
          name="purpose"
          required
          defaultValue=""
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/30"
        >
          <option value="" disabled>
            Pick one…
          </option>
          {PURPOSES.map((p) => (
            <option key={p} value={p} className="bg-[#15102b]">
              {p}
            </option>
          ))}
        </select>
      </label>

      {state.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] px-6 py-3 text-base font-semibold shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:shadow-purple-900/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Continue to dashboard →"}
      </button>
    </form>
  );
}
