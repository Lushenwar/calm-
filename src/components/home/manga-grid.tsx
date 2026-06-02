"use client";

import { motion } from "framer-motion";
import { Manga } from "@/lib/types";
import { MangaCard } from "@/components/manga/manga-card";
import { SectionHeader } from "./section-header";

interface MangaGridProps {
  title: string;
  subtitle?: string;
  accent?: string;
  manga: Manga[];
  action?: React.ReactNode;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export function MangaGrid({
  title,
  subtitle,
  accent,
  manga,
  action,
}: MangaGridProps) {
  return (
    <section className="py-10">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        accent={accent}
        action={action}
      />
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {manga.map((m, i) => (
          <motion.div key={m.id} variants={itemVariants}>
            <MangaCard manga={m} priority={i < 6} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
