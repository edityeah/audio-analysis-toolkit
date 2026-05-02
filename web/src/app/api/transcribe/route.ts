import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { submitTranscript } from "@/lib/assemblyai";
import {
  createTranscript,
  debitUserSeconds,
  getUserByClerkId,
} from "@/lib/db/queries";
import { computeQuota, FREE_SECONDS_PER_WINDOW } from "@/lib/quota";

type SubmitBody = {
  audioUrl: string;
  fileName: string | null;
  source: "upload" | "recording";
  estimatedDurationSeconds: number;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await getUserByClerkId(userId);
  if (!user) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const estimate = Math.max(1, Math.round(body.estimatedDurationSeconds));
  if (!body.audioUrl || !/^https?:\/\//.test(body.audioUrl)) {
    return NextResponse.json({ error: "Invalid audio URL" }, { status: 400 });
  }
  if (body.source !== "upload" && body.source !== "recording") {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  }

  const quota = computeQuota(user);
  if (estimate > FREE_SECONDS_PER_WINDOW) {
    return NextResponse.json(
      {
        error: `That recording is ~${Math.ceil(estimate / 60)} min, but the free limit is 10 min per file.`,
      },
      { status: 400 },
    );
  }
  if (estimate > quota.remainingSeconds) {
    return NextResponse.json(
      {
        error: `Not enough free minutes left (${(quota.remainingSeconds / 60).toFixed(1)} min remaining, need ~${(estimate / 60).toFixed(1)} min).`,
      },
      { status: 402 },
    );
  }

  // Optimistically debit the estimate so concurrent uploads can't double-spend.
  await debitUserSeconds(user.id, estimate);

  let aaiId: string;
  try {
    const submitted = await submitTranscript(body.audioUrl);
    aaiId = submitted.id;
  } catch (e) {
    // Refund on failure to submit
    await debitUserSeconds(user.id, -estimate);
    console.error("AssemblyAI submit failed:", e);
    return NextResponse.json(
      { error: "Transcription service couldn't accept the file. Try again." },
      { status: 502 },
    );
  }

  const row = await createTranscript({
    userId: user.id,
    assemblyaiId: aaiId,
    fileName: body.fileName,
    source: body.source,
    audioDurationSeconds: estimate,
  });

  return NextResponse.json({ assemblyaiId: aaiId, transcriptId: row.id });
}
