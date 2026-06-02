import { HeroCarousel } from "@/components/home/hero-carousel";
import { MangaGrid } from "@/components/home/manga-grid";
import {
  fetchTrending,
  fetchTopRated,
  fetchRecentlyUpdated,
} from "@/lib/api/anilist";
import { mapAniList } from "@/lib/api/mapper";
import { mockManga } from "@/lib/mock-data";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { MangaCard } from "@/components/manga/manga-card";
import { Manga } from "@/lib/types";

export const revalidate = 3600;

async function getData() {
  try {
    const [trending, topRated, recent] = await Promise.all([
      fetchTrending(6),
      fetchTopRated(12),
      fetchRecentlyUpdated(12),
    ]);
    return {
      trending: trending.map(mapAniList),
      topRated: topRated.map(mapAniList),
      recent: recent.map(mapAniList),
    };
  } catch {
    // Fall back to mock data if API is unreachable
    const sorted = [...mockManga].sort((a, b) => b.rating - a.rating);
    return {
      trending: mockManga.filter((m) => m.isHot).slice(0, 6),
      topRated: sorted.slice(0, 12),
      recent: mockManga.slice(0, 12),
    };
  }
}

export default async function HomePage() {
  const { trending, topRated, recent } = await getData();
  const aiPicks = topRated.filter((m) => m.isAiPick).slice(0, 8);

  return (
    <div>
      <HeroCarousel manga={trending} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Recently Updated */}
        <MangaGrid
          title="Recently"
          accent="Updated"
          subtitle="Fresh Chapters"
          manga={recent}
          action={
            <Link
              href="/browse"
              className="text-xs font-heading font-semibold text-[#9490a8] hover:text-[#bb86fc] transition-colors uppercase tracking-wide"
            >
              View All →
            </Link>
          }
        />

        <div className="my-2 h-px bg-gradient-to-r from-transparent via-[#bb86fc]/20 to-transparent" />

        {/* AI Picks */}
        <AIPicksSection aiPicks={aiPicks} />

        <div className="my-2 h-px bg-gradient-to-r from-transparent via-[#bb86fc]/20 to-transparent" />

        {/* Top Rated */}
        <MangaGrid
          title="Top"
          accent="Rated"
          subtitle="Community Favorites"
          manga={topRated}
          action={
            <div className="flex items-center gap-1 text-[#9490a8] text-xs font-heading font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>AniList Score</span>
            </div>
          }
        />
      </div>
    </div>
  );
}

function AIPicksSection({ aiPicks }: { aiPicks: Manga[] }) {
  return (
    <section className="py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-heading font-semibold text-[#bb86fc] uppercase tracking-[0.2em] mb-1">
            Powered by Intelligence
          </p>
          <h2 className="font-display text-4xl text-[#f2eef8] tracking-wide leading-none">
            AI <span className="text-[#bb86fc]">Picks</span>
          </h2>
        </div>
        <Link href="/ask">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#bb86fc]/10 border border-[#bb86fc]/25 rounded-lg text-sm font-heading font-semibold text-[#bb86fc] hover:bg-[#bb86fc]/20 transition-all">
            <Sparkles className="w-3.5 h-3.5" />
            Ask CALM AI
          </button>
        </Link>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#bb86fc]/10 via-[#bb86fc]/5 to-transparent border border-[#bb86fc]/15 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#bb86fc]/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#bb86fc]" />
        </div>
        <div>
          <p className="font-heading font-semibold text-[#f2eef8] text-sm">
            CALM&apos;s AI knows your taste
          </p>
          <p className="text-[#9490a8] text-xs font-ui mt-0.5">
            Describe what you want — &quot;necromancer manhwa with good
            romance&quot; — and get instant personalized recommendations.{" "}
            <Link href="/ask" className="text-[#bb86fc] hover:underline">
              Try it now →
            </Link>
          </p>
        </div>
      </div>

      {aiPicks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {aiPicks.map((m) => (
            <div key={m.id} className="relative">
              <div className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-[#bb86fc] rounded-full flex items-center justify-center shadow-lg shadow-[#bb86fc]/30 pointer-events-none">
                <Sparkles className="w-2.5 h-2.5 text-black" />
              </div>
              <MangaCard manga={m} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#5a5670] text-sm font-ui">
          No AI picks available right now.
        </p>
      )}
    </section>
  );
}
