"use client";

import { useState, useOptimistic, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
  LayoutGrid,
  List,
  Minus,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { LibraryEntry, ReadingStatus } from "@/lib/types";
import { StatusBadge } from "@/components/manga/status-badge";
import {
  updateProgress,
  removeFromLibrary,
} from "@/lib/actions/library";

const TAB_CONFIG: {
  key: ReadingStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { key: "reading", label: "Reading", icon: BookOpen, color: "#bb86fc" },
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "#4ade80" },
  { key: "on-hold", label: "On Hold", icon: PauseCircle, color: "#fbbf24" },
  { key: "dropped", label: "Dropped", icon: XCircle, color: "#f87171" },
  { key: "plan-to-read", label: "Plan to Read", icon: Clock, color: "#818cf8" },
];

interface Props {
  initialLibrary: LibraryEntry[];
}

export function LibraryClient({ initialLibrary }: Props) {
  const [activeTab, setActiveTab] = useState<ReadingStatus>("reading");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [library, setLibrary] = useState(initialLibrary);
  const [, startTransition] = useTransition();

  const filtered = library.filter((e) => e.status === activeTab);

  const handleProgressUpdate = (mangaId: string, delta: number) => {
    setLibrary((prev) =>
      prev.map((e) => {
        if (e.mangaId !== mangaId) return e;
        const next = Math.max(0, Math.min(e.manga.chapters, e.progress + delta));
        startTransition(() => { void updateProgress(mangaId, next); });
        return { ...e, progress: next };
      })
    );
  };

  const handleRemove = (mangaId: string) => {
    setLibrary((prev) => prev.filter((e) => e.mangaId !== mangaId));
    startTransition(() => { void removeFromLibrary(mangaId); });
  };

  return (
    <>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {TAB_CONFIG.map(({ key, label, icon: Icon, color }) => {
            const count = library.filter((e) => e.status === key).length;
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-heading font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "text-[#0c0c12]"
                    : "text-[#9490a8] bg-[#13131a] hover:bg-[#1a1a25] hover:text-[#f2eef8]"
                }`}
                style={active ? { backgroundColor: color } : {}}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {label}
                <span
                  className={`text-xs px-1 rounded ${active ? "bg-black/20" : "bg-white/5 text-[#5a5670]"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 bg-[#13131a] border border-white/5 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={`w-7 h-7 flex items-center justify-center rounded transition-all ${viewMode === "list" ? "bg-[#bb86fc]/20 text-[#bb86fc]" : "text-[#5a5670] hover:text-[#9490a8]"}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`w-7 h-7 flex items-center justify-center rounded transition-all ${viewMode === "grid" ? "bg-[#bb86fc]/20 text-[#bb86fc]" : "text-[#5a5670] hover:text-[#9490a8]"}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Entries */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {filtered.length === 0 ? (
            <EmptyState status={activeTab} />
          ) : viewMode === "list" ? (
            <div className="flex flex-col gap-2">
              {filtered.map((entry, i) => (
                <LibraryListRow
                  key={entry.mangaId}
                  entry={entry}
                  index={i}
                  onProgress={handleProgressUpdate}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {filtered.map((entry) => (
                <LibraryGridCard
                  key={entry.mangaId}
                  entry={entry}
                  onProgress={handleProgressUpdate}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function EmptyState({ status }: { status: ReadingStatus }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-[#1a1a25] flex items-center justify-center mb-4">
        <BookOpen className="w-8 h-8 text-[#5a5670]" />
      </div>
      <p className="font-heading font-semibold text-[#9490a8]">
        Nothing {status === "plan-to-read" ? "planned" : `${status} yet`}
      </p>
      <p className="text-[#5a5670] text-sm font-ui mt-1">
        Find something on the homepage and add it here
      </p>
      <Link
        href="/"
        className="mt-4 px-5 py-2 bg-[#bb86fc]/10 border border-[#bb86fc]/25 rounded-lg text-sm font-heading font-semibold text-[#bb86fc] hover:bg-[#bb86fc]/20 transition-all"
      >
        Discover Manhwa
      </Link>
    </div>
  );
}

function LibraryListRow({
  entry,
  index,
  onProgress,
  onRemove,
}: {
  entry: LibraryEntry;
  index: number;
  onProgress: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  const { manga, progress } = entry;
  const pct = manga.chapters > 0 ? Math.round((progress / manga.chapters) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 p-3 rounded-xl bg-[#13131a] border border-white/5 hover:border-white/10 transition-all group"
    >
      <Link href={`/manga/${manga.id}`} className="shrink-0">
        <div className="relative w-12 h-16 rounded-lg overflow-hidden">
          <Image
            src={manga.coverImage}
            alt={manga.title}
            fill
            sizes="48px"
            className="object-cover group-hover:brightness-110 transition-all"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/manga/${manga.id}`}>
            <h3 className="font-heading font-bold text-[#f2eef8] text-sm hover:text-[#bb86fc] transition-colors">
              {manga.title}
            </h3>
          </Link>
          <StatusBadge status={manga.status} />
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs font-ui text-[#9490a8]">{manga.author}</span>
          {manga.rating > 0 && (
            <span className="flex items-center gap-0.5 text-xs font-ui text-[#9490a8]">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              {manga.rating.toFixed(1)}
            </span>
          )}
        </div>
        {manga.chapters > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-[#252535] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#bb86fc] rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-ui text-[#5a5670] shrink-0">
              {pct}%
            </span>
          </div>
        )}
      </div>

      {/* Progress controls */}
      {manga.chapters > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onProgress(manga.id, -1)}
            className="w-7 h-7 rounded-lg bg-[#1a1a25] border border-white/5 flex items-center justify-center text-[#9490a8] hover:text-[#f2eef8] hover:bg-[#252535] transition-all"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-heading font-semibold text-[#f2eef8] text-sm min-w-[80px] text-center">
            Ch.{" "}
            <span className="text-[#bb86fc]">{progress}</span>
            <span className="text-[#5a5670]"> / {manga.chapters}</span>
          </span>
          <button
            onClick={() => onProgress(manga.id, 1)}
            className="w-7 h-7 rounded-lg bg-[#1a1a25] border border-white/5 flex items-center justify-center text-[#9490a8] hover:text-[#bb86fc] hover:bg-[#252535] transition-all"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Remove */}
      <button
        onClick={() => onRemove(manga.id)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5a5670] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

function LibraryGridCard({
  entry,
  onProgress,
}: {
  entry: LibraryEntry;
  onProgress: (id: string, delta: number) => void;
}) {
  const { manga, progress } = entry;
  const pct = manga.chapters > 0 ? Math.round((progress / manga.chapters) * 100) : 0;

  return (
    <div className="group">
      <Link href={`/manga/${manga.id}`}>
        <div
          className="relative overflow-hidden rounded-xl mb-2 cursor-pointer"
          style={{ aspectRatio: "2/3" }}
        >
          <Image
            src={manga.coverImage}
            alt={manga.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 14vw"
            className="object-cover transition-all duration-500 group-hover:brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
          <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-2 group-hover:ring-[#bb86fc]/40 transition-all" />
          {manga.chapters > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#252535]">
              <div
                className="h-full bg-[#bb86fc] transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
        </div>
      </Link>
      <h3 className="font-heading font-semibold text-[#f2eef8] text-xs leading-snug line-clamp-1 mb-1">
        {manga.title}
      </h3>
      {manga.chapters > 0 && (
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => onProgress(manga.id, -1)}
            className="w-6 h-6 rounded bg-[#1a1a25] border border-white/5 flex items-center justify-center text-[#9490a8] hover:text-[#f2eef8] transition-all"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>
          <span className="text-[10px] font-ui text-[#9490a8] text-center">
            {progress}/{manga.chapters}
          </span>
          <button
            onClick={() => onProgress(manga.id, 1)}
            className="w-6 h-6 rounded bg-[#1a1a25] border border-white/5 flex items-center justify-center text-[#9490a8] hover:text-[#bb86fc] transition-all"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}
