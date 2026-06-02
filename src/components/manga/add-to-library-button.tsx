"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Check,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { addToLibrary, updateStatus, removeFromLibrary } from "@/lib/actions/library";
import { Manga, ReadingStatus } from "@/lib/types";

const STATUS_OPTIONS: { key: ReadingStatus; label: string; icon: React.ElementType; color: string }[] = [
  { key: "reading", label: "Reading", icon: BookOpen, color: "#bb86fc" },
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "#4ade80" },
  { key: "on-hold", label: "On Hold", icon: PauseCircle, color: "#fbbf24" },
  { key: "dropped", label: "Dropped", icon: XCircle, color: "#f87171" },
  { key: "plan-to-read", label: "Plan to Read", icon: Clock, color: "#818cf8" },
];

interface Props {
  manga: Manga;
}

export function AddToLibraryButton({ manga }: Props) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<ReadingStatus | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      const { data: row } = await supabase
        .from("library")
        .select("status")
        .eq("user_id", data.user.id)
        .eq("series_id", manga.id)
        .maybeSingle();
      setCurrentStatus((row?.status as ReadingStatus) ?? null);
      setLoading(false);
    });
  }, [manga.id]);

  const handleAdd = async (status: ReadingStatus) => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) { router.push("/auth/login"); return; }

    setCurrentStatus(status);
    setDropdownOpen(false);
    startTransition(() => { void addToLibrary(manga, status); });
  };

  const handleStatusChange = (status: ReadingStatus) => {
    setCurrentStatus(status);
    setDropdownOpen(false);
    startTransition(() => { void updateStatus(manga.id, status); });
  };

  const handleRemove = () => {
    setCurrentStatus(null);
    setDropdownOpen(false);
    startTransition(() => { void removeFromLibrary(manga.id); });
  };

  if (loading) {
    return (
      <div className="w-36 h-10 rounded-lg bg-[#13131a] border border-white/10 animate-pulse" />
    );
  }

  const activeOption = STATUS_OPTIONS.find((o) => o.key === currentStatus);

  return (
    <div className="relative">
      {currentStatus ? (
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border font-heading font-semibold text-sm transition-all"
          style={{
            backgroundColor: `${activeOption?.color}20`,
            borderColor: `${activeOption?.color}40`,
            color: activeOption?.color,
          }}
        >
          <Check className="w-4 h-4" />
          {activeOption?.label}
          <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
        </button>
      ) : (
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#bb86fc] text-[#0c0c12] font-heading font-bold text-sm rounded-lg hover:bg-[#c99ffc] transition-all hover:shadow-[0_0_20px_rgba(187,134,252,0.4)]"
        >
          <Plus className="w-4 h-4" />
          Add to Library
        </button>
      )}

      <AnimatePresence>
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-full mt-2 w-48 z-50 glass-surface rounded-xl overflow-hidden py-1 shadow-xl shadow-black/50"
            >
              {STATUS_OPTIONS.map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() =>
                    currentStatus ? handleStatusChange(key) : handleAdd(key)
                  }
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-heading font-medium hover:bg-white/5 transition-all"
                  style={{ color: currentStatus === key ? color : "#9490a8" }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                  {label}
                  {currentStatus === key && (
                    <Check className="w-3 h-3 ml-auto" style={{ color }} />
                  )}
                </button>
              ))}
              {currentStatus && (
                <>
                  <div className="h-px bg-white/5 my-1" />
                  <button
                    onClick={handleRemove}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-heading font-medium text-[#f87171] hover:bg-[#f87171]/10 transition-all"
                  >
                    Remove from Library
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
