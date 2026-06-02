"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Star,
  CornerDownLeft,
  Bot,
  User as UserIcon,
} from "lucide-react";
import { ChatMessage, Manga } from "@/lib/types";

const EXAMPLE_PROMPTS = [
  "Dungeon manhwa where the MC is a necromancer with good romance",
  "Something like Solo Leveling but the MC isn't overpowered at first",
  "Wuxia / martial arts manhwa with a cold assassin protagonist",
  "Completed manhwa with time travel and magic academy",
  "Funny manhwa with action, not too serious",
];

async function fetchSuggestions(query: string): Promise<Manga[]> {
  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function buildAIResponse(query: string, suggestions: Manga[]): string {
  if (suggestions.length === 0) {
    return `I searched AniList's manhwa database for "${query}" but didn't find strong matches. Try different keywords — mention genres, themes, or a series you already like.`;
  }
  return `Based on "${query}", here are my top picks from the AniList manhwa database. These matched your themes and style:`;
}

export default function AskPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey! I'm CALM AI — your personal manhwa sommelier. Describe the kind of story you're craving: themes, vibes, must-haves or deal-breakers. I'll find what you're looking for.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsLoading(true);

    // Real AniList search — concurrent with a short UX delay
    const [suggestions] = await Promise.all([
      fetchSuggestions(text),
      new Promise((r) => setTimeout(r, 800)),
    ]);
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: buildAIResponse(text, suggestions),
      suggestions,
      timestamp: new Date(),
    };

    setMessages((p) => [...p, aiMsg]);
    setIsLoading(false);
  };

  const handleSubmit = () => sendMessage(input);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col" style={{ minHeight: "calc(100vh - 64px - 73px)" }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#bb86fc]/15 border border-[#bb86fc]/25 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-[#bb86fc]" />
        </div>
        <h1 className="font-display text-5xl text-[#f2eef8] tracking-wide leading-none mb-2">
          Ask <span className="text-[#bb86fc]">CALM</span>
        </h1>
        <p className="text-[#9490a8] font-ui text-sm max-w-md mx-auto">
          Describe your perfect manhwa in natural language. Powered by semantic
          search over the CALM database.
        </p>
      </div>

      {/* Example prompts — only shown before first user message */}
      {messages.length === 1 && (
        <div className="mb-6">
          <p className="text-xs font-heading font-semibold text-[#5a5670] uppercase tracking-wider mb-3 text-center">
            Try asking
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="px-3 py-1.5 bg-[#13131a] border border-white/8 rounded-full text-xs font-ui text-[#9490a8] hover:text-[#f2eef8] hover:border-[#bb86fc]/30 hover:bg-[#1a1a25] transition-all text-left"
              >
                &quot;{p}&quot;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 flex flex-col gap-4 mb-6 overflow-y-auto">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                  msg.role === "assistant"
                    ? "bg-[#bb86fc]/20 border border-[#bb86fc]/30"
                    : "bg-[#1a1a25] border border-white/10"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="w-4 h-4 text-[#bb86fc]" />
                ) : (
                  <UserIcon className="w-4 h-4 text-[#9490a8]" />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl text-sm font-ui leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#bb86fc]/15 border border-[#bb86fc]/20 text-[#f2eef8] rounded-tr-sm"
                      : "bg-[#13131a] border border-white/5 text-[#9490a8] rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>

                {/* Suggestions grid */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    {msg.suggestions.map((m) => (
                      <SuggestionCard key={m.id} manga={m} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#bb86fc]/20 border border-[#bb86fc]/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#bb86fc]" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#13131a] border border-white/5 flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#bb86fc]/60"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="relative">
        <div className="flex items-end gap-3 p-3 bg-[#13131a] border border-white/8 rounded-2xl focus-within:border-[#bb86fc]/40 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your perfect manhwa..."
            rows={1}
            className="flex-1 bg-transparent text-[#f2eef8] font-ui text-sm placeholder-[#5a5670] outline-none resize-none leading-relaxed"
            style={{ maxHeight: 120 }}
          />
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-ui text-[#5a5670]">
              <CornerDownLeft className="w-3 h-3" />
              Enter
            </span>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-xl bg-[#bb86fc] flex items-center justify-center text-[#0c0c12] hover:bg-[#c99ffc] disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_16px_rgba(187,134,252,0.4)] active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] font-ui text-[#5a5670] mt-2">
          CALM AI uses semantic search — results improve with a real vector
          database
        </p>
      </div>
    </div>
  );
}

function SuggestionCard({ manga }: { manga: Manga }) {
  return (
    <Link href={`/manga/${manga.id}`}>
      <div className="group cursor-pointer">
        <div
          className="relative overflow-hidden rounded-xl mb-1.5"
          style={{ aspectRatio: "2/3" }}
        >
          <Image
            src={manga.coverImage}
            alt={manga.title}
            fill
            sizes="(max-width: 640px) 45vw, 150px"
            className="object-cover transition-all duration-300 group-hover:brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-2 group-hover:ring-[#bb86fc]/40 transition-all" />
          <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded px-1 py-0.5">
            <Star className="w-2 h-2 text-yellow-400 fill-yellow-400" />
            <span className="text-[9px] font-heading font-bold text-white">
              {manga.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <h4 className="font-heading font-bold text-[#f2eef8] text-[11px] leading-snug line-clamp-2 group-hover:text-[#bb86fc] transition-colors">
          {manga.title}
        </h4>
        <p className="text-[10px] font-ui text-[#5a5670] mt-0.5 line-clamp-1">
          {manga.genres.slice(0, 2).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
