import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audio Analysis Toolkit — AI-powered transcription, sentiment & topics",
  description:
    "Transcribe, analyze, and chat with any audio. Speaker labels, sentiment, topic detection, and an Ask-Anything chatbot — powered by AssemblyAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#7c5cff",
          colorBackground: "#15102b",
          colorInputBackground: "#1a1438",
          colorInputText: "#ffffff",
          colorText: "#ffffff",
          colorTextSecondary: "rgba(255,255,255,0.65)",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-[#15102b] border border-white/10 shadow-2xl shadow-purple-950/40",
          headerTitle: "text-white",
          headerSubtitle: "text-white/70",
          socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
          formButtonPrimary:
            "bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] hover:from-[#8a6dff] hover:to-[#1ddcff]",
          footerActionText: "text-white/60",
          footerActionLink: "text-[#b5a8ff] hover:text-white",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full bg-[#0c0a17] text-white">{children}</body>
      </html>
    </ClerkProvider>
  );
}
