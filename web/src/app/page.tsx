"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Show, UserButton } from "@clerk/nextjs";

const useCases = [
  { icon: "🔬", title: "Researchers & journalists", body: "Transcribe interviews with speaker labels. Surface themes, quotes, and sentiment without manual coding." },
  { icon: "🛠️", title: "Product & tech teams", body: "Turn user-research calls and engineering syncs into searchable, summarisable knowledge." },
  { icon: "🎙️", title: "Podcasters", body: "Get show-notes, chapter summaries, and clean transcripts the moment recording ends." },
  { icon: "🎓", title: "Students", body: "Turn lectures into searchable notes with auto-summary. Study the gist, not the audio." },
  { icon: "🛟", title: "Support teams", body: "Analyze customer calls — sentiment swings, recurring topics, what to escalate." },
  { icon: "📈", title: "Sales teams", body: "Review every deal call. Pull objections, action items, and pricing pushback in seconds." },
];

const sources: Array<{ label: string; ico: string; bg: string }> = [
  { label: "Zoom recordings", ico: "Z", bg: "#2D8CFF" },
  { label: "Google Meet", ico: "M", bg: "#00897B" },
  { label: "Microsoft Teams", ico: "T", bg: "#464EB8" },
  { label: "Loom", ico: "L", bg: "#000" },
  { label: "Otter exports", ico: "O", bg: "#FF6B35" },
  { label: "Riverside", ico: "R", bg: "#A100FF" },
  { label: "Podcast feeds", ico: "P", bg: "#FF3300" },
  { label: "Voice memos", ico: "🎙", bg: "#666" },
  { label: "Spotify clips", ico: "S", bg: "#1DB954" },
  { label: "Local files", ico: "📁", bg: "#888" },
];

const features = [
  { icon: "🎯", title: "Accurate transcription", body: "Speech-to-text with precise timestamps across mp3, wav, m4a, mp4, flac." },
  { icon: "👥", title: "Speaker diarization", body: "Automatic detection of who-said-what — no manual tagging required." },
  { icon: "💗", title: "Sentiment analysis", body: "Per-utterance sentiment so you can see emotion shift through a conversation." },
  { icon: "🏷️", title: "Topic detection", body: "IAB-category topics surfaced automatically from full-recording context." },
  { icon: "📝", title: "Auto-summary", body: "The full recording boiled down to the parts you actually need." },
  { icon: "💬", title: "Ask-Anything chat", body: "Question the transcript like you'd question a teammate. Powered by Lemur + Claude." },
];

const howSteps = [
  { n: "①", title: "Upload or record", body: "Drop an audio file (up to 10 min) or hit record in your browser — we'll grab it from your mic." },
  { n: "②", title: "We process it", body: "AssemblyAI runs transcription, diarization, sentiment, topics, and summary in parallel." },
  { n: "③", title: "Read, search, ask", body: "Browse the transcript. Skim the summary. Ask the chat anything about what was said." },
];

const transcriptLines = [
  {
    time: "00:02", spkClass: "spk-a", spkName: "Speaker A",
    text: "So I've been looking at the Q3 numbers and honestly, the conversion rate jump is wild — we're up 38% week over week.",
    chips: [{ cls: "pos", txt: "positive · 0.92" }, { cls: "topic", txt: "Business · Sales" }],
  },
  {
    time: "00:09", spkClass: "spk-b", spkName: "Speaker B",
    text: "That's the new onboarding flow shipping, right? Or are we seeing it across older cohorts too?",
    chips: [{ cls: "neu", txt: "neutral · question" }, { cls: "topic", txt: "Product · Onboarding" }],
  },
  {
    time: "00:15", spkClass: "spk-a", spkName: "Speaker A",
    text: "Both — but the older cohorts are the surprise. Retention curve is flatter than anything we've seen.",
    chips: [{ cls: "pos", txt: "positive · 0.78" }, { cls: "topic", txt: "Analytics · Retention" }],
  },
];

type ChatTurn =
  | { who: "user"; text: string }
  | { who: "ai"; delay: number; html: string };

const chatTurns: ChatTurn[] = [
  { who: "user", text: "What were the action items from the call?" },
  { who: "ai", delay: 1100, html: `<div class="ai-label">Audio Toolkit</div>I found 3 action items:<ul><li>Priya to finalize the launch timeline by Friday</li><li>Rohan to share the updated pricing deck</li><li>Team to review onboarding metrics next standup</li></ul>` },
  { who: "user", text: "Did anyone push back on the timeline?" },
  { who: "ai", delay: 900, html: `<div class="ai-label">Audio Toolkit</div>Yes — at <b>04:32</b>, Speaker B raised concerns about technical debt slowing the release. The team agreed to a buffer week.` },
  { who: "user", text: "Summarise the pricing discussion" },
  { who: "ai", delay: 1000, html: `<div class="ai-label">Audio Toolkit</div>Pricing was discussed from <b>07:10–09:45</b>. Two tiers proposed: Starter (free, 10 min) and Pro (paid, unlimited). Decision deferred to next week pending customer interviews.` },
];

