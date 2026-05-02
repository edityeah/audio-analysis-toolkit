import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchTranscript } from "@/lib/assemblyai";
import {
  debitUserSeconds,
  getTranscriptByAssemblyId,
  getUserByClerkId,
  markTranscriptCompleted,
  markTranscriptFailed,
  refundUserSeconds,
} from "@/lib/db/queries";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const user = await getUserByClerkId(userId);
  if (!user) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { id: aaiId } = await ctx.params;
  const local = await getTranscriptByAssemblyId(user.id, aaiId);
  if (!local) {
    return NextResponse.json({ error: "Transcript not found" }, { status: 404 });
  }

  const remote = await fetchTranscript(aaiId);

  // Settle quota the first time we see a terminal status.
  if (local.status === "processing") {
    if (remote.status === "completed") {
      const actual = Math.max(0, Math.round(remote.audio_duration ?? 0));
      const delta = actual - local.audioDurationSeconds;
      if (delta > 0) await debitUserSeconds(user.id, delta);
      else if (delta < 0) await refundUserSeconds(user.id, -delta);
      await markTranscriptCompleted(local.id, actual);
    } else if (remote.status === "error") {
      await refundUserSeconds(user.id, local.audioDurationSeconds);
      await markTranscriptFailed(local.id);
    }
  }

  return NextResponse.json(remote);
}
