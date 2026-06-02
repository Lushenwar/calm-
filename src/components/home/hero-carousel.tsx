"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Sparkles, Plus } from "lucide-react";
import { Manga } from "@/lib/types";
import { StatusBadge } from "@/components/manga/status-badge";

interface HeroCarouselProps {
  manga: Manga[];
}

export function HeroCarousel({ manga }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % manga.length);
  }, [manga.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + manga.length) % manga.length);
  }, [manga.length]);

  useEffect(() => {
    const id = setInterval(goNext, 6000);
    return () => clearInterval(id);
  }, [goNext]);

  const active = manga[current];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      transition: { duration: 0.35 },
    }),
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "68vh", minHeight: 520 }}>
      {/* Blurred background image */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${current}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          <Image
            src={active.coverImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{
              filter: "blur(48px) brightness(0.25) saturate(1.8)",
              transform: "scale(1.1)",
            }}
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c12] via-[#0c0c12]/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c12]/30 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center gap-10 lg:gap-16">
        {/* Text content */}
        <div className="flex-1 max-w-xl lg:max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`content-${current}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              {/* Top badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-heading font-semibold text-[#bb86fc] uppercase tracking-[0.2em]">
                  Trending #{current + 1}
                </span>
                <span className="text-[#5a5670]">·</span>
                <StatusBadge status={active.status} size="md" />
                {active.isAiPick && (
                  <span className="flex items-center gap-1 bg-[#bb86fc]/15 text-[#bb86fc] text-xs font-heading font-semibold px-2 py-0.5 rounded-full border border-[#bb86fc]/25">
                    <Sparkles className="w-3 h-3" />
                    AI Pick
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-none tracking-wide">
                {active.title}
              </h1>

              {/* Meta row */}
              <div className="flex items-center gap-4 text-sm font-ui">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">{active.rating.toFixed(1)}</span>
                </span>
                <span className="text-[#9490a8]">{active.chapters} chapters</span>
                <span className="text-[#9490a8]">{active.year}</span>
                <span className="text-[#9490a8] hidden sm:block">
                  by <span className="text-[#f2eef8]">{active.author}</span>
                </span>
              </div>

              {/* Synopsis */}
              <p className="text-[#9490a8] font-ui text-sm leading-relaxed line-clamp-3 max-w-lg">
                {active.synopsis}
              </p>

              {/* Genre chips */}
              <div className="flex flex-wrap gap-2">
                {active.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-white/5 rounded-full text-xs font-heading font-medium text-[#f2eef8]/70 border border-white/10 hover:border-[#bb86fc]/40 hover:text-[#bb86fc] transition-all cursor-pointer"
                  >
                    {g}
                  </span>
                ))}
                {active.themes.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 bg-white/5 rounded-full text-xs font-heading font-medium text-[#9490a8] border border-white/10"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex gap-3 pt-2">
                <Link href={`/manga/${active.id}`}>
                  <button className="px-6 py-2.5 bg-[#bb86fc] text-[#0c0c12] font-heading font-bold text-sm rounded-lg hover:bg-[#c99ffc] transition-all hover:shadow-[0_0_24px_rgba(187,134,252,0.4)] active:scale-95">
                    View Details
                  </button>
                </Link>
                <Link href="/library">
                  <button className="flex items-center gap-1.5 px-5 py-2.5 bg-white/5 text-white font-heading font-medium text-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all active:scale-95">
                    <Plus className="w-4 h-4" />
                    Add to Library
                  </button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Cover thumbnail */}
        <div className="hidden lg:block shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`cover-${current}`}
              initial={{ opacity: 0, x: 30, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="relative w-52 xl:w-60 rounded-2xl overflow-hidden"
              style={{
                aspectRatio: "2/3",
                boxShadow:
                  "0 40px 80px -20px rgba(0,0,0,0.9), 0 0 60px rgba(187,134,252,0.15)",
              }}
            >
              <Image
                src={active.coverImage}
                alt={active.title}
                fill
                sizes="(max-width: 1024px) 0px, 260px"
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 items-center">
        {manga.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 bg-[#bb86fc]"
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Arrow controls */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-[#bb86fc]/20 hover:border-[#bb86fc]/40 transition-all"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-[#bb86fc]/20 hover:border-[#bb86fc]/40 transition-all"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
