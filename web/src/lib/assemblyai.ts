// Minimal AssemblyAI REST wrapper. We hit their API directly from server-only
// code so the API key never reaches the browser.

const BASE = "https://api.assemblyai.com";

function key(): string {
  const k = process.env.ASSEMBLYAI_API_KEY;
  if (!k) throw new Error("ASSEMBLYAI_API_KEY is not set");
  return k;
}

export type AAIStatus = "queued" | "processing" | "completed" | "error";

export type AAIUtterance = {
  speaker: string;
  start: number;
  end: number;
  text: string;
  confidence: number;
};

export type AAISentence = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
};

export type AAISentimentResult = {
  start: number;
  end: number;
  text: string;
  speaker?: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  confidence: number;
};

export type AAITopicSummary = Record<string, number>;

export type AAITranscript = {
  id: string;
  status: AAIStatus;
  text?: string;
  summary?: string;
  audio_duration?: number;
  audio_url?: string;
  utterances?: AAIUtterance[] | null;
  sentiment_analysis_results?: AAISentimentResult[] | null;
  iab_categories_result?: {
    status: string;
    summary?: AAITopicSummary;
  } | null;
  language_code?: string;
  error?: string;
};

export async function submitTranscript(audioUrl: string): Promise<AAITranscript> {
  const res = await fetch(`${BASE}/v2/transcript`, {
    method: "POST",
    headers: {
      authorization: key(),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      speaker_labels: true,
      speakers_expected: 2,
      iab_categories: true,
      sentiment_analysis: true,
      summarization: true,
      language_detection: true,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AssemblyAI submit failed (${res.status}): ${text}`);
  }
  return (await res.json()) as AAITranscript;
}

export async function fetchTranscript(id: string): Promise<AAITranscript> {
  const res = await fetch(`${BASE}/v2/transcript/${id}`, {
    headers: { authorization: key() },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AssemblyAI fetch failed (${res.status}): ${text}`);
  }
  return (await res.json()) as AAITranscript;
}

export async function lemurTask(
  transcriptId: string,
  prompt: string,
): Promise<{ response: string }> {
  const res = await fetch(`${BASE}/lemur/v3/generate/task`, {
    method: "POST",
    headers: {
      authorization: key(),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      transcript_ids: [transcriptId],
      prompt,
      final_model: "anthropic/claude-3-5-sonnet",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lemur failed (${res.status}): ${text}`);
  }
  return (await res.json()) as { response: string };
}
