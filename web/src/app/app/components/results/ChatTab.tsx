"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatTab({ assemblyaiId }: { assemblyaiId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const q = input.trim();
    if (!q || pending) return;
    setError(null);
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/lemur-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assemblyaiId, question: q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Chat failed");
      setMessages((m) => [...m, { role: "assistant", content: json.response }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {messages.length === 0 && (
        <p className="text-sm text-white/55">
          Ask anything about this audio — quotes, summaries, who said what, etc.
        </p>
      )}

      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl border px-4 py-3 text-sm ${
              m.role === "user"
                ? "ml-12 border-[#7c5cff]/30 bg-[#7c5cff]/10 text-white"
                : "mr-12 border-white/10 bg-white/[0.03] text-white/85"
            }`}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/50">
              {m.role === "user" ? "You" : "Assistant"}
            </p>
            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
          </div>
        ))}
        {pending && (
          <div className="mr-12 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
            Thinking…
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          maxLength={1000}
          placeholder="Ask about this audio…"
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/30"
        />
        <button
          type="button"
          onClick={send}
          disabled={pending || !input.trim()}
          className="rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          Ask
        </button>
      </div>
    </div>
  );
}
