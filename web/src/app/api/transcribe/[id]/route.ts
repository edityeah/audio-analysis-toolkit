import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
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

// AssemblyAI keeps its own copy once a transcript reaches a terminal state,
// so the original blob in Vercel storage is dead weight. Delete it best-effort.
async function tryDeleteBlob(url: string | undefined) {
  if (!url || !url.includes(".public.blob.vercel-storage.com")) return;
  try {
    await del(url);
  } catch (e) {
    // Already deleted or transient — log and move on, don't fail the poll.
    console.warn("Blob cleanup failed for", url, e);
  }
}

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
      await tryDeleteBlob(remote.audio_url);
    } else if (remote.status === "error") {
      await refundUserSeconds(user.id, local.audioDurationSeconds);
      await markTranscriptFailed(local.id);
      await tryDeleteBlob(remote.audio_url);
    }
  }

  return NextResponse.json(remote);
}
