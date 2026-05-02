import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
        baseTheme: dark,
        variables: {
          colorPrimary: "#7c5cff",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary:
            "bg-gradient-to-br from-[#7c5cff] to-[#00d4ff] hover:from-[#8a6dff] hover:to-[#1ddcff] text-white",
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
