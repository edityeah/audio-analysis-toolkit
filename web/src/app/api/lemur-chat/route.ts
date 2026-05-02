import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { lemurTask } from "@/lib/assemblyai";
import {
  getTranscriptByAssemblyId,
  getUserByClerkId,
} from "@/lib/db/queries";

type ChatBody = {
  assemblyaiId: string;
  question: string;
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

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  if (!body.assemblyaiId || !body.question?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (body.question.length > 1000) {
    return NextResponse.json({ error: "Question too long" }, { status: 400 });
  }

  // Make sure this transcript belongs to the signed-in user.
  const owned = await getTranscriptByAssemblyId(user.id, body.assemblyaiId);
  if (!owned) {
    return NextResponse.json({ error: "Transcript not found" }, { status: 404 });
  }

  try {
    const result = await lemurTask(
      body.assemblyaiId,
      `Based on the transcript, answer the following question concisely: ${body.question.trim()}`,
    );
    return NextResponse.json({ response: result.response.trim() });
  } catch (e) {
    console.error("Lemur failed:", e);
    return NextResponse.json(
      { error: "Couldn't reach the chat model. Try again." },
      { status: 502 },
    );
  }
}
