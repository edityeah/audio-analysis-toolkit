import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/db/queries";
import { computeQuota } from "@/lib/quota";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const { userId } = await auth();
        if (!userId) throw new Error("Not signed in");

        const user = await getUserByClerkId(userId);
        if (!user) throw new Error("Profile missing");

        const quota = computeQuota(user);
        if (quota.remainingSeconds <= 0) {
          throw new Error(
            "You're out of free minutes for this 30-day window.",
          );
        }

        return {
          allowedContentTypes: [
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/webm",
            "audio/ogg",
            "audio/mp4",
            "audio/m4a",
            "audio/x-m4a",
            "audio/flac",
            "video/mp4",
          ],
          // 200 MB hard cap per file (well above ~10-min audio at typical bitrates)
          maximumSizeInBytes: 200 * 1024 * 1024,
          tokenPayload: JSON.stringify({ clerkId: userId }),
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Nothing to do server-side after upload — the client will POST to
        // /api/transcribe with the resulting blob URL to actually start the job.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload setup failed" },
      { status: 400 },
    );
  }
}
