"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Sparkles, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Manga } from "@/lib/types";
import { StatusBadge } from "./status-badge";

interface MangaCardProps {
  manga: Manga;
  priority?: boolean;
}

export function MangaCard({ manga, priority = false }: MangaCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="group cursor-pointer relative"
    >
      <Link href={`/manga/${manga.id}`}>
        <div
          className="relative overflow-hidden rounded-xl"
          style={{ aspectRatio: "2/3" }}
        >
          {/* Cover image */}
          <Image
            src={manga.coverImage}
            alt={manga.title}
            fill
            className="object-cover transition-all duration-500 group-hover:brightness-110 group-hover:saturate-110"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 14vw"
            priority={priority}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

          {/* Glow ring on hover */}
          <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-2 group-hover:ring-[#bb86fc]/40 transition-all duration-300" />

          {/* Top badges */}
          <div className="absolute top-2 right-2">
            <StatusBadge status={manga.status} />
          </div>

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {/* Rating */}
            <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-heading font-bold text-white leading-none">
                {manga.rating.toFixed(1)}
              </span>
            </div>

            {/* Hot badge */}
            {manga.isHot && (
              <div className="flex items-center gap-0.5 bg-[#e64980] rounded px-1.5 py-0.5">
                <Flame className="w-2 h-2 text-white" />
                <span className="text-[9px] font-heading font-bold text-white uppercase leading-none">
                  Hot
                </span>
              </div>
            )}

            {/* AI Pick */}
            {manga.isAiPick && !manga.isHot && (
              <div className="flex items-center gap-0.5 bg-[#bb86fc] rounded px-1.5 py-0.5">
                <Sparkles className="w-2 h-2 text-black" />
                <span className="text-[9px] font-heading font-bold text-black uppercase leading-none">
                  AI
                </span>
              </div>
            )}
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <h3 className="font-heading font-bold text-white text-xs leading-snug line-clamp-2 group-hover:text-[#bb86fc] transition-colors">
              {manga.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[#9490a8] text-[10px] font-ui">
                Ch. {manga.chapters}
              </span>
              <span className="w-0.5 h-0.5 rounded-full bg-[#5a5670]" />
              <span className="text-[#9490a8] text-[10px] font-ui">
                {manga.year}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
