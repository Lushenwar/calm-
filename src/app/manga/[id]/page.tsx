import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, BookOpen, Calendar, User, Palette, ExternalLink } from "lucide-react";
import { fetchByID, fetchTopRated } from "@/lib/api/anilist";
import { searchByTitle } from "@/lib/api/mangaupdates";
import { mapAniList } from "@/lib/api/mapper";
import { StatusBadge } from "@/components/manga/status-badge";
import { MangaCard } from "@/components/manga/manga-card";
import { AddToLibraryButton } from "@/components/manga/add-to-library-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export default async function MangaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) notFound();

  const [raw, topRaw] = await Promise.all([
    fetchByID(numId),
    fetchTopRated(7),
  ]);

  if (!raw) notFound();

  const manga = mapAniList(raw);

  // Fetch MangaUpdates rating in parallel (best-effort, non-blocking)
  const muRecord = await searchByTitle(manga.title);
  if (muRecord?.bayesian_rating) {
    manga.ratings.mangaupdates = parseFloat(
      (muRecord.bayesian_rating).toFixed(1)
    );
    // Recalculate blended score with MU rating
  }

  const related = topRaw
    .map(mapAniList)
    .filter((m) => m.id !== manga.id)
    .slice(0, 6);

  const ratingEntries: Array<{ label: string; key: keyof typeof manga.ratings; maxVal: number }> = [
    { label: "AniList", key: "anilist", maxVal: 10 },
    { label: "MAL", key: "mal", maxVal: 10 },
    { label: "MangaUpdates", key: "mangaupdates", maxVal: 10 },
    { label: "Webtoon", key: "webtoon", maxVal: 10 },
  ];

  const ratingValues = Object.values(manga.ratings).filter(
    (v): v is number => v != null && v > 0
  );
  const blendedScore =
    ratingValues.length > 0
      ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
      : manga.rating;

  return (
    <div>
      {/* Banner */}
      <div className="relative w-full overflow-hidden" style={{ height: 360 }}>
        <Image
          src={raw.bannerImage ?? manga.coverImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{
            filter: raw.bannerImage
              ? "brightness(0.35) saturate(1.4)"
              : "blur(40px) brightness(0.2) saturate(1.6)",
            transform: raw.bannerImage ? "none" : "scale(1.1)",
          }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-[#0c0c12]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c12]/80 to-transparent" />

        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-0">
          <div className="flex items-end gap-6">
            <div
              className="relative shrink-0 rounded-xl overflow-hidden shadow-2xl -mb-16"
              style={{
                width: 140,
                height: 200,
                boxShadow:
                  "0 30px 60px -10px rgba(0,0,0,0.9), 0 0 40px rgba(187,134,252,0.1)",
              }}
            >
              <Image
                src={manga.coverImage}
                alt={manga.title}
                fill
                sizes="140px"
                className="object-cover"
                priority
              />
            </div>
            <div className="pb-5">
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge status={manga.status} size="md" />
                {manga.isHot && (
                  <span className="text-xs font-heading font-bold text-[#e64980] uppercase tracking-wide">
                    🔥 Hot
                  </span>
                )}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide leading-none mb-2">
                {manga.title}
              </h1>
              <div className="flex items-center gap-4 text-sm font-ui text-[#9490a8] flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {manga.author}
                </span>
                {manga.year > 0 && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {manga.year}
                  </span>
                )}
                {manga.chapters > 0 && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {manga.chapters} chapters
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left */}
          <div className="lg:col-span-2 space-y-8">
            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <AddToLibraryButton manga={manga} />
              <a
                href={`https://anilist.co/manga/${raw.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="flex items-center gap-1.5 px-5 py-2.5 bg-[#13131a] border border-white/10 text-[#9490a8] font-heading font-medium text-sm rounded-lg hover:bg-[#1a1a25] hover:text-[#f2eef8] transition-all">
                  <ExternalLink className="w-3.5 h-3.5" />
                  AniList
                </button>
              </a>
              {muRecord && (
                <a
                  href={muRecord.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="flex items-center gap-1.5 px-5 py-2.5 bg-[#13131a] border border-white/10 text-[#9490a8] font-heading font-medium text-sm rounded-lg hover:bg-[#1a1a25] hover:text-[#f2eef8] transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                    MangaUpdates
                  </button>
                </a>
              )}
            </div>

            {/* Synopsis */}
            {manga.synopsis && (
              <div>
                <h2 className="font-display text-2xl text-[#f2eef8] tracking-wide mb-3">
                  Synopsis
                </h2>
                <p className="text-[#9490a8] font-ui text-sm leading-relaxed">
                  {manga.synopsis}
                </p>
              </div>
            )}

            {/* Tags */}
            {(manga.genres.length > 0 || manga.themes.length > 0) && (
              <div>
                <h2 className="font-display text-2xl text-[#f2eef8] tracking-wide mb-3">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {manga.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1.5 bg-[#bb86fc]/10 border border-[#bb86fc]/20 rounded-full text-xs font-heading font-semibold text-[#bb86fc]"
                    >
                      {g}
                    </span>
                  ))}
                  {manga.themes.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-heading font-medium text-[#9490a8]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Staff */}
            <div>
              <h2 className="font-display text-2xl text-[#f2eef8] tracking-wide mb-3">
                Staff
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#13131a] border border-white/5">
                  <p className="text-[10px] font-heading font-semibold text-[#5a5670] uppercase tracking-wider mb-1">
                    Author
                  </p>
                  <p className="font-heading font-semibold text-[#f2eef8] text-sm flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#bb86fc]" />
                    {manga.author}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#13131a] border border-white/5">
                  <p className="text-[10px] font-heading font-semibold text-[#5a5670] uppercase tracking-wider mb-1">
                    Artist
                  </p>
                  <p className="font-heading font-semibold text-[#f2eef8] text-sm flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#bb86fc]" />
                    {manga.artist}
                  </p>
                </div>
              </div>
            </div>

            {/* MangaUpdates alt titles */}
            {muRecord?.associated && muRecord.associated.length > 1 && (
              <div>
                <h2 className="font-display text-2xl text-[#f2eef8] tracking-wide mb-3">
                  Alternative Titles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {muRecord.associated.slice(0, 8).map((a) => (
                    <span
                      key={a.title}
                      className="px-3 py-1.5 bg-[#13131a] border border-white/5 rounded-lg text-xs font-ui text-[#9490a8]"
                    >
                      {a.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Ratings */}
          <div className="space-y-6">
            {/* Blended score */}
            <div className="p-5 rounded-2xl bg-[#13131a] border border-white/5">
              <p className="text-xs font-heading font-semibold text-[#5a5670] uppercase tracking-wider mb-3">
                Blended Score
              </p>
              <div className="flex items-end gap-3 mb-4">
                <span className="font-display text-6xl text-[#bb86fc] leading-none">
                  {blendedScore.toFixed(1)}
                </span>
                <div className="mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${blendedScore / 2 >= s ? "text-yellow-400 fill-yellow-400" : "text-[#252535]"}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-ui text-[#5a5670] mt-0.5">
                    out of 10
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {ratingEntries.map(({ label, key }) => {
                  const val = manga.ratings[key];
                  if (!val) return null;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-ui text-[#9490a8]">
                          {label}
                        </span>
                        <span className="text-xs font-heading font-bold text-[#f2eef8]">
                          {val.toFixed(1)}
                        </span>
                      </div>
                      <div className="h-1 bg-[#252535] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#bb86fc] to-[#e040fb] rounded-full transition-all"
                          style={{ width: `${(val / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats */}
            <div className="p-5 rounded-2xl bg-[#13131a] border border-white/5 space-y-3">
              <p className="text-xs font-heading font-semibold text-[#5a5670] uppercase tracking-wider">
                Series Info
              </p>
              {[
                { label: "Status", value: manga.status },
                ...(manga.chapters > 0
                  ? [{ label: "Chapters", value: manga.chapters.toString() }]
                  : []),
                ...(manga.year > 0
                  ? [{ label: "Year", value: manga.year.toString() }]
                  : []),
                ...(manga.genres.length > 0
                  ? [{ label: "Genres", value: manga.genres.slice(0, 2).join(", ") }]
                  : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-xs font-ui text-[#9490a8]">{label}</span>
                  <span className="text-xs font-heading font-semibold text-[#f2eef8] capitalize">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-3xl text-[#f2eef8] tracking-wide mb-6">
              You Might <span className="text-[#bb86fc]">Also Like</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {related.map((m) => (
                <MangaCard key={m.id} manga={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