export default function LandingPage() {
  const waveRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // waveform bars
    if (waveRef.current && waveRef.current.children.length === 0) {
      for (let i = 0; i < 70; i++) {
        const s = document.createElement("span");
        s.style.animationDelay = (Math.random() * 1.1) + "s";
        s.style.height = (15 + Math.random() * 70) + "%";
        waveRef.current.appendChild(s);
      }
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timers.push(id);
      return id;
    };

    // transcript loop
    function runTranscript() {
      const el = transcriptRef.current;
      const sumEl = summaryRef.current;
      if (!el || !sumEl) return;
      el.innerHTML = "";
      sumEl.classList.remove("show");

      const wrap = document.createElement("div");
      wrap.style.display = "flex";
      wrap.style.flexDirection = "column";
      wrap.style.gap = "14px";
      el.appendChild(wrap);

      let cumDelay = 0;
      const charDelay = 18;

      transcriptLines.forEach((line) => {
        const utt = document.createElement("div");
        utt.className = "aat-utt";
        utt.style.animationDelay = cumDelay + "ms";
        utt.innerHTML = `
          <div class="aat-utt-meta">${line.time}</div>
          <div>
            <span class="aat-speaker ${line.spkClass}">${line.spkName}</span>
            <div class="aat-utt-text"><span class="typed"></span><span class="aat-caret"></span></div>
            <div class="aat-chips"></div>
          </div>`;
        wrap.appendChild(utt);

        const typedEl = utt.querySelector(".typed") as HTMLElement;
        const caretEl = utt.querySelector(".aat-caret") as HTMLElement;
        const chipsEl = utt.querySelector(".aat-chips") as HTMLElement;

        const startType = cumDelay + 320;
        [...line.text].forEach((ch, i) => {
          schedule(() => { typedEl.textContent += ch; }, startType + i * charDelay);
        });
        const typeDuration = line.text.length * charDelay;

        schedule(() => {
          caretEl.style.display = "none";
          line.chips.forEach((c, ci) => {
            const chip = document.createElement("span");
            chip.className = "aat-chip " + c.cls;
            chip.textContent = c.txt;
            chip.style.animationDelay = (ci * 120) + "ms";
            chipsEl.appendChild(chip);
          });
        }, startType + typeDuration + 80);

        cumDelay = startType + typeDuration + 500;
      });

      schedule(() => { sumEl.classList.add("show"); }, cumDelay + 300);
      schedule(runTranscript, cumDelay + 6000);
    }
    runTranscript();

    // chat loop
    function runChat() {
      const cb = chatBodyRef.current;
      if (!cb) return;
      cb.innerHTML = "";
      let t = 400;
      chatTurns.forEach((turn) => {
        if (turn.who === "user") {
          schedule(() => {
            const b = document.createElement("div");
            b.className = "aat-bubble user";
            b.textContent = turn.text;
            cb.appendChild(b);
          }, t);
          t += 700;
        } else {
          schedule(() => {
            const tp = document.createElement("div");
            tp.className = "aat-typing";
            tp.innerHTML = "<span></span><span></span><span></span>";
            tp.dataset.tp = "1";
            cb.appendChild(tp);
          }, t);
          t += turn.delay;
          schedule(() => {
            const last = cb.querySelector('[data-tp="1"]');
            if (last) last.remove();
            const b = document.createElement("div");
            b.className = "aat-bubble ai";
            b.innerHTML = turn.html;
            cb.appendChild(b);
          }, t);
          t += 1700;
        }
      });
      schedule(runChat, t + 4000);
    }
    runChat();

    // card hover spotlight
    const cards = document.querySelectorAll<HTMLElement>(".aat-card");
    const onMove = (e: MouseEvent) => {
      const c = e.currentTarget as HTMLElement;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    };
    cards.forEach((c) => c.addEventListener("mousemove", onMove));

    return () => {
      timers.forEach((id) => clearTimeout(id));
      cards.forEach((c) => c.removeEventListener("mousemove", onMove));
    };
  }, []);

  return (
    <main className="relative">
      <div className="aat-bg" aria-hidden />

      {/* Nav */}
      <nav className="aat-nav">
        <div className="aat-nav-inner">
          <Link href="/" className="flex items-center gap-2.5 text-[14.5px] font-bold tracking-tight">
            <span className="aat-brand-dot" />
            <span>Audio Toolkit</span>
          </Link>
          <div className="aat-nav-links flex gap-1.5">
            <a href="#features" className="aat-nav-link">Features</a>
            <a href="#uses" className="aat-nav-link">Use cases</a>
            <a href="#how" className="aat-nav-link">How it works</a>
            <a href="#languages" className="aat-nav-link">Languages</a>
          </div>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link href="/sign-up" className="aat-cta">Get started — free</Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="aat-cta">Dashboard</Link>
              <UserButton appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }} />
            </Show>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-7 pt-14 pb-10 md:grid-cols-[1fr_1.05fr] md:gap-16 md:pt-14 md:pb-10">
        <div>
          <span className="aat-eyebrow mb-[22px]"><span className="pulse" />Powered by AssemblyAI · Live</span>
          <h1 className="aat-hero-title mb-[22px]">
            Turn audio into <span className="serif-i">structured</span> <span className="grad">insight.</span>
          </h1>
          <p className="mb-9 max-w-[520px] text-[18px] leading-[1.55] text-white/65">
            Transcripts, speaker diarization, sentiment, topics, summary, and Ask-Anything chat — all from one upload. No setup, no credit card. 10 minutes free, every 30 days.
          </p>
          <div className="mb-7 flex flex-wrap items-center gap-3">
            <Show when="signed-out">
              <Link href="/sign-up" className="aat-btn-primary">Try it free <span>→</span></Link>
            </Show>
            <Show when="signed-in">
              <Link href="/dashboard" className="aat-btn-primary">Open dashboard <span>→</span></Link>
            </Show>
            <a href="#features" className="aat-btn-secondary">See features ↓</a>
          </div>
          <div className="aat-meta">No credit card · Google sign-in or email OTP</div>
        </div>

        {/* Transcript demo */}
        <div className="aat-demo">
          <div className="aat-demo-bar">
            <span className="aat-dot r" /><span className="aat-dot y" /><span className="aat-dot g" />
            <span className="aat-demo-title">user-interview-q3.mp3</span>
            <span className="aat-live-pill">TRANSCRIBING</span>
          </div>
          <div className="aat-demo-body">
            <div className="aat-wave" ref={waveRef} />
            <div ref={transcriptRef} />
            <div className="aat-summary" ref={summaryRef}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c5cff" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <div>
                <div className="label">Auto-summary</div>
                Two speakers discuss the Q3 product roadmap. Key topics: launch timeline, pricing, customer feedback. Sentiment trends positive overall, with concerns around technical debt.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="uses" className="mx-auto max-w-[1200px] scroll-mt-[90px] px-7 py-12">
        <div className="aat-section-eyebrow">Built for</div>
        <h2 className="aat-h2">Anyone who turns <span className="serif-i">conversations</span> into work.</h2>
        <p className="aat-section-sub">Whatever you record — calls, interviews, lectures, meetings — the toolkit gives you the structured version, fast.</p>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
          {useCases.map((u) => (
            <div key={u.title} className="aat-use">
              <div className="aat-use-icon">{u.icon}</div>
              <h3 className="mb-1.5 text-[15px] font-bold tracking-tight">{u.title}</h3>
              <p className="text-[13.5px] leading-[1.5] text-white/60">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ask-Anything chat sim */}
      <section id="ask" className="mx-auto max-w-[1200px] scroll-mt-[90px] px-7 py-12">
        <div className="grid grid-cols-1 items-center gap-9 md:grid-cols-2 md:gap-12">
          <div>
            <div className="aat-section-eyebrow !text-left !mb-2.5">Ask anything</div>
            <h2 className="mb-3.5 text-[clamp(28px,3.6vw,44px)] font-extrabold leading-[1.1] tracking-tight">
              Chat with your <span className="serif-i bg-gradient-to-r from-[#cbb5ff] to-[#7feaff] bg-clip-text text-transparent">recordings.</span>
            </h2>
            <p className="mb-5 max-w-[480px] text-[16px] leading-[1.6] text-white/65">
              Drop in a Zoom or Google Meet recording and start asking. The Ask-Anything chat (powered by AssemblyAI Lemur + Claude) reads the entire transcript so you don&apos;t have to.
            </p>
            <ul className="aat-ask-bullets flex flex-col gap-2.5">
              <li><span className="tick">✓</span><span>Pull action items, decisions, and unresolved questions instantly.</span></li>
              <li><span className="tick">✓</span><span>Find the exact moment someone said something — with timestamps.</span></li>
              <li><span className="tick">✓</span><span>Re-ask a different question without re-watching the call.</span></li>
            </ul>
          </div>
          <div className="aat-phone-stage">
            <div className="aat-phone-glow" />
            <div className="aat-float-icon fi-1">Z</div>
            <div className="aat-float-icon fi-2">M</div>
            <div className="aat-float-icon fi-3">T</div>
            <div className="aat-float-icon fi-4">L</div>
            <div className="aat-phone">
              <div className="aat-phone-screen">
                <div className="aat-chat-header">
                  <div className="aat-ch-ico">M</div>
                  <div>
                    <div className="aat-ch-title">Q3 Roadmap call</div>
                    <div className="aat-ch-sub">Google Meet · 12 min · imported</div>
                  </div>
                </div>
                <div className="aat-chat-body" ref={chatBodyRef} />
                <div className="aat-chat-input">
                  <span>Ask anything about this recording…</span>
                  <div className="send">↑</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section id="sources" className="mx-auto max-w-[1200px] scroll-mt-[90px] px-7 py-12">
        <div className="aat-section-eyebrow">Bring your audio</div>
        <h2 className="aat-h2">From anywhere you <span className="serif-i">already record.</span></h2>
        <p className="aat-section-sub">Drop a recording from your favourite meeting tool, podcast app, or voice memo. We handle the rest.</p>
        <div className="aat-sources-wrap">
          <div className="flex flex-wrap justify-center gap-3.5">
            {sources.map((s) => (
              <span key={s.label} className="aat-source-pill">
                <span className="ico" style={{ background: s.bg }}>{s.ico}</span>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-[1200px] scroll-mt-[90px] px-7 py-12">
        <div className="aat-section-eyebrow">What you get</div>
        <h2 className="aat-h2">Six features. <span className="serif-i">One upload.</span></h2>
        <p className="aat-section-sub">Drop an audio file or record live in your browser — the toolkit handles the rest.</p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="aat-card">
              <div className="aat-card-icon">{f.icon}</div>
              <h3 className="mb-2 text-[17px] font-bold tracking-tight">{f.title}</h3>
              <p className="text-[14.5px] leading-[1.55] text-white/60">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-[1200px] scroll-mt-[90px] px-7 py-12">
        <div className="aat-section-eyebrow">How it works</div>
        <h2 className="aat-h2">Three steps. <span className="serif-i">No setup.</span></h2>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {howSteps.map((s) => (
            <div key={s.n} className="aat-card">
              <div className="aat-card-icon">{s.n}</div>
              <h3 className="mb-2 text-[17px] font-bold tracking-tight">{s.title}</h3>
              <p className="text-[14.5px] leading-[1.55] text-white/60">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="mx-auto max-w-[1200px] scroll-mt-[90px] px-7 py-12">
        <div className="aat-lang-banner">
          <div>
            <h3><span className="num">100+ languages</span>, automatic detection.</h3>
            <p className="text-[15px] leading-[1.5] text-white/70">From English and Hindi to Tamil, Spanish, Arabic, Mandarin and more — the toolkit picks up the language so you don&apos;t have to set it.</p>
          </div>
          <div className="aat-lang-chips">
            <span>English</span><span>हिन्दी</span><span>தமிழ்</span><span>Español</span><span>Français</span><span>Deutsch</span><span>العربية</span><span>中文</span><span>日本語</span><span>+93 more</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="aat-final mx-auto max-w-[1200px] px-7 pt-14 pb-20 text-center">
        <h2>Stop scrubbing audio. <span className="grad">Start reading it.</span></h2>
        <p className="mb-7 text-[17px] text-white/60">10 free minutes every 30 days. Sign in with Google or email OTP. That&apos;s it.</p>
        <Show when="signed-out">
          <Link href="/sign-up" className="aat-btn-primary text-[16px]" style={{ padding: "16px 30px" }}>Try it free <span>→</span></Link>
        </Show>
        <Show when="signed-in">
          <Link href="/dashboard" className="aat-btn-primary text-[16px]" style={{ padding: "16px 30px" }}>Open dashboard <span>→</span></Link>
        </Show>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-7 py-9 text-center text-[13.5px] text-white/50">
        Made with <span className="aat-heart">❤</span> by{" "}
        <a href="https://news.adityeah.in/" target="_blank" rel="noopener" className="aat-footer-link">Adityeah</a>
        {" · "}
        <a href="https://www.linkedin.com/in/adityacbcc/" target="_blank" rel="noopener" className="aat-footer-link">LinkedIn</a>
      </footer>
    </main>
  );
}
